// ─────────────────────────────────────────────────────────────────────────────
// Live Coaching Engine
//
// Deterministic state machine that consumes per-frame pose signals and emits
// a CoachingDecision each frame.
//
// State diagram (stationary_hold mode):
//
//   ┌──────────┐  target posture confirmed      ┌───────────────────┐
//   │ waiting  │ ──────────────────────────────▶│ hold_in_progress  │
//   └──────────┘  AND gate open                 └───────────────────┘
//        ▲                                         │            │
//        │         broke posture / motion /        │            │ hold >= target
//        │◀── reset ◀── reset rule fires ──────────┘            │
//        │                                                       ▼
//        │                                              ┌──────────────┐
//        │ (auto-clear after GOOD_REP_DISPLAY_MS)       │   good_rep   │
//        │◀───────────────────────────────────────────  └──────────────┘
//        │                                                       │
//        │    requiredRepCount reached                           │
//        └──────────────────── complete ◀────────────────────────┘
//
//   Any state ──▶ lost_tracking  (when gate closes due to poor quality)
//   lost_tracking ──▶ waiting    (when gate reopens)
//
// ─────────────────────────────────────────────────────────────────────────────

import type { PostureLabel, TrackingQuality } from '../../types/pose.ts';
import type { PoseEvent } from '../vision/poseEventDetector.ts';

import {
  isCoachingGateOpen,
  isTargetPosture,
  evaluateSuccessRules,
  evaluateResetRules,
  renderFeedbackTemplate,
  pickFeedbackTemplate,
} from './liveCoachingRules.ts';

import type {
  CoachingEngineState,
  CoachingDecision,
  CoachingFrameInput,
  CoachingSessionMetrics,
  ResolvedCoachingConfig,
} from './liveCoachingTypes.ts';
import { createCoachingSessionMetrics } from './liveCoachingTypes.ts';

// ── Timing constants ──────────────────────────────────────────────────────────

/**
 * How long to display the "good_rep" state before returning to waiting.
 * Short enough to feel responsive; long enough for the user to read it.
 */
const GOOD_REP_DISPLAY_MS = 1200;

/**
 * How long to display the "reset" state before returning to waiting.
 */
const RESET_DISPLAY_MS = 1000;

/**
 * Minimum ms between message changes to prevent flickering.
 * The message is only updated when the engine state changes OR this cooldown
 * has elapsed since the last update.
 */
const MESSAGE_COOLDOWN_MS = 2000;

/**
 * Minimum confidence in the target posture before we start the hold timer.
 * Slightly higher than minPostureConfidence to require a stable entry.
 */
const HOLD_START_CONFIDENCE_BOOST = 0.05;

// ── Fixed message strings ─────────────────────────────────────────────────────
// Short, imperative, calm.  No punctuation variation — stable strings are
// easier for debounce and easier for screen readers / TTS.

const MSG_WAIT_FOR_POSTURE  = 'Wait for the down';
const MSG_HOLD_POSITION     = 'Hold position';
const MSG_GOOD_REP          = 'Good — reward now';
const MSG_RESET             = 'Reset and try again';
const MSG_TRACKING_LOST     = 'Move back so the full body is visible';
const MSG_TRACKING_BLOCKED  = 'Adjust camera to see your dog';
const MSG_COMPLETE          = 'Session complete — great work';

// ── Internal engine state ─────────────────────────────────────────────────────

export interface CoachingEngineInternalState {
  // ── Engine state ───────────────────────────────────────────────────────────
  engineState:    CoachingEngineState;

  // ── Hold tracking ──────────────────────────────────────────────────────────
  /** ms when the current hold attempt started (null = not in hold). */
  holdStartMs:    number | null;
  /** Accumulated hold time for the current rep attempt (ms). */
  holdTimerMs:    number;

  // ── Rep counting ──────────────────────────────────────────────────────────
  completedReps:  number;

  // ── Transient display state ────────────────────────────────────────────────
  /** ms when the engine entered good_rep or reset state. */
  displayStateEnteredMs: number | null;

  // ── Message debounce ───────────────────────────────────────────────────────
  currentMessage:     string;
  lastMessageChangeMs: number;

