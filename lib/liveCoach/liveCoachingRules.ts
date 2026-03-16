// ─────────────────────────────────────────────────────────────────────────────
// Live Coaching Rules
//
// Pure, stateless functions that evaluate CoachingSuccessRule and
// CoachingResetRule against current pose/tracking signals.
//
// None of these functions have side effects — they read inputs and return
// booleans.  All mutable logic lives in liveCoachingEngine.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { PostureLabel, TrackingQuality } from '../../types/pose.ts';
import type {
  CoachingSuccessRule,
  CoachingResetRule,
} from '../../constants/protocols.ts';
import type { PoseEvent } from '../vision/poseEventDetector.ts';
import type { ResolvedCoachingConfig } from './liveCoachingTypes.ts';

// ── Quality ordering ──────────────────────────────────────────────────────────

const QUALITY_RANK: Record<TrackingQuality, number> = {
  good: 2,
  fair: 1,
  poor: 0,
};

/**
 * Returns true if `actual` meets or exceeds `required`.
 */
export function meetsTrackingQuality(
  actual: TrackingQuality,
  required: TrackingQuality
): boolean {
  return QUALITY_RANK[actual] >= QUALITY_RANK[required];
}

// ── Gate check ────────────────────────────────────────────────────────────────

/**
 * Returns true if the engine is allowed to run coaching logic this frame.
 * Both tracking quality AND posture confidence must meet their thresholds.
 */
export function isCoachingGateOpen(
  trackingQuality: TrackingQuality,
  postureConfidence: number,
  config: ResolvedCoachingConfig
): boolean {
  return (
    meetsTrackingQuality(trackingQuality, config.minTrackingQuality) &&
    postureConfidence >= config.minPostureConfidence
  );
}

// ── Target posture check ──────────────────────────────────────────────────────

/**
 * Returns true if the current posture label is one of the config's
 * targetPostures.
 */
export function isTargetPosture(
  label: PostureLabel,
  config: ResolvedCoachingConfig
): label is Exclude<PostureLabel, 'unknown'> {
  return config.targetPostures.includes(label as Exclude<PostureLabel, 'unknown'>);
}

// ── Success rule evaluation ───────────────────────────────────────────────────

/**
 * Evaluate all success rules against the current frame.
 * Returns the first rule that fires, or null if none do.
 *
 * @param currentPosture  The currently confirmed posture label.
 * @param holdTimerMs     How long the current hold has lasted (ms).
 * @param poseEvents      Events emitted this frame (for posture_transition rule).
 * @param config          Resolved coaching config.
 */
export function evaluateSuccessRules(
  currentPosture: PostureLabel,
  holdTimerMs: number,
  poseEvents: PoseEvent[],
  config: ResolvedCoachingConfig
): CoachingSuccessRule | null {
  for (const rule of config.successRules) {
    switch (rule.type) {
      case 'hold_duration': {
        if (
          currentPosture === rule.postureLabel &&
          holdTimerMs >= rule.minHoldMs
        ) {
          return rule;
        }
        break;
      }

      case 'posture_transition': {
        // Check whether a transition event fired this frame
        const transitionEvent = poseEvents.find(
          (e) =>
            e.type === `entered_${rule.toPosture}` &&
            // fromPosture validation: not tracked here (posture machine
            // handles the from-state); engine caller can verify if needed
            true
        );
        if (transitionEvent !== undefined) {
          return rule;
        }
        break;
      }

      case 'rep_count': {
        // rep_count rules are evaluated by the engine after incrementRep;
        // this branch is intentionally not implemented here — the engine
        // checks completedReps >= requiredRepCount separately.
        break;
      }
    }
  }
  return null;
}

// ── Reset rule evaluation ─────────────────────────────────────────────────────

/**
 * Returns the first reset rule that fires this frame, or null if none do.
 * Should only be called while a hold is in progress.
 *
 * @param currentPosture  Currently confirmed posture.
 * @param poseEvents      Events emitted this frame.
 * @param trackingLost    Whether the pose state machine reports tracking lost.
 * @param config          Resolved coaching config.
 */
export function evaluateResetRules(
  currentPosture: PostureLabel,
  poseEvents: PoseEvent[],
  trackingLost: boolean,
  config: ResolvedCoachingConfig
): CoachingResetRule | null {
  for (const rule of config.resetRules) {
    switch (rule.type) {
      case 'broke_posture': {
        // Fires if we received a broke_<posture> event for the target posture
        const brokeEvent = poseEvents.find(
          (e) => e.type === `broke_${rule.postureLabel}`
        );
        if (brokeEvent !== undefined) {
          return rule;
        }
        // Also fires if posture just changed away from the target
        if (
          currentPosture !== rule.postureLabel &&
          currentPosture !== 'unknown'
        ) {
          return rule;
        }
        break;
      }

      case 'significant_motion': {
        const motionEvent = poseEvents.find((e) => e.type === 'significant_motion');
        if (motionEvent !== undefined) {
          return rule;
        }
        break;
      }

      case 'tracking_lost': {
        if (trackingLost) {
          return rule;
        }
        break;
      }
    }
  }
  return null;
}

// ── Feedback template rendering ───────────────────────────────────────────────

/**
 * Fill template tokens in a feedback string.
 * Supported tokens: {dog_name}, {hold_seconds}, {rep_count}
 */
export function renderFeedbackTemplate(
  template: string,
  vars: { dogName?: string; holdSeconds?: number; repCount?: number }
): string {
  return template
    .replace('{dog_name}',    vars.dogName    ?? 'Your dog')
    .replace('{hold_seconds}', String(Math.floor(vars.holdSeconds ?? 0)))
    .replace('{rep_count}',   String(vars.repCount ?? 0));
}

/**
 * Pick the most contextually appropriate feedback template.
 * Simple heuristic: cycle through templates by rep count to avoid repetition.
 */
export function pickFeedbackTemplate(
  templates: string[],
  repCount: number
): string {
  if (templates.length === 0) return '';
  return templates[repCount % templates.length];
}
