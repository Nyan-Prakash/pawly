// ─────────────────────────────────────────────────────────────────────────────
// Pose Stabilizer
//
// Converts a stream of raw PoseObservations into a stream of
// StabilizedPoseObservations by applying:
//
//   1. Outlier rejection  — suppress single-frame position jumps
//   2. Confidence gating  — route each update to the right smoothing tier
//   3. One Euro filtering — adaptive temporal smoothing per keypoint coordinate
//   4. Dropout hold       — retain last known position for short tracking gaps
//   5. Tracking quality   — derive global quality score per frame
//   6. Body geometry      — estimate body center and orientation
//
// Usage:
//   const stab = createPoseStabilizer();
//   // per frame:
//   const stabilized = stepPoseStabilizer(stab, rawObservation, Date.now());
//   // on session end:
//   resetPoseStabilizer(stab);
// ─────────────────────────────────────────────────────────────────────────────

import {
  DOG_KEYPOINT_NAMES,
  NUM_KEYPOINTS,
  type DogKeypointName,
  type RawPoseObservation,
  type StabilizedKeypoint,
  type StabilizedPoseObservation,
  type KeypointTrackingStatus,
} from '../../types/pose.ts';

import {
  createOneEuroFilter2D,
  oneEuroFilter2DStep,
  resetOneEuroFilter2D,
  type OneEuroFilter2DState,
} from './oneEuroFilter.ts';

import {
  createOutlierRejectionState,
  filterOutliers,
  resetOutlierState,
  type OutlierRejectionState,
} from './poseOutlierRejection.ts';

import {
  createTrackingQualityState,
  recordFrame,
  recentDropoutRate,
  computeTrackingQuality,
  hasTorsoAnchorVisible,
  type TrackingQualityState,
} from './poseTrackingQuality.ts';

// ── Tuning constants ──────────────────────────────────────────────────────────

/**
 * Confidence tiers for update routing.
 * Adjust these to taste based on your model's calibration.
 */
const CONF_HIGH   = 0.70;  // normal full update
const CONF_MEDIUM = 0.45;  // conservative (smaller EMA step)
const CONF_LOW    = 0.25;  // hold previous; only nudge slightly
// below CONF_LOW → do not update position at all this frame

/**
 * Number of consecutive frames a keypoint can be absent before it
 * transitions from 'held' to 'missing'.
 */
const MAX_HOLD_FRAMES = 6;  // ~0.6 s at 10 FPS

/**
 * One Euro Filter parameters for each confidence tier.
 *
 * - High confidence: moderately responsive, less smoothing
 * - Medium confidence: more smoothing, slower response
 * - Low confidence: maximum smoothing (we only nudge, don't trust fully)
 *
 * freq is set to 10 matching the camera FPS in usePoseSession.
 */
const FILTER_PARAMS_HIGH   = { freq: 10, minCutoff: 1.5, beta: 0.010, dCutoff: 1.0 };
const FILTER_PARAMS_MEDIUM = { freq: 10, minCutoff: 0.8, beta: 0.004, dCutoff: 1.0 };
const FILTER_PARAMS_LOW    = { freq: 10, minCutoff: 0.4, beta: 0.001, dCutoff: 1.0 };

// Indices used for body geometry
const IDX_WITHERS    = 22;
const IDX_THROAT     = 23;
const IDX_TAIL_START = 12;
const IDX_NOSE       = 16;

// ── Per-keypoint state ────────────────────────────────────────────────────────

interface KeypointState {
  /** Adaptive filters per confidence tier. */
  filterHigh:   OneEuroFilter2DState;
  filterMedium: OneEuroFilter2DState;
  filterLow:    OneEuroFilter2DState;

  /** Last smoothed position. */
  lastX: number;
  lastY: number;
  /** Last smoothed confidence. */
  lastScore: number;

  /** Lifecycle state. */
  status: KeypointTrackingStatus;
  /** How many consecutive frames this point has been absent. */
  consecutiveMisses: number;

  /** Whether this keypoint has ever been seen (for cold-start). */
  initialized: boolean;
}