  // ── Metrics ───────────────────────────────────────────────────────────────
  metrics: CoachingSessionMetrics;

  // ── Resolved config ───────────────────────────────────────────────────────
  config: ResolvedCoachingConfig;

  // ── Dog name (for templates) ───────────────────────────────────────────────
  dogName: string;
}

export function createCoachingEngine(
  config: ResolvedCoachingConfig,
  dogName: string,
  startMs: number
): CoachingEngineInternalState {
  return {
    engineState:           'waiting',
    holdStartMs:           null,
    holdTimerMs:           0,
    completedReps:         0,
    displayStateEnteredMs: null,
    currentMessage:        MSG_WAIT_FOR_POSTURE,
    lastMessageChangeMs:   startMs,
    metrics:               createCoachingSessionMetrics(startMs),
    config,
    dogName,
  };
}

export function resetCoachingEngine(
  engine: CoachingEngineInternalState,
  nowMs: number
): void {
  engine.engineState           = 'waiting';
  engine.holdStartMs           = null;
  engine.holdTimerMs           = 0;
  engine.completedReps         = 0;
  engine.displayStateEnteredMs = null;
  engine.currentMessage        = MSG_WAIT_FOR_POSTURE;
  engine.lastMessageChangeMs   = nowMs;
  engine.metrics               = createCoachingSessionMetrics(nowMs);
}

// ── Message helpers ───────────────────────────────────────────────────────────

function setMessage(
  engine: CoachingEngineInternalState,
  message: string,
  nowMs: number,
  force = false
): void {
  if (
    force ||
    message !== engine.currentMessage ||
    nowMs - engine.lastMessageChangeMs >= MESSAGE_COOLDOWN_MS
  ) {
    if (message !== engine.currentMessage) {
      engine.currentMessage     = message;
      engine.lastMessageChangeMs = nowMs;
    }
  }
}

// ── Metrics helpers ───────────────────────────────────────────────────────────

function recordQuality(
  metrics: CoachingSessionMetrics,
  quality: TrackingQuality
): void {
  metrics.trackingQualityBreakdown[quality] += 1;
}

function recordPostureDuration(
  metrics: CoachingSessionMetrics,
  label: PostureLabel,
  durationMs: number
): void {
  metrics.postureDurations[label] = (metrics.postureDurations[label] ?? 0) + durationMs;
}

function recordSuccessfulHold(
  metrics: CoachingSessionMetrics,
  holdDurationMs: number
): void {
  metrics.repCountDetected    += 1;
  metrics.successfulHolds     += 1;
  metrics.holdDurations.push(holdDurationMs);
  const prevTotal = metrics.averageHoldDurationMs * (metrics.successfulHolds - 1);
  metrics.averageHoldDurationMs =
    (prevTotal + holdDurationMs) / metrics.successfulHolds;
}

// ── Main step function ────────────────────────────────────────────────────────

/**
 * Feed one frame into the coaching engine and receive a CoachingDecision.
 * Mutates `engine` in place.
 *
 * @param engine   Mutable engine state (from createCoachingEngine).
 * @param input    Per-frame pose signals.
 * @returns        Immutable coaching decision for this frame.
 */
