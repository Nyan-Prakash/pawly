// ─────────────────────────────────────────────────────────────────────────────
// useLiveAiTrainerSession
//
// Orchestrates the Live AI Trainer loop:
//   camera frame → resize/compress → Edge Function → validated response →
//   speech / haptics / auto-rep / fallback.
//
// Design notes
//   • All mutable orchestration state lives in refs so the sampling loop never
//     sees a stale closure.  React state is only used for what the UI renders.
//   • Pure logic (parsing, rate limiting, fallback streaks, summary) lives in
//     lib/liveCoach/liveAiTrainerLogic.ts and is unit-tested there.
//   • Sampling pauses automatically when the app is backgrounded and while a
//     request is in flight, so requests never overlap.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Speech from 'expo-speech';

import { supabase } from '@/lib/supabase';
import type { Protocol } from '@/constants/protocols';
import {
  type LiveAiTrainerRequest,
  type LiveAiTrainerResponse,
  type LiveAiTrainerStatus,
  type LiveAiTrainerSummary,
  type SamplingMode,
  LIVE_AI_TRAINER_CONFIG,
} from '@/lib/liveCoach/liveAiTrainerTypes';
import {
  createFallbackTracker,
  createRateLimiter,
  createSummaryAggregator,
  describeError,
  parseLiveAiTrainerResponse,
  pushHistory,
  type FallbackReason,
  type HistoryEntry,
  type LiveAiTrainerErrorKind,
} from '@/lib/liveCoach/liveAiTrainerLogic';

export interface LiveAiTrainerError {
  kind: LiveAiTrainerErrorKind;
  message: string;
}

interface UseLiveAiTrainerSessionParams {
  protocol: Protocol;
  dogId: string;
  planId: string;
  sessionId: string;
  currentStepIndex: number;
  /** Live rep count from the session store, sent to the model for context. */
  repCount: number;
  /** Called when the model is highly confident a rep was completed. */
  onAutoRep?: () => void;
  /** Called once when the trainer decides it can no longer see well enough. */
  onFallback?: (reason: FallbackReason) => void;
}

