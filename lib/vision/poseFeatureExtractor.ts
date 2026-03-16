// ─────────────────────────────────────────────────────────────────────────────
// Pose Feature Extractor
//
// Derives higher-level geometric features from a StabilizedPoseObservation.
// All features are in normalised [0,1] image coordinates unless stated.
//
// Design principles:
//   - Fail gracefully: every feature that cannot be computed returns null
//   - Rolling window: motion/stability signals are computed over a sliding
//     history of recent frames, not just the current one
//   - No magic numbers in call sites: all thresholds live here
//
// Keypoint index reference (dog model):
//   0  front_left_paw        6  front_right_paw
//   1  front_left_knee       7  front_right_knee
//   2  front_left_elbow      8  front_right_elbow
//   3  rear_left_paw         9  rear_right_paw
//   4  rear_left_knee        10 rear_right_knee
//   5  rear_left_elbow       11 rear_right_elbow
//   12 tail_start            13 tail_end
//   14 left_ear_base         15 right_ear_base
//   16 nose                  17 chin
//   18 left_ear_tip          19 right_ear_tip
//   20 left_eye              21 right_eye
//   22 withers               23 throat
// ─────────────────────────────────────────────────────────────────────────────

import type { StabilizedPoseObservation, StabilizedKeypoint, TrackingQuality } from '../../types/pose.ts';

// ── Keypoint indices ──────────────────────────────────────────────────────────

export const KP = {
  FRONT_LEFT_PAW:    0,
  FRONT_LEFT_KNEE:   1,
  FRONT_LEFT_ELBOW:  2,
  REAR_LEFT_PAW:     3,
  REAR_LEFT_KNEE:    4,
  REAR_LEFT_ELBOW:   5,
  FRONT_RIGHT_PAW:   6,
  FRONT_RIGHT_KNEE:  7,
  FRONT_RIGHT_ELBOW: 8,
  REAR_RIGHT_PAW:    9,
  REAR_RIGHT_KNEE:   10,
  REAR_RIGHT_ELBOW:  11,
  TAIL_START:        12,
  TAIL_END:          13,
  LEFT_EAR_BASE:     14,
  RIGHT_EAR_BASE:    15,
  NOSE:              16,
  CHIN:              17,
  LEFT_EAR_TIP:      18,
  RIGHT_EAR_TIP:     19,
  LEFT_EYE:          20,
  RIGHT_EYE:         21,
  WITHERS:           22,
  THROAT:            23,
} as const;

// ── Rolling window size ───────────────────────────────────────────────────────

/** Number of recent frames used for motion and stability calculations. */
export const FEATURE_WINDOW_SIZE = 8; // ~0.8 s at 10 FPS

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Snapshot of extracted pose features for a single frame.
 * All angle-like values are in radians. All position values are normalised.
 */
export interface PoseFeatures {
  // ── Body geometry ──────────────────────────────────────────────────────────
  /** Estimated body center (from withers/throat/nose). */
  bodyCenter: { x: number; y: number } | null;
  /** Withers→tail_start orientation in radians. null when not derivable. */
  bodyAngle: number | null;
  /**
   * Bounding box of all visible keypoints.
   * Height/width ratio is the primary sit/down discriminator:
   *   - stand: tall and wide  (h/w ~ 0.8–1.2)
   *   - sit:   medium height  (h/w ~ 1.0–1.6)
   *   - down:  wide and low   (h/w < 0.6)
   */
  keypointBBox: { minX: number; minY: number; maxX: number; maxY: number } | null;
  /** Height / width of the keypoint bounding box. null if bbox unavailable. */
  aspectRatio: number | null;

  // ── Vertical signals ───────────────────────────────────────────────────────
  /**
   * Normalised Y of the withers (back of neck/shoulders) relative to body height.
   * Lower Y = higher in frame = upright. Higher Y = lower in frame = crouching.
   * null when withers not visible.
   */
  withersRelativeY: number | null;
  /**
   * Mean Y of all four paw keypoints relative to withers Y.
   * Large positive value → paws well below withers → likely standing/sitting.
   * Near zero → paws and body at similar height → likely down.
   * null when not enough paws visible.
   */
  pawsRelativeToWithers: number | null;
  /**
   * Mean Y of front paws relative to rear paws.
   * Positive → front paws lower than rear (sitting back on haunches).
   * Negative → rear paws lower (downward slope).
   * null when insufficient paw visibility.
   */
  frontRearPawDeltaY: number | null;

