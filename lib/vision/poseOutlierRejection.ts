// ─────────────────────────────────────────────────────────────────────────────
// Pose Outlier Rejection
//
// Detects implausible single-frame jumps in keypoint position and suppresses
// them unless confidence is extremely high (suggesting a legitimate fast move).
//
// Strategy:
//   1. For each keypoint, compare the new position to the last accepted position.
//   2. If the Euclidean distance exceeds the body-scale-normalised threshold,
//      AND confidence is below the high-confidence override, reject the update.
//   3. The "body scale" is derived from the detection bounding box (or a recent
//      estimate) so that rejection adapts to how large the dog appears in frame.
// ─────────────────────────────────────────────────────────────────────────────

import type { PoseKeypoint } from '../../types/pose.ts';
import type { NormalizedBBox } from '../../types/pose.ts';

// ── Tuning constants ──────────────────────────────────────────────────────────

/**
 * Maximum allowed jump as a fraction of the body bounding-box diagonal.
 * A value of 0.3 means a keypoint must not jump more than 30% of the dog's
 * body size per frame.  Tune upward if you see false rejections during fast
 * motion.
 */
export const MAX_JUMP_FRACTION = 0.3;

/**
 * If a keypoint's confidence is at or above this value, the outlier gate is
 * skipped entirely — we trust the model's high-certainty reads even if they
 * jump far (e.g. dog genuinely lunged or camera moved quickly).
 */
export const HIGH_CONFIDENCE_OVERRIDE = 0.85;

/**
 * Fallback body diagonal (normalised) used when no bbox is available.
 * 0.5 ≈ half the frame diagonal — conservative, allows ~15% frame width jump.
 */
export const FALLBACK_BODY_DIAGONAL = 0.5;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OutlierRejectionState {
  /** Last accepted position per keypoint index. */
  lastAccepted: Map<number, { x: number; y: number }>;
  /** Smoothed body diagonal estimate (normalised). */
  bodyDiagonal: number;
}

export function createOutlierRejectionState(): OutlierRejectionState {
  return {
    lastAccepted: new Map(),
    bodyDiagonal: FALLBACK_BODY_DIAGONAL,
  };
}

/** Update the body diagonal estimate from the latest bounding box. */
export function updateBodyScale(state: OutlierRejectionState, bbox: NormalizedBBox): void {
  const diag = Math.sqrt(bbox.w * bbox.w + bbox.h * bbox.h);
  // Smooth the estimate to avoid sharp changes from noisy bbox
  state.bodyDiagonal = 0.8 * state.bodyDiagonal + 0.2 * diag;
}

/**
 * Test whether a candidate keypoint reading is plausible given the last
 * accepted position.
 *
 * @returns `true`  if the reading should be accepted
 *          `false` if the reading looks like an outlier and should be dropped
 */
export function isKeypointPlausible(
  state: OutlierRejectionState,
  kp: PoseKeypoint
): boolean {
  // High-confidence reads always pass
  if (kp.score >= HIGH_CONFIDENCE_OVERRIDE) {
    return true;
  }

  const prev = state.lastAccepted.get(kp.index);
  if (prev === undefined) {
    // No previous position — always accept first sighting
    return true;
  }

  const dx = kp.x - prev.x;
  const dy = kp.y - prev.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxAllowed = state.bodyDiagonal * MAX_JUMP_FRACTION;

  return dist <= maxAllowed;
}

/**
 * Run the full outlier rejection pass over a keypoint array.
 * Accepted keypoints update lastAccepted; rejected keypoints are filtered out.
 * Also updates the body scale if a bbox is provided.
 *
 * @returns a new array containing only the accepted keypoints
 */
export function filterOutliers(
  state: OutlierRejectionState,
  keypoints: PoseKeypoint[],
  bbox?: NormalizedBBox
): PoseKeypoint[] {
  if (bbox) {
    updateBodyScale(state, bbox);
  }

  const accepted: PoseKeypoint[] = [];
  for (const kp of keypoints) {
    if (isKeypointPlausible(state, kp)) {
      accepted.push(kp);
      state.lastAccepted.set(kp.index, { x: kp.x, y: kp.y });
    }
    // rejected keypoints do not update lastAccepted — old position is retained
  }
  return accepted;
}

/** Reset all state (e.g. on session start or dog identity change). */
export function resetOutlierState(state: OutlierRejectionState): void {
  state.lastAccepted.clear();
  state.bodyDiagonal = FALLBACK_BODY_DIAGONAL;
}