function createKeypointState(): KeypointState {
  return {
    filterHigh:   createOneEuroFilter2D(FILTER_PARAMS_HIGH),
    filterMedium: createOneEuroFilter2D(FILTER_PARAMS_MEDIUM),
    filterLow:    createOneEuroFilter2D(FILTER_PARAMS_LOW),
    lastX:  0,
    lastY:  0,
    lastScore: 0,
    status: 'missing',
    consecutiveMisses: 0,
    initialized: false,
  };
}

function resetKeypointState(ks: KeypointState): void {
  resetOneEuroFilter2D(ks.filterHigh);
  resetOneEuroFilter2D(ks.filterMedium);
  resetOneEuroFilter2D(ks.filterLow);
  ks.lastX = 0;
  ks.lastY = 0;
  ks.lastScore = 0;
  ks.status = 'missing';
  ks.consecutiveMisses = 0;
  ks.initialized = false;
}

// ── Stabilizer state ──────────────────────────────────────────────────────────

export interface PoseStabilizerState {
  kpStates:     KeypointState[];
  outlier:      OutlierRejectionState;
  quality:      TrackingQualityState;
}

export function createPoseStabilizer(): PoseStabilizerState {
  return {
    kpStates: Array.from({ length: NUM_KEYPOINTS }, createKeypointState),
    outlier:  createOutlierRejectionState(),
    quality:  createTrackingQualityState(),
  };
}

export function resetPoseStabilizer(state: PoseStabilizerState): void {
  for (const ks of state.kpStates) resetKeypointState(ks);
  resetOutlierState(state.outlier);
  state.quality = createTrackingQualityState();
}

// ── Smoothing helpers ─────────────────────────────────────────────────────────

/**
 * Update a single keypoint state with a new raw observation.
 * Picks the appropriate filter tier based on confidence.
 */
function updateTrackedKeypoint(
  ks: KeypointState,
  rawX: number,
  rawY: number,
  rawScore: number
): void {
  ks.consecutiveMisses = 0;
  ks.status = 'tracked';

  let smoothed: { x: number; y: number };

  if (rawScore >= CONF_HIGH) {
    smoothed = oneEuroFilter2DStep(ks.filterHigh, rawX, rawY);
    // Keep medium/low filters warmed up with the current best estimate
    oneEuroFilter2DStep(ks.filterMedium, smoothed.x, smoothed.y);
    oneEuroFilter2DStep(ks.filterLow,    smoothed.x, smoothed.y);
  } else if (rawScore >= CONF_MEDIUM) {
    smoothed = oneEuroFilter2DStep(ks.filterMedium, rawX, rawY);
    oneEuroFilter2DStep(ks.filterHigh,   smoothed.x, smoothed.y);
    oneEuroFilter2DStep(ks.filterLow,    smoothed.x, smoothed.y);
  } else {
    // CONF_LOW ≤ score < CONF_MEDIUM: nudge very slightly, don't fully trust
    // We blend: 90% last known + 10% raw, then smooth
    const nudgeX = 0.9 * ks.lastX + 0.1 * rawX;
    const nudgeY = 0.9 * ks.lastY + 0.1 * rawY;
    smoothed = oneEuroFilter2DStep(ks.filterLow, nudgeX, nudgeY);
    oneEuroFilter2DStep(ks.filterHigh,   smoothed.x, smoothed.y);
    oneEuroFilter2DStep(ks.filterMedium, smoothed.x, smoothed.y);
  }

  ks.lastX = smoothed.x;
  ks.lastY = smoothed.y;

  // Smooth the confidence score with a simple EMA
  const confAlpha = rawScore >= CONF_HIGH ? 0.4 : 0.2;
  ks.lastScore = ks.initialized
    ? confAlpha * rawScore + (1 - confAlpha) * ks.lastScore
    : rawScore;

  ks.initialized = true;
}

/**
 * Handle a missing keypoint for this frame — advance hold counter.
 */
function handleMissingKeypoint(ks: KeypointState): void {
  if (!ks.initialized) {
    ks.status = 'missing';
    return;
  }

  ks.consecutiveMisses += 1;

  if (ks.consecutiveMisses <= MAX_HOLD_FRAMES) {
    ks.status = 'held';
    // Decay the held confidence gently each frame
    ks.lastScore = ks.lastScore * 0.85;
  } else {
    ks.status = 'missing';
  }
}

// ── Body geometry ─────────────────────────────────────────────────────────────