  // ── Leg geometry ──────────────────────────────────────────────────────────
  /**
   * Average front leg bend angle (paw→knee→elbow) in radians, averaged over
   * left and right sides. Smaller angle = more bent. null when not derivable.
   *
   * Interpretation:
   *   stand: ~2.5–3.1 rad (mostly straight)
   *   sit:   ~1.0–2.0 rad (moderate bend at front)
   *   down:  ~0.5–1.5 rad (very bent / folded)
   */
  frontLegBendAngle: number | null;
  /**
   * Average rear leg bend angle (paw→knee→elbow) in radians.
   * Similar interpretation to frontLegBendAngle.
   */
  rearLegBendAngle: number | null;

  // ── Compactness / compression ──────────────────────────────────────────────
  /**
   * Ratio of visible keypoint spread (diagonal of bbox) to body diagonal
   * estimate. Lower value → more compact/compressed pose → down/sit.
   * null when bbox or body estimate unavailable.
   */
  postureCompactness: number | null;

  // ── Motion and stability ───────────────────────────────────────────────────
  /**
   * Mean per-frame displacement of the body center over the recent window.
   * Normalised to body size. 0 = perfectly still, 1 = major movement.
   */
  motionScore: number;
  /**
   * Variance of body center Y over the recent window.
   * High variance → bouncing/transitioning. Low variance → stable hold.
   */
  verticalStability: number;

  // ── Hold duration ──────────────────────────────────────────────────────────
  /**
   * How long the current body center has been within a small radius.
   * In milliseconds. 0 if currently moving.
   */
  holdDurationMs: number;

  // ── Confidence ────────────────────────────────────────────────────────────
  /**
   * Weighted mean confidence of keypoints used for classification-critical
   * measurements (withers, elbows, knees, paws).
   */
  postureConfidence: number;
  /** Number of classification-relevant keypoints visible (max 10). */
  visibleKeyCount: number;
}

// ── History entry ─────────────────────────────────────────────────────────────

interface FrameSnapshot {
  bodyCenter: { x: number; y: number } | null;
  timestamp: number;
}

export interface FeatureExtractorState {
  history: FrameSnapshot[];
  holdStartMs: number | null;
  holdAnchor: { x: number; y: number } | null;
}

export function createFeatureExtractorState(): FeatureExtractorState {
  return { history: [], holdStartMs: null, holdAnchor: null };
}

export function resetFeatureExtractorState(state: FeatureExtractorState): void {
  state.history = [];
  state.holdStartMs = null;
  state.holdAnchor = null;
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function kp(obs: StabilizedPoseObservation, idx: number): StabilizedKeypoint {
  return obs.keypoints[idx];
}

function isVisible(kpt: StabilizedKeypoint): boolean {
  return kpt.status !== 'missing' && kpt.score > 0.15;
}

/**
 * Angle at vertex B formed by the three points A–B–C (radians, 0–π).
 */
function angleBetween(
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): number {
  const abx = ax - bx; const aby = ay - by;
  const cbx = cx - bx; const cby = cy - by;
  const dot  = abx * cbx + aby * cby;
  const magA = Math.sqrt(abx * abx + aby * aby);
  const magC = Math.sqrt(cbx * cbx + cby * cby);
  if (magA < 1e-6 || magC < 1e-6) return Math.PI; // degenerate → treat as straight
  return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magC))));
}

