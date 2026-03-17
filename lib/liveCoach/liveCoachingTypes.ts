// ─────────────────────────────────────────────────────────────────────────────
// Live Coaching Types
//
// All public types consumed and produced by the live coaching engine.
// Kept in their own file so UI layers can import only types without pulling
// in engine logic.
// ─────────────────────────────────────────────────────────────────────────────

import type { PostureLabel, TrackingQuality } from '../../types/pose.ts';
import type { PoseEvent } from '../vision/poseEventDetector.ts';
import type { PostureState } from '../vision/poseStateMachine.ts';
import type { LiveCoachingConfig } from '../../constants/protocols.ts';

// ── Engine state ──────────────────────────────────────────────────────────────

/**
 * High-level coaching engine state.
 *
 * - waiting          : no dog detected or posture not yet confirmed
 * - hold_in_progress : target posture confirmed, hold timer running
 * - good_rep         : hold completed — brief celebration window
 * - reset            : rep broken or reset rule triggered — prompting retry
 * - lost_tracking    : tracking quality too poor to run — waiting for recovery
 * - complete         : requiredRepCount reached — session coaching portion done
 */
export type CoachingEngineState =
  | 'waiting'
  | 'hold_in_progress'
  | 'good_rep'
  | 'reset'
  | 'lost_tracking'
  | 'complete';

// ── Decision output ───────────────────────────────────────────────────────────

/**
 * The coaching decision returned every frame.
 * Consumers (UI, analytics) should treat this as a value object — don't mutate it.
 */
export interface CoachingDecision {
  /** Current engine state. */
  state: CoachingEngineState;

  /** Short message to display to the user. Never changes more than once per cooldown window. */
  message: string;

  /**
   * Optional short cue word (e.g. "Down", "Stay", "Good").
   * Intended for large-font display / audio TTS if added later.
   */
  cue?: string;

  /** True this frame only when a rep should be counted. */
  incrementRep: boolean;

  /** True this frame only when the session coaching portion is complete. */
  markSuccess: boolean;

  /** The posture currently being tracked (or 'unknown'). */
  activePosture: PostureLabel;

  /**
   * Current hold timer in ms.
   * 0 when not in hold_in_progress.
   * Counts up to holdDurationMs.
   */
  holdTimerMs: number;

  /**
   * Target hold duration from config (ms).
   * Useful for UI progress ring: progress = holdTimerMs / targetHoldMs.
   */
  targetHoldMs: number;

  /** True when tracking quality is blocking coaching logic. */
  trackingBlocked: boolean;

  /** Completed rep count so far this session. */
  completedReps: number;

  /** Required rep count from config. */
  requiredReps: number;
}

// ── Per-frame input ───────────────────────────────────────────────────────────

/**
 * Everything the engine needs per frame.
 * Deliberately avoids raw keypoints — higher-level signals only.
 */
export interface CoachingFrameInput {
  /** Output from poseStateMachine.stepPoseStateMachine() */
  postureState:   PostureState;
  /** Events emitted this frame by the pose state machine. */
  poseEvents:     PoseEvent[];
  /** Current tracking quality. */
  trackingQuality: TrackingQuality;
  /** Current posture classifier confidence (0–1). */
  postureConfidence: number;
  /** Elapsed wall-clock time since the coaching session started (ms). */
  elapsedSessionMs: number;
  /** Unix ms timestamp for this frame. */
  timestamp: number;
}

// ── Metrics ───────────────────────────────────────────────────────────────────

/**
 * Structured metrics collected throughout the coaching session.
 *
 * Designed to map cleanly to:
 *   session_logs.live_coaching_summary  — high-level summary
 *   session_logs.pose_metrics           — detailed posture breakdown
 */
