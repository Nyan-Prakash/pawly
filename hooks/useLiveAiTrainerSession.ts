import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from 'react-native-vision-camera';
import * as ImageManipulator from 'expo-image-manipulator';

import { supabase } from '@/lib/supabase';
import type { Protocol } from '@/constants/protocols';
import {
  LiveAiTrainerRequest,
  LiveAiTrainerResponse,
  LiveAiTrainerStatus,
  LiveAiTrainerSummary,
  LIVE_AI_TRAINER_CONFIG,
} from '@/lib/liveCoach/liveAiTrainerTypes';

interface UseLiveAiTrainerSessionParams {
  protocol: Protocol;
  dogId: string;
  planId: string;
  sessionId: string;
  currentStepIndex: number;
}

export function useLiveAiTrainerSession({
  protocol,
  dogId,
  planId,
  sessionId,
  currentStepIndex,
}: UseLiveAiTrainerSessionParams) {
  const cameraRef = useRef<Camera>(null);
  const [status, setStatus] = useState<LiveAiTrainerStatus>('idle');
  const [lastResponse, setLastResponse] = useState<LiveAiTrainerResponse | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats for summary
  const interactionCount = useRef(0);
  const evaluationCount = useRef(0);
  const framingIssueCount = useRef(0);
  const audioInteractionOccurred = useRef(false);
  const lowConfidenceStreak = useRef(0);
  const poorFramingStreak = useRef(0);

  const history = useRef<NonNullable<LiveAiTrainerRequest['history']>>([]);

  const isRunning = useRef(false);
  const lastRequestTime = useRef(0);

  const start = useCallback(() => {
    isRunning.current = true;
    setStatus('idle');
  }, []);

  const stop = useCallback(() => {
    isRunning.current = false;
    setStatus('idle');
  }, []);

  const captureFrame = async (): Promise<string | null> => {
    if (!cameraRef.current) return null;
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });

      const manipulated = await ImageManipulator.manipulateAsync(
        `file://${photo.path}`,
        [{ resize: { width: LIVE_AI_TRAINER_CONFIG.MAX_IMAGE_DIM } }],
        { compress: LIVE_AI_TRAINER_CONFIG.JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      return manipulated.base64 || null;
    } catch (e) {
      console.error('Frame capture error:', e);
      return null;
    }
  };

  const callAiTrainer = async (mode: 'idle' | 'burst' | 'question', utterance?: string) => {
    if (!isRunning.current) return;

    const now = Date.now();
    if (now - lastRequestTime.current < 2000 && mode === 'idle') return; // Debounce idle checks

    lastRequestTime.current = now;
    setStatus(utterance ? 'listening' : 'sampling');

    const frames: string[] = [];
    const frameCount = mode === 'burst' ? LIVE_AI_TRAINER_CONFIG.BURST_FRAME_COUNT : 1;

    for (let i = 0; i < frameCount; i++) {
      const f = await captureFrame();
      if (f) frames.push(f);
      if (i < frameCount - 1) await new Promise(r => setTimeout(r, LIVE_AI_TRAINER_CONFIG.SAMPLE_INTERVAL_BURST));
    }

    if (frames.length === 0) {
      setStatus('idle');
      return;
    }

    setStatus('thinking');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/live-ai-trainer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          dogId,
          planId,
          sessionId,
          exerciseId: protocol.id,
          stepContext: {
            currentStepIndex,
            stepTitle: protocol.title,
            stepInstruction: protocol.steps[currentStepIndex]?.instruction || protocol.objective,
            currentReps: 0, // In a full implementation, we'd pull from sessionStore
          },
          samplingMode: mode,
          userUtterance: utterance,
          frames,
          history: history.current,
        } as LiveAiTrainerRequest),
      });

      if (!res.ok) throw new Error('AI Trainer request failed');

      const data: LiveAiTrainerResponse = await res.json();
      setLastResponse(data);
      setStatus(data.shouldSpeak ? 'speaking' : 'idle');

      // Update stats
      interactionCount.current++;
      evaluationCount.current += frames.length;
      if (data.framingQuality === 'poor') framingIssueCount.current++;
      if (utterance) audioInteractionOccurred.current = true;

      // History
      history.current.push({
        timestamp: now,
        observedBehavior: data.observedBehavior,
        coachMessage: data.coachMessage,
      });
      if (history.current.length > 5) history.current.shift();

      // Fallback Logic
      if (data.confidenceCategory === 'low') {
        lowConfidenceStreak.current++;
      } else {
        lowConfidenceStreak.current = 0;
      }

      if (data.framingQuality === 'poor') {
        poorFramingStreak.current++;
      } else {
        poorFramingStreak.current = 0;
      }

      if (
        lowConfidenceStreak.current >= LIVE_AI_TRAINER_CONFIG.FALLBACK_CONSECUTIVE_LOW_CONFIDENCE ||
        poorFramingStreak.current >= LIVE_AI_TRAINER_CONFIG.FALLBACK_CONSECUTIVE_POOR_FRAMING ||
        data.fallbackToManual
      ) {
        setStatus('fallback');
      }

    } catch (e) {
      console.error('callAiTrainer error:', e);
      setError('Connection issue');
      setStatus('idle');
    }
  };

  // Main Loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning.current && status === 'idle') {
        callAiTrainer('idle');
      }
    }, LIVE_AI_TRAINER_CONFIG.SAMPLE_INTERVAL_IDLE);

    return () => clearInterval(interval);
  }, [status]);

  const askCoach = (text: string) => callAiTrainer('question', text);
  const checkPosture = () => callAiTrainer('burst');

  const getSummary = (): LiveAiTrainerSummary => ({
    used: interactionCount.current > 0,
    interactionCount: interactionCount.current,
    evaluationCount: evaluationCount.current,
    fallbackOccurred: status === 'fallback',
    averageConfidence: 'medium', // Simplified
    framingIssueCount: framingIssueCount.current,
    audioInteractionOccurred: audioInteractionOccurred.current,
    finalCoachMessage: lastResponse?.coachMessage,
  });

  return {
    cameraRef,
    status,
    lastResponse,
    isComplete,
    error,
    start,
    stop,
    askCoach,
    checkPosture,
    getSummary,
  };
}