function euclidean(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

// ── Classification-relevant keypoint indices ──────────────────────────────────

const POSTURE_KEYPOINTS = [
  KP.WITHERS,
  KP.FRONT_LEFT_ELBOW,  KP.FRONT_RIGHT_ELBOW,
  KP.FRONT_LEFT_KNEE,   KP.FRONT_RIGHT_KNEE,
  KP.FRONT_LEFT_PAW,    KP.FRONT_RIGHT_PAW,
  KP.REAR_LEFT_ELBOW,   KP.REAR_RIGHT_ELBOW,
  KP.REAR_LEFT_PAW,     KP.REAR_RIGHT_PAW,
];

/** Threshold for "hold" detection: max body-center movement in normalised coords. */
const HOLD_RADIUS = 0.025;

// ── Main extractor ────────────────────────────────────────────────────────────

/**
 * Extract pose features from a single stabilized observation.
 * Mutates `state` to update rolling history.
 */
export function extractPoseFeatures(
  obs: StabilizedPoseObservation,
  state: FeatureExtractorState
): PoseFeatures {
  // ── Update rolling history ─────────────────────────────────────────────────
  const snapshot: FrameSnapshot = { bodyCenter: obs.bodyCenter, timestamp: obs.timestamp };
  state.history.push(snapshot);
  if (state.history.length > FEATURE_WINDOW_SIZE) state.history.shift();

  // ── Keypoint bounding box ─────────────────────────────────────────────────
  const visibleKps = obs.keypoints.filter(isVisible);
  let keypointBBox: PoseFeatures['keypointBBox'] = null;
  let aspectRatio: number | null = null;

  if (visibleKps.length >= 2) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const kpt of visibleKps) {
      if (kpt.x < minX) minX = kpt.x;
      if (kpt.y < minY) minY = kpt.y;
      if (kpt.x > maxX) maxX = kpt.x;
      if (kpt.y > maxY) maxY = kpt.y;
    }
    keypointBBox = { minX, minY, maxX, maxY };
    const w = maxX - minX;
    const h = maxY - minY;
    aspectRatio = w > 0.01 ? h / w : null;
  }

  // ── Withers relative Y ────────────────────────────────────────────────────
  const withers = kp(obs, KP.WITHERS);
  const withersRelativeY = isVisible(withers)
    ? (keypointBBox
        ? (withers.y - keypointBBox.minY) / Math.max(keypointBBox.maxY - keypointBBox.minY, 0.01)
        : null)
    : null;

  // ── Paws relative to withers ──────────────────────────────────────────────
  const pawIndices = [KP.FRONT_LEFT_PAW, KP.FRONT_RIGHT_PAW, KP.REAR_LEFT_PAW, KP.REAR_RIGHT_PAW];
  const visiblePaws = pawIndices.map((i) => kp(obs, i)).filter(isVisible);

  let pawsRelativeToWithers: number | null = null;
  if (visiblePaws.length >= 2 && isVisible(withers)) {
    const meanPawY = visiblePaws.reduce((s, p) => s + p.y, 0) / visiblePaws.length;
    pawsRelativeToWithers = meanPawY - withers.y; // positive = paws below withers
  }

  // ── Front/rear paw delta Y ────────────────────────────────────────────────
  const frontPaws = [KP.FRONT_LEFT_PAW, KP.FRONT_RIGHT_PAW]
    .map((i) => kp(obs, i)).filter(isVisible);
  const rearPaws  = [KP.REAR_LEFT_PAW, KP.REAR_RIGHT_PAW]
    .map((i) => kp(obs, i)).filter(isVisible);

  let frontRearPawDeltaY: number | null = null;
  if (frontPaws.length >= 1 && rearPaws.length >= 1) {
    const meanFrontY = frontPaws.reduce((s, p) => s + p.y, 0) / frontPaws.length;
    const meanRearY  = rearPaws.reduce((s, p)  => s + p.y, 0) / rearPaws.length;
    frontRearPawDeltaY = meanFrontY - meanRearY; // positive = front lower than rear
  }

  // ── Leg bend angles ───────────────────────────────────────────────────────
  // Front: paw → knee → elbow   (angle at knee)
  function legBend(pawIdx: number, kneeIdx: number, elbowIdx: number): number | null {
    const paw   = kp(obs, pawIdx);
    const knee  = kp(obs, kneeIdx);
    const elbow = kp(obs, elbowIdx);
    if (!isVisible(paw) || !isVisible(knee) || !isVisible(elbow)) return null;
    return angleBetween(paw.x, paw.y, knee.x, knee.y, elbow.x, elbow.y);
  }

  const frontAngles = [
    legBend(KP.FRONT_LEFT_PAW,  KP.FRONT_LEFT_KNEE,  KP.FRONT_LEFT_ELBOW),
    legBend(KP.FRONT_RIGHT_PAW, KP.FRONT_RIGHT_KNEE, KP.FRONT_RIGHT_ELBOW),
  ].filter((a): a is number => a !== null);

  const rearAngles = [
    legBend(KP.REAR_LEFT_PAW,  KP.REAR_LEFT_KNEE,  KP.REAR_LEFT_ELBOW),
    legBend(KP.REAR_RIGHT_PAW, KP.REAR_RIGHT_KNEE, KP.REAR_RIGHT_ELBOW),
  ].filter((a): a is number => a !== null);

  const frontLegBendAngle = frontAngles.length > 0
    ? frontAngles.reduce((s, a) => s + a, 0) / frontAngles.length
    : null;
  const rearLegBendAngle  = rearAngles.length > 0
    ? rearAngles.reduce((s, a)  => s + a, 0) / rearAngles.length
    : null;

  // ── Posture compactness ───────────────────────────────────────────────────
  let postureCompactness: number | null = null;
  if (keypointBBox && isVisible(withers)) {
    const bboxDiag = euclidean(keypointBBox.minX, keypointBBox.minY, keypointBBox.maxX, keypointBBox.maxY);
    // Body size proxy: withers to nearest paw
    const bodyRef = visiblePaws.length > 0
      ? visiblePaws.reduce((min, p) => {
          const d = euclidean(withers.x, withers.y, p.x, p.y);
          return d < min ? d : min;
        }, Infinity)
      : null;
    if (bodyRef !== null && bodyRef > 0.01) {
      postureCompactness = Math.min(bboxDiag / (bodyRef * 2), 2); // cap at 2 for normalisation
    }
  }

  // ── Motion score ─────────────────────────────────────────────────────────
  let motionScore = 0;
  let verticalStability = 0;

  const centersWithData = state.history
    .filter((h) => h.bodyCenter !== null)
    .map((h) => h.bodyCenter!);

  if (centersWithData.length >= 2) {
    let totalDist = 0;
    for (let i = 1; i < centersWithData.length; i++) {
      totalDist += euclidean(
        centersWithData[i].x, centersWithData[i].y,
        centersWithData[i - 1].x, centersWithData[i - 1].y
      );
    }
    motionScore = Math.min(totalDist / (centersWithData.length - 1) / 0.05, 1);

    const meanY = centersWithData.reduce((s, c) => s + c.y, 0) / centersWithData.length;
    verticalStability = Math.min(
      centersWithData.reduce((s, c) => s + (c.y - meanY) ** 2, 0) / centersWithData.length / 0.001,
      1
    );
  }

  // ── Hold duration ─────────────────────────────────────────────────────────
  const currentCenter = obs.bodyCenter;
  let holdDurationMs = 0;

  if (currentCenter !== null) {
    if (
      state.holdAnchor === null ||
      euclidean(currentCenter.x, currentCenter.y, state.holdAnchor.x, state.holdAnchor.y) > HOLD_RADIUS
    ) {
      state.holdAnchor = currentCenter;
      state.holdStartMs = obs.timestamp;
    } else if (state.holdStartMs !== null) {
      holdDurationMs = obs.timestamp - state.holdStartMs;
    }
  } else {
    // Lost body center — reset hold
    state.holdAnchor = null;
    state.holdStartMs = null;
  }

  // ── Posture confidence ────────────────────────────────────────────────────
  const postureKps = POSTURE_KEYPOINTS.map((i) => kp(obs, i));
  const visiblePostureKps = postureKps.filter(isVisible);
  const postureConfidence = visiblePostureKps.length > 0
    ? visiblePostureKps.reduce((s, k) => s + k.score, 0) / visiblePostureKps.length
    : 0;

  return {
    bodyCenter:            obs.bodyCenter,
    bodyAngle:             obs.bodyAngle,
    keypointBBox,
    aspectRatio,
    withersRelativeY,
    pawsRelativeToWithers,
    frontRearPawDeltaY,
    frontLegBendAngle,
    rearLegBendAngle,
    postureCompactness,
    motionScore,
    verticalStability,
    holdDurationMs,
    postureConfidence,
    visibleKeyCount:       visiblePostureKps.length,
  };
}
