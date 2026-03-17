// ─────────────────────────────────────────────────────────────────────────────
// useLiveCoachingSession
//
// Connects the pose pipeline (usePoseSession) to the live coaching engine.
// Owns the stabilizer, state machine, and coaching session lifecycle.
//
// Usage:
//   const coaching = useLiveCoachingSession({ protocol, dogName });
//   // Then pass coaching.coachingDecision, coaching.cameraRef, etc. to UI.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Protocol } from '@/constants/protocols';
import type { CoachingDecision, CoachingSessionMetrics } from '@/lib/liveCoach/liveCoachingTypes';
import {
  createCoachingSession,
  stepCoachingSession,
  getCoachingMetrics,
  isCoachingComplete,
} from '@/lib/liveCoach/liveCoachingSession';
import type { CoachingSession } from '@/lib/liveCoach/liveCoachingSession';

import { createPoseStabilizer, stepPoseStabilizer, resetPoseStabilizer } from '@/lib/vision/poseStabilizer';
import type { PoseStabilizerState } from '@/lib/vision/poseStabilizer';
import { createPoseStateMachine, stepPoseStateMachine, resetPoseStateMachine } from '@/lib/vision/poseStateMachine';
import type { PoseStateMachineState, PostureState } from '@/lib/vision/poseStateMachine';

import { usePoseSession } from './usePoseSession';
import type { PoseSessionState } from './usePoseSession';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LiveCoachingSessionState {
  // ── Camera / model ──────────────────────────────────────────────────────────
  cameraRef: PoseSessionState['cameraRef'];
  frameProcessor: PoseSessionState['frameProcessor'];
  isModelLoaded: boolean;
  cameraError: string | null;

  // ── Coaching engine output ──────────────────────────────────────────────────
  /** Latest decision from the coaching engine. Null until first frame. */
  coachingDecision: CoachingDecision | null;
  /** Current hold timer in ms (mirrors decision.holdTimerMs). */
  holdTimerMs: number;
  /** Completed rep count. */
  repCount: number;
  /** True when the engine has reached the 'complete' state. */
  isComplete: boolean;
  /** Aggregate session metrics. */
  metrics: CoachingSessionMetrics | null;
  /** Latest raw pose observation (pre-stabilization). Retained for debug use. */
  rawObservation: import('@/types/pose').PoseObservation | null;
  /**
   * Latest stabilized pose observation — use this for overlay rendering.
   * Keypoints are smoothed, outlier-rejected, and held on dropout.
   */
  stabilizedObservation: import('@/types/pose').StabilizedPoseObservation | null;
  /** Latest stabilized tracking quality — forwarded to TrackingQualityBadge. */
  trackingQuality: import('@/types/pose').TrackingQuality | null;

  // ── Controls ────────────────────────────────────────────────────────────────
  /** Start the camera pipeline and coaching engine. */
  start: () => void;
  /** Pause inference (but keep camera preview alive). */
  pause: () => void;
  /** Stop and clean up the session. */
  stop: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseLiveCoachingSessionParams {
  protocol: Protocol;
  dogName: string;
}

export function useLiveCoachingSession({
  protocol,
  dogName,
}: UseLiveCoachingSessionParams): LiveCoachingSessionState {
  // Defensive guard — callers should only mount this when config is available
  const liveConfig = protocol.liveCoachingConfig;

  // ── Pose pipeline (camera + model) ─────────────────────────────────────────
  const pose = usePoseSession();

  // ── Mutable pipeline objects (not reactive — mutated in per-frame callback) ─
  const stabilizerRef = useRef<PoseStabilizerState | null>(null);
  const stateMachineRef = useRef<PoseStateMachineState | null>(null);
  const sessionRef = useRef<CoachingSession | null>(null);
  const sessionStartMsRef = useRef<number>(Date.now());

  // ── Reactive UI state ──────────────────────────────────────────────────────
  const [coachingDecision, setCoachingDecision] = useState<CoachingDecision | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [metrics, setMetrics] = useState<CoachingSessionMetrics | null>(null);
  const [trackingQuality, setTrackingQuality] = useState<import('@/types/pose').TrackingQuality | null>(null);
  const [stabilizedObservation, setStabilizedObservation] = useState<import('@/types/pose').StabilizedPoseObservation | null>(null);

  // ── Initialize pipeline objects once ──────────────────────────────────────
  useEffect(() => {
    if (!liveConfig) return;

    stabilizerRef.current    = createPoseStabilizer();
    stateMachineRef.current  = createPoseStateMachine();
    sessionStartMsRef.current = Date.now();
    sessionRef.current = createCoachingSession(
      liveConfig,
      protocol.repCount,
      dogName,
      sessionStartMsRef.current
    );

    return () => {
      // Clean up on unmount
      if (stabilizerRef.current)   resetPoseStabilizer(stabilizerRef.current);
      if (stateMachineRef.current) resetPoseStateMachine(stateMachineRef.current);
      stabilizerRef.current   = null;
      stateMachineRef.current = null;
      sessionRef.current      = null;
      pose.stopSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

  // ── Per-frame processing ───────────────────────────────────────────────────
  // When usePoseSession emits a new raw observation, run it through the full
  // pipeline and push the coaching decision into state.

  useEffect(() => {
    const rawObs = pose.observation;
    if (!rawObs) return;

    const stabilizer   = stabilizerRef.current;
    const stateMachine = stateMachineRef.current;
    const session      = sessionRef.current;

    if (!stabilizer || !stateMachine || !session) return;

    const nowMs = Date.now();

    // 1. Stabilize raw keypoints
    const stabilized = stepPoseStabilizer(stabilizer, rawObs, nowMs);

    // 2. Run posture state machine (hysteresis + events)
    const { state: postureState, events: poseEvents } = stepPoseStateMachine(
      stateMachine,
      stabilized
    );

    // 3. Build frame input for the coaching engine
    const frameInput = {
      postureState,
      poseEvents,
      trackingQuality: stabilized.trackingQuality,
      postureConfidence: stabilized.confidence,
      elapsedSessionMs: nowMs - sessionStartMsRef.current,
      timestamp: nowMs,
    };

    // 4. Step the coaching engine
    const decision = stepCoachingSession(session, frameInput);

    // 5. Push decision, stabilized observation, and tracking quality to React state
    setCoachingDecision(decision);
    setStabilizedObservation(stabilized);
    setTrackingQuality(stabilized.trackingQuality);

    if (decision.markSuccess || isCoachingComplete(session)) {
      setIsComplete(true);
      setMetrics(getCoachingMetrics(session));
    }
  }, [pose.observation]);

  // ── Controls ───────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    pose.startSession();
  }, [pose]);

  const pause = useCallback(() => {
    pose.pauseSession();
  }, [pose]);

  const stop = useCallback(() => {
    if (sessionRef.current) {
      setMetrics(getCoachingMetrics(sessionRef.current));
    }
    pose.stopSession();
  }, [pose]);

  return {
    cameraRef:             pose.cameraRef,
    frameProcessor:        pose.frameProcessor,
    isModelLoaded:         pose.isModelLoaded,
    cameraError:           pose.error,
    coachingDecision,
    holdTimerMs:           coachingDecision?.holdTimerMs ?? 0,
    repCount:              coachingDecision?.completedReps ?? 0,
    isComplete,
    metrics,
    rawObservation:        pose.observation,
    stabilizedObservation,
    trackingQuality,
    start,
    pause,
    stop,
  };
}