export function stepCoachingEngine(
  engine: CoachingEngineInternalState,
  input: CoachingFrameInput
): CoachingDecision {
  const { postureState, poseEvents, trackingQuality, postureConfidence, timestamp } = input;
  const { config } = engine;

  // ── 0. Baseline output defaults ───────────────────────────────────────────
  let incrementRep = false;
  let markSuccess  = false;
  let cue: string | undefined;

  // ── 1. Update metrics ─────────────────────────────────────────────────────
  recordQuality(engine.metrics, trackingQuality);
  const msSinceLast = Math.max(0, timestamp - engine.metrics.lastFrameMs);
  engine.metrics.lastFrameMs = timestamp;

  // Track posture duration
  if (msSinceLast > 0) {
    recordPostureDuration(engine.metrics, postureState.label, msSinceLast);
    if (isTargetPosture(postureState.label, config)) {
      engine.metrics.timeInTargetPostureMs += msSinceLast;
    }
  }

  // Count tracking_lost events
  const hadTrackingLost = poseEvents.some((e) => e.type === 'tracking_lost');
  if (hadTrackingLost) engine.metrics.lostTrackingEvents += 1;

  // Count significant_motion events
  const hadSignificantMotion = poseEvents.some((e) => e.type === 'significant_motion');
  if (hadSignificantMotion) engine.metrics.significantMotionEvents += 1;

  // ── 2. Check coaching gate ────────────────────────────────────────────────
  const gateOpen = isCoachingGateOpen(trackingQuality, postureConfidence, config);

  if (!gateOpen) {
    // Gate is closed — pause everything
    if (engine.engineState !== 'lost_tracking' && engine.engineState !== 'complete') {
      // Abort any in-progress hold (don't count partial time)
      if (engine.engineState === 'hold_in_progress') {
        engine.holdStartMs  = null;
        engine.holdTimerMs  = 0;
        engine.metrics.resetCount += 1;
      }
      engine.engineState           = 'lost_tracking';
      engine.displayStateEnteredMs = timestamp;
    }

    const isFullyLost = postureState.trackingLost;
    setMessage(
      engine,
      isFullyLost ? MSG_TRACKING_LOST : MSG_TRACKING_BLOCKED,
      timestamp
    );

    return buildDecision(engine, 'lost_tracking', incrementRep, markSuccess, cue);
  }

  // Gate is open — recover from lost_tracking if needed
  if (engine.engineState === 'lost_tracking') {
    engine.engineState           = 'waiting';
    engine.displayStateEnteredMs = null;
    setMessage(engine, MSG_WAIT_FOR_POSTURE, timestamp, true);
  }

  // ── 3. If complete, hold there ────────────────────────────────────────────
  if (engine.engineState === 'complete') {
    setMessage(engine, MSG_COMPLETE, timestamp);
    return buildDecision(engine, 'complete', false, false, cue);
  }

  // ── 4. Transient display state expiry ─────────────────────────────────────
  if (
    (engine.engineState === 'good_rep' || engine.engineState === 'reset') &&
    engine.displayStateEnteredMs !== null
  ) {
    const displayDuration =
      engine.engineState === 'good_rep' ? GOOD_REP_DISPLAY_MS : RESET_DISPLAY_MS;

    if (timestamp - engine.displayStateEnteredMs >= displayDuration) {
      // Transition back to waiting
      engine.engineState           = 'waiting';
      engine.displayStateEnteredMs = null;
      engine.holdStartMs           = null;
      engine.holdTimerMs           = 0;
      setMessage(engine, MSG_WAIT_FOR_POSTURE, timestamp, true);
    }
  }

  // ── 5. Mode dispatch ──────────────────────────────────────────────────────
  if (config.mode === 'stationary_hold') {
    return stepStationaryHold(engine, input, incrementRep, markSuccess);
  }

  // Future modes — type-safe placeholder
  // transition_detection and position_precision are not yet implemented.
  // Return waiting with a neutral message.
  setMessage(engine, MSG_WAIT_FOR_POSTURE, timestamp);
  return buildDecision(engine, 'waiting', false, false, undefined);
}

// ── stationary_hold mode ──────────────────────────────────────────────────────