/**
 * Estimate the body center from torso-anchor keypoints.
 * Uses withers + throat if available, else any visible set.
 */
function computeBodyCenter(
  kpStates: KeypointState[]
): { x: number; y: number } | null {
  const anchorIndices = [IDX_WITHERS, IDX_THROAT, IDX_NOSE];
  const visible = anchorIndices.filter(
    (i) => kpStates[i].status !== 'missing' && kpStates[i].initialized
  );

  if (visible.length === 0) return null;

  const sumX = visible.reduce((s, i) => s + kpStates[i].lastX, 0);
  const sumY = visible.reduce((s, i) => s + kpStates[i].lastY, 0);
  return { x: sumX / visible.length, y: sumY / visible.length };
}

/**
 * Estimate body orientation angle (radians) from withers → tail_start vector.
 * Returns null if either anchor is missing.
 */
function computeBodyAngle(kpStates: KeypointState[]): number | null {
  const withers   = kpStates[IDX_WITHERS];
  const tailStart = kpStates[IDX_TAIL_START];

  if (
    !withers.initialized   || withers.status   === 'missing' ||
    !tailStart.initialized || tailStart.status === 'missing'
  ) {
    return null;
  }

  const dx = tailStart.lastX - withers.lastX;
  const dy = tailStart.lastY - withers.lastY;
  return Math.atan2(dy, dx);
}

// ── Main step function ────────────────────────────────────────────────────────

/**
 * Feed one raw observation (or null for a dropout frame) through the
 * stabilization pipeline and return a StabilizedPoseObservation.
 *
 * @param state   Mutable stabilizer state (updated in place).
 * @param raw     Raw observation from the decoder, or null (no detection).
 * @param timestamp  Unix ms for this frame.
 */
export function stepPoseStabilizer(
  state: PoseStabilizerState,
  raw: RawPoseObservation | null,
  timestamp: number
): StabilizedPoseObservation {
  const isDropout = raw === null;
  recordFrame(state.quality, !isDropout);

  // Build an index of raw keypoints by index for O(1) lookup
  const rawByIndex = new Map<number, { x: number; y: number; score: number }>();

  if (!isDropout) {
    // Run outlier rejection on all incoming keypoints
    const accepted = filterOutliers(state.outlier, raw.keypoints, raw.bbox);
    for (const kp of accepted) {
      rawByIndex.set(kp.index, { x: kp.x, y: kp.y, score: kp.score });
    }
  }

  // Update every keypoint state
  for (let i = 0; i < NUM_KEYPOINTS; i++) {
    const ks  = state.kpStates[i];
    const raw = rawByIndex.get(i);

    if (raw !== undefined && raw.score >= CONF_LOW) {
      updateTrackedKeypoint(ks, raw.x, raw.y, raw.score);
    } else {
      handleMissingKeypoint(ks);
    }
  }

  // Build output keypoints array (all 24, including missing ones)
  const stabilizedKeypoints: StabilizedKeypoint[] = state.kpStates.map((ks, i) => ({
    name:        DOG_KEYPOINT_NAMES[i] as DogKeypointName,
    index:       i,
    x:           ks.lastX,
    y:           ks.lastY,
    score:       ks.lastScore,
    status:      ks.status,
    heldFrames:  ks.status === 'held' ? ks.consecutiveMisses : 0,
  }));

  // Compute tracking quality inputs
  const visibleKps = stabilizedKeypoints.filter((kp) => kp.status !== 'missing');
  const visibleIndices = new Set(visibleKps.map((kp) => kp.index));
  const dropoutRate = recentDropoutRate(state.quality);

  const trackingQuality = computeTrackingQuality({
    visibleConfidences: visibleKps.map((kp) => kp.score),
    visibleCount:       visibleKps.length,
    hasTorsoAnchor:     hasTorsoAnchorVisible(visibleIndices),
    dropoutRate,
  });

  return {
    keypoints:       stabilizedKeypoints,
    confidence:      isDropout ? 0 : (raw?.confidence ?? 0),
    trackingQuality,
    bodyCenter:      computeBodyCenter(state.kpStates),
    bodyAngle:       computeBodyAngle(state.kpStates),
    timestamp,
    isDropout,
  };
}