export interface CoachingSessionMetrics {
  // ── Rep tracking ──────────────────────────────────────────────────────────
  /** Total reps detected (successful holds). */
  repCountDetected: number;
  /** Reps where hold reached full duration. */
  successfulHolds: number;
  /** Average duration of successful holds (ms). */
  averageHoldDurationMs: number;
  /** Running total of time the dog was in a target posture (ms). */
  timeInTargetPostureMs: number;
  /** Number of times a rep was reset (broke posture / motion / tracking). */
  resetCount: number;
  /** Duration (ms) of each successfully completed hold, in order. */
  holdDurations: number[];

  // ── Tracking ──────────────────────────────────────────────────────────────
  /** Number of tracking_lost events seen during coaching. */
  lostTrackingEvents: number;
  /** Number of significant_motion events seen during coaching. */
  significantMotionEvents: number;
  /** Frames at each quality level: { good: N, fair: N, poor: N } */
  trackingQualityBreakdown: Record<TrackingQuality, number>;

  // ── Posture breakdown ──────────────────────────────────────────────────────
  /**
   * Time spent in each posture during the coached session (ms).
   * Keys are posture labels including 'unknown'.
   */
  postureDurations: Partial<Record<PostureLabel, number>>;

  // ── Timing ────────────────────────────────────────────────────────────────
  /** ms when this metrics object was created (session start). */
  sessionStartMs: number;
  /** ms of the most recent frame processed. */
  lastFrameMs: number;
}

export function createCoachingSessionMetrics(startMs: number): CoachingSessionMetrics {
  return {
    repCountDetected:         0,
    successfulHolds:          0,
    averageHoldDurationMs:    0,
    timeInTargetPostureMs:    0,
    resetCount:               0,
    holdDurations:            [],
    lostTrackingEvents:       0,
    significantMotionEvents:  0,
    trackingQualityBreakdown: { good: 0, fair: 0, poor: 0 },
    postureDurations:         {},
    sessionStartMs:           startMs,
    lastFrameMs:              startMs,
  };
}

// ── Engine configuration (resolved from protocol) ────────────────────────────

/**
 * Resolved, ready-to-use engine configuration.
 * Derived from LiveCoachingConfig + Protocol defaults at session start.
 * All optional fields are filled in with concrete values here.
 */
export interface ResolvedCoachingConfig {
  mode:                 LiveCoachingConfig['mode'];
  targetPostures:       Exclude<PostureLabel, 'unknown'>[];
  minTrackingQuality:   TrackingQuality;
  minPostureConfidence: number;
  successRules:         LiveCoachingConfig['successRules'];
  resetRules:           LiveCoachingConfig['resetRules'];
  feedbackTemplates:    string[];
  /** Resolved hold target (ms). Always defined for stationary_hold. */
  holdDurationMs:       number;
  /** Resolved rep target. Always a positive integer. */
  requiredRepCount:     number;
}

/**
 * Resolve a LiveCoachingConfig + protocol defaults into a ResolvedCoachingConfig.
 * Throws if config is null (caller must guard).
 */
export function resolveCoachingConfig(
  config: LiveCoachingConfig,
  protocolRepCount: number
): ResolvedCoachingConfig {
  // Derive holdDurationMs: prefer explicit config field, else first hold_duration rule
  let holdDurationMs = config.holdDurationMs ?? 0;
  if (holdDurationMs === 0) {
    for (const rule of config.successRules) {
      if (rule.type === 'hold_duration') {
        holdDurationMs = rule.minHoldMs;
        break;
      }
    }
  }

  return {
    mode:                 config.mode,
    targetPostures:       config.targetPostures,
    minTrackingQuality:   config.minTrackingQuality,
    minPostureConfidence: config.minPostureConfidence,
    successRules:         config.successRules,
    resetRules:           config.resetRules,
    feedbackTemplates:    config.feedbackTemplates,
    holdDurationMs:       holdDurationMs > 0 ? holdDurationMs : 5000,
    requiredRepCount:     config.requiredRepCount ?? protocolRepCount,
  };
}