function stepStationaryHold(
  engine: CoachingEngineInternalState,
  input: CoachingFrameInput,
  incrementRep: boolean,
  markSuccess: boolean
): CoachingDecision {
  const { postureState, poseEvents, trackingQuality, postureConfidence, timestamp } = input;
  const { config } = engine;
  let cue: string | undefined;

  const currentPosture  = postureState.label;
  const inTargetPosture = isTargetPosture(currentPosture, config);

  // ── 5a. Waiting ────────────────────────────────────────────────────────────
  if (engine.engineState === 'waiting') {
    // Check if we can start a hold
    const holdReady =
      inTargetPosture &&
      postureConfidence >= config.minPostureConfidence + HOLD_START_CONFIDENCE_BOOST;

    if (holdReady) {
      engine.engineState = 'hold_in_progress';
      engine.holdStartMs = timestamp;
      engine.holdTimerMs = 0;
      setMessage(engine, MSG_HOLD_POSITION, timestamp, true);
      cue = 'Stay';
    } else {
      setMessage(engine, MSG_WAIT_FOR_POSTURE, timestamp);
    }

    return buildDecision(engine, engine.engineState, incrementRep, markSuccess, cue);
  }

  // ── 5b. Hold in progress ──────────────────────────────────────────────────
  if (engine.engineState === 'hold_in_progress') {
    // Advance hold timer only while in target posture with gate open
    if (inTargetPosture && engine.holdStartMs !== null) {
      engine.holdTimerMs = timestamp - engine.holdStartMs;
    }

    // Check reset rules first (higher priority than success)
    const resetRule = evaluateResetRules(
      currentPosture,
      poseEvents,
      postureState.trackingLost,
      config
    );

    if (resetRule !== null) {
      engine.metrics.resetCount        += 1;
      engine.engineState                = 'reset';
      engine.holdStartMs                = null;
      engine.holdTimerMs                = 0;
      engine.displayStateEnteredMs      = timestamp;
      setMessage(engine, MSG_RESET, timestamp, true);
      cue = undefined;
      return buildDecision(engine, 'reset', false, false, cue);
    }

    // Check success rules
    const successRule = evaluateSuccessRules(
      currentPosture,
      engine.holdTimerMs,
      poseEvents,
      config
    );

    if (successRule !== null) {
      // Successful hold
      const holdDuration = engine.holdTimerMs;
      recordSuccessfulHold(engine.metrics, holdDuration);

      engine.completedReps  += 1;
      incrementRep           = true;

      // Check session completion
      if (engine.completedReps >= config.requiredRepCount) {
        engine.engineState   = 'complete';
        markSuccess          = true;
        engine.holdStartMs   = null;
        engine.holdTimerMs   = 0;
        setMessage(engine, MSG_COMPLETE, timestamp, true);
        return buildDecision(engine, 'complete', incrementRep, markSuccess, cue);
      }

      // Not done yet — show good_rep
      const holdSeconds = Math.floor(holdDuration / 1000);
      const template    = pickFeedbackTemplate(config.feedbackTemplates, engine.completedReps - 1);
      const rendered    = renderFeedbackTemplate(template, {
        dogName:      engine.dogName,
        holdSeconds,
        repCount:     engine.completedReps,
      });

      // Use MSG_GOOD_REP as the primary message (short, unambiguous)
      // and the template as a secondary cue (future TTS/subtitle use)
      engine.engineState           = 'good_rep';
      engine.holdStartMs           = null;
      engine.holdTimerMs           = 0;
      engine.displayStateEnteredMs = timestamp;
      setMessage(engine, MSG_GOOD_REP, timestamp, true);
      cue = rendered;

      return buildDecision(engine, 'good_rep', incrementRep, false, cue);
    }

    // Still holding — provide periodic hold message
    setMessage(engine, MSG_HOLD_POSITION, timestamp);
    cue = 'Stay';
    return buildDecision(engine, 'hold_in_progress', false, false, cue);
  }

  // ── 5c. Transient states (good_rep / reset) ────────────────────────────────
  // These fall through without engine state change; expiry handled above in step 4.
  if (engine.engineState === 'good_rep') {
    setMessage(engine, MSG_GOOD_REP, timestamp);
    return buildDecision(engine, 'good_rep', false, false, cue);
  }

  if (engine.engineState === 'reset') {
    setMessage(engine, MSG_RESET, timestamp);
    return buildDecision(engine, 'reset', false, false, cue);
  }

  // Fallback — should not be reached in normal operation
  return buildDecision(engine, engine.engineState, false, false, undefined);
}

// ── Decision builder ──────────────────────────────────────────────────────────

function buildDecision(
  engine: CoachingEngineInternalState,
  state: CoachingEngineState,
  incrementRep: boolean,
  markSuccess: boolean,
  cue: string | undefined
): CoachingDecision {
  return {
    state,
    message:         engine.currentMessage,
    cue,
    incrementRep,
    markSuccess,
    activePosture:   engine.config.targetPostures[0] ?? 'unknown',
    holdTimerMs:     engine.holdTimerMs,
    targetHoldMs:    engine.config.holdDurationMs,
    trackingBlocked: state === 'lost_tracking',
    completedReps:   engine.completedReps,
    requiredReps:    engine.config.requiredRepCount,
  };
}
