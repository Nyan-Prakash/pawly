// ─────────────────────────────────────────────────────────────────────────────
// Pose Tracking Quality
//
// Derives a human-readable tracking quality score from the stabilised pose
// state.  Used to gate downstream logic (e.g. rep counting, posture scoring)
// and to show user-facing feedback ("tracking lost", "tracking poor", etc.).
//
// Score is 'good' | 'fair' | 'poor' and is computed each frame from:
//   1. Average keypoint confidence of visible keypoints
//   2. Visible keypoint count relative to expected count
//   3. Whether torso anchor points (withers, throat) are visible
//   4. Recent frame dropout rate
// ─────────────────────────────────────────────────────────────────────────────

import { NUM_KEYPOINTS } from '../../types/pose.ts';
import type { TrackingQuality } from '../../types/pose.ts';

// ── Tuning constants ──────────────────────────────────────────────────────────

/** Keypoint indices for torso anchors used to weight quality higher. */
const TORSO_ANCHOR_INDICES = new Set([
  22, // withers
  23, // throat
  16, // nose (head anchor)
]);

/**
 * Dropout rate window.  We track the last N frames to compute how frequently
 * the detector returned no observation at all.
 */
const DROPOUT_WINDOW = 10;

// ── Quality classification thresholds ─────────────────────────────────────────

/** Composite score ≥ this → 'good'. */
const GOOD_THRESHOLD = 0.65;
/** Composite score ≥ this → 'fair' (otherwise 'poor'). */
const FAIR_THRESHOLD = 0.35;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrackingQualityState {
  /** Circular buffer recording whether each recent frame had a detection. */
  dropoutHistory: boolean[];
  dropoutHead: number;
  dropoutFilled: boolean;
}

export function createTrackingQualityState(): TrackingQualityState {
  return {
    dropoutHistory: new Array(DROPOUT_WINDOW).fill(false),
    dropoutHead: 0,
    dropoutFilled: false,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Record whether the current frame had any detection. */
export function recordFrame(state: TrackingQualityState, hadDetection: boolean): void {
  state.dropoutHistory[state.dropoutHead] = hadDetection;
  state.dropoutHead = (state.dropoutHead + 1) % DROPOUT_WINDOW;
  if (state.dropoutHead === 0) {
    state.dropoutFilled = true;
  }
}

/** Fraction of recent frames with no detection, in [0, 1]. */
export function recentDropoutRate(state: TrackingQualityState): number {
  const len = state.dropoutFilled ? DROPOUT_WINDOW : state.dropoutHead;
  if (len === 0) return 0;
  const misses = state.dropoutHistory
    .slice(0, len)
    .filter((detected) => !detected).length;
  return misses / len;
}

// ── Quality computation ───────────────────────────────────────────────────────

export interface QualityInputs {
  /** Array of visible keypoint confidences (only tracked/held points included). */
  visibleConfidences: number[];
  /** Number of keypoints with status 'tracked' or 'held'. */
  visibleCount: number;
  /** Whether torso-anchor keypoints are currently visible. */
  hasTorsoAnchor: boolean;
  /** Fraction of recent frames with no detection (from TrackingQualityState). */
  dropoutRate: number;
}

/**
 * Compute a composite score in [0, 1] and map to TrackingQuality.
 */
export function computeTrackingQuality(inputs: QualityInputs): TrackingQuality {
  const { visibleConfidences, visibleCount, hasTorsoAnchor, dropoutRate } = inputs;

  // Component 1: average keypoint confidence (0–1)
  const avgConf =
    visibleConfidences.length > 0
      ? visibleConfidences.reduce((a, b) => a + b, 0) / visibleConfidences.length
      : 0;

  // Component 2: keypoint coverage (0–1)
  const coverage = Math.min(visibleCount / NUM_KEYPOINTS, 1);

  // Component 3: torso anchor presence (0 or 1)
  const torsoBonus = hasTorsoAnchor ? 1 : 0;

  // Component 4: dropout penalty (inverted dropout rate)
  const dropoutScore = 1 - dropoutRate;

  // Weighted composite — weights reflect importance to downstream use
  const composite =
    0.35 * avgConf +
    0.25 * coverage +
    0.20 * torsoBonus +
    0.20 * dropoutScore;

  if (composite >= GOOD_THRESHOLD) return 'good';
  if (composite >= FAIR_THRESHOLD) return 'fair';
  return 'poor';
}

/** Determine if torso-anchor keypoints are represented in the visible set. */
export function hasTorsoAnchorVisible(visibleIndices: Set<number>): boolean {
  for (const idx of TORSO_ANCHOR_INDICES) {
    if (visibleIndices.has(idx)) return true;
  }
  return false;
}

export { TORSO_ANCHOR_INDICES };