export function useLiveAiTrainerSession({
  protocol,
  dogId,
  planId,
  sessionId,
  currentStepIndex,
  repCount,
  onAutoRep,
  onFallback,
}: UseLiveAiTrainerSessionParams) {
  const cameraRef = useRef<Camera>(null);

  // ── Rendered state ────────────────────────────────────────────────────────
  const [status, setStatusState] = useState<LiveAiTrainerStatus>('idle');
  const [lastResponse, setLastResponse] = useState<LiveAiTrainerResponse | null>(null);
  const [error, setError] = useState<LiveAiTrainerError | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [fallbackReason, setFallbackReason] = useState<FallbackReason | null>(null);

  // ── Orchestration refs (never stale) ──────────────────────────────────────
  const statusRef = useRef<LiveAiTrainerStatus>('idle');
  const runningRef = useRef(false);
  const inFlightRef = useRef(false);
  const appActiveRef = useRef(AppState.currentState === 'active');
  const speechEnabledRef = useRef(true);
  const lastAutoRepAtRef = useRef(0);
  const historyRef = useRef<HistoryEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rateLimiter = useRef(createRateLimiter()).current;
  const fallbackTracker = useRef(createFallbackTracker()).current;
  const summary = useRef(createSummaryAggregator()).current;

  // Latest props for the loop to read without re-subscribing.
  const paramsRef = useRef({ protocol, dogId, planId, sessionId, currentStepIndex, repCount, onAutoRep, onFallback });
  paramsRef.current = { protocol, dogId, planId, sessionId, currentStepIndex, repCount, onAutoRep, onFallback };

  const setStatus = useCallback((next: LiveAiTrainerStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);
  const currentStatus = (): LiveAiTrainerStatus => statusRef.current;

  // ── Speech ────────────────────────────────────────────────────────────────

  const speak = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        if (!speechEnabledRef.current || !text) return resolve();
        Speech.stop();
        Speech.speak(text, {
          rate: 1.0,
          pitch: 1.0,
          onDone: () => resolve(),
          onStopped: () => resolve(),
          onError: () => resolve(),
        });
      }),
    []
  );

  const toggleSpeech = useCallback(() => {
    setSpeechEnabled((prev) => {
      const next = !prev;
      speechEnabledRef.current = next;
      if (!next) Speech.stop();
      return next;
    });
  }, []);

  // ── Frame capture ─────────────────────────────────────────────────────────

  const captureFrame = useCallback(async (): Promise<string | null> => {
    const camera = cameraRef.current;
    if (!camera) return null;
    try {
      const photo = await camera.takePhoto({ flash: 'off', enableShutterSound: false });
      const manipulated = await ImageManipulator.manipulateAsync(
        `file://${photo.path}`,
        [{ resize: { width: LIVE_AI_TRAINER_CONFIG.MAX_IMAGE_DIM } }],
        {
          compress: LIVE_AI_TRAINER_CONFIG.JPEG_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      const b64 = manipulated.base64 ?? null;
      if (b64 && b64.length > LIVE_AI_TRAINER_CONFIG.MAX_FRAME_BASE64_CHARS) return null;
      return b64;
    } catch (e) {
      if (__DEV__) console.warn('[LiveAiTrainer] frame capture failed', e);
      return null;
    }
  }, []);

  // ── Fallback ──────────────────────────────────────────────────────────────

  const enterFallback = useCallback(
    (reason: FallbackReason) => {
      if (statusRef.current === 'fallback') return;
      summary.markFallback();
      setFallbackReason(reason);
      setStatus('fallback');
      Speech.stop();
      paramsRef.current.onFallback?.(reason);
    },
    [setStatus, summary]
  );

  // ── Core request ──────────────────────────────────────────────────────────

  const fail = useCallback(
    (kind: LiveAiTrainerErrorKind) => {
      setError({ kind, message: describeError(kind) });
      const reason = fallbackTracker.observeError();
      if (reason) enterFallback(reason);
      else setStatus('idle');
    },
    [enterFallback, fallbackTracker, setStatus]
  );

  const callAiTrainer = useCallback(
    async (mode: SamplingMode, utterance?: string) => {
      if (!runningRef.current || inFlightRef.current) return;
      if (statusRef.current === 'fallback' || statusRef.current === 'paused') return;
      if (!appActiveRef.current) return;

      // Manual actions (burst / question) are more important than idle checks;
      // if the limiter is saturated we still drop them, but show why.
      if (!rateLimiter.tryAcquire()) {
        if (mode !== 'idle') setError({ kind: 'rate_limited', message: describeError('rate_limited') });
        return;
      }

      inFlightRef.current = true;
      setStatus(utterance ? 'listening' : 'sampling');

      try {
        const frameCount = mode === 'burst' ? LIVE_AI_TRAINER_CONFIG.BURST_FRAME_COUNT : 1;
        const frames: string[] = [];
        for (let i = 0; i < frameCount; i++) {
          const frame = await captureFrame();
          if (frame) frames.push(frame);
          if (i < frameCount - 1) {
            await new Promise((r) => setTimeout(r, LIVE_AI_TRAINER_CONFIG.SAMPLE_INTERVAL_BURST));
          }
        }

        if (frames.length === 0) {
          fail('capture');
          return;
        }

        setStatus('thinking');

        const { protocol: p, currentStepIndex: stepIdx, repCount: reps } = paramsRef.current;
        const step = p.steps[stepIdx];

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          fail('unauthorized');
          return;
        }

        const body: LiveAiTrainerRequest = {
          dogId: paramsRef.current.dogId,
          planId: paramsRef.current.planId,
          sessionId: paramsRef.current.sessionId,
          exerciseId: p.id,
          stepContext: {
            currentStepIndex: stepIdx,
            stepTitle: p.title,
            stepInstruction: step?.instruction ?? p.objective,
            repGoal: step?.reps ?? undefined,
            currentReps: reps,
          },
          samplingMode: mode,
          userUtterance: utterance,
          frames,
          history: historyRef.current,
        };

        const controller = new AbortController();
        abortRef.current = controller;
        const timeout = setTimeout(() => controller.abort(), LIVE_AI_TRAINER_CONFIG.TIMEOUT_MS);

        let res: Response;
        try {
          res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/live-ai-trainer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
        } catch (e) {
          const aborted = (e as { name?: string })?.name === 'AbortError';
          fail(aborted ? 'timeout' : 'network');
          return;
        } finally {
          clearTimeout(timeout);
          abortRef.current = null;
        }

        if (res.status === 401) return fail('unauthorized');
        if (res.status === 429) return fail('rate_limited');
        if (!res.ok) return fail('server');

        let raw: unknown;
        try {
          raw = await res.json();
        } catch {
          return fail('server');
        }

        // The hook may have been stopped while the request was in flight.
        if (!runningRef.current) return;

        const data = parseLiveAiTrainerResponse(raw);
        setLastResponse(data);
        setError(null);
        summary.recordResponse(data, frames.length, !!utterance);
        historyRef.current = pushHistory(historyRef.current, {
          timestamp: Date.now(),
          observedBehavior: data.observedBehavior,
          coachMessage: data.coachMessage,
        });

        // Auto-rep: only when the step actually tracks reps, the goal isn't
        // already met, and we're outside the cooldown window.
        if (data.suggestedUiAction === 'mark_success') {
          const goal = step?.reps ?? 0;
          const now = Date.now();
          if (
            goal > 0 &&
            reps < goal &&
            now - lastAutoRepAtRef.current >= LIVE_AI_TRAINER_CONFIG.AUTO_REP_COOLDOWN_MS
          ) {
            lastAutoRepAtRef.current = now;
            summary.recordAutoRep();
            paramsRef.current.onAutoRep?.();
          }
        }

        const reason = fallbackTracker.observe(data);
        if (reason) {
          enterFallback(reason);
          return;
        }

        if (data.shouldSpeak && speechEnabledRef.current) {
          setStatus('speaking');
          await speak(data.coachMessage);
        }
        // Re-read through a helper: TS narrows the ref from the early-return
        // guards above, but enterFallback / AppState may have changed it since.
        if (runningRef.current && currentStatus() !== 'fallback' && currentStatus() !== 'paused') {
          setStatus('idle');
        }
      } finally {
        inFlightRef.current = false;
      }
    },
    [captureFrame, enterFallback, fail, fallbackTracker, rateLimiter, setStatus, speak, summary]
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    fallbackTracker.reset();
    setFallbackReason(null);
    setError(null);
    setStatus(appActiveRef.current ? 'idle' : 'paused');

    loopRef.current = setInterval(() => {
      if (runningRef.current && statusRef.current === 'idle' && !inFlightRef.current) {
        void callAiTrainer('idle');
      }
    }, LIVE_AI_TRAINER_CONFIG.SAMPLE_INTERVAL_IDLE);
  }, [callAiTrainer, fallbackTracker, setStatus]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    abortRef.current?.abort();
    Speech.stop();
    setStatus('idle');
  }, [setStatus]);

  /** Leave fallback and keep trying (user chose "Keep trying"). */
  const resume = useCallback(() => {
    fallbackTracker.reset();
    setFallbackReason(null);
    setError(null);
    setStatus(appActiveRef.current ? 'idle' : 'paused');
  }, [fallbackTracker, setStatus]);

  // Pause when the app is backgrounded; resume on foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const active = next === 'active';
      appActiveRef.current = active;
      if (!runningRef.current) return;
      if (!active) {
        abortRef.current?.abort();
        Speech.stop();
        if (statusRef.current !== 'fallback') setStatus('paused');
      } else if (statusRef.current === 'paused') {
        setStatus('idle');
      }
    });
    return () => sub.remove();
  }, [setStatus]);

  // Reset per-step context when the step changes.
  useEffect(() => {
    historyRef.current = [];
    lastAutoRepAtRef.current = 0;
  }, [currentStepIndex]);

  // Hard cleanup on unmount.
  useEffect(() => () => stop(), [stop]);

  // ── Public API ────────────────────────────────────────────────────────────

  const askCoach = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      void callAiTrainer('question', trimmed);
    },
    [callAiTrainer]
  );

  const analyzeFrame = useCallback(() => void callAiTrainer('burst'), [callAiTrainer]);

  const getSummary = useCallback((): LiveAiTrainerSummary => summary.build(), [summary]);

  return {
    cameraRef,
    status,
    lastResponse,
    error,
    fallbackReason,
    speechEnabled,
    toggleSpeech,
    start,
    stop,
    resume,
    askCoach,
    analyzeFrame,
    getSummary,
  };
}
