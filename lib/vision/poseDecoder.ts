// ─────────────────────────────────────────────────────────────────────────────
// Pose Decoder
//
// Pure, UI-agnostic decoder for best_float16.tflite output.
//
// Model I/O contract:
//   Input  : float32 [1, 640, 640, 3]  – RGB, values in [0, 1]
//   Output : float32 [1, 77, 8400]     – D-first layout (NOT transposed)
//
// Output layout (D-first means axis-0 = descriptor dimension):
//   output[0][d][i]  where d ∈ [0, 76], i ∈ [0, 8399]
//
//   d 0-3   : bbox   (cx, cy, w, h) – values already normalised to [0, 1]
//   d 4     : detection confidence
//   d 5-76  : 24 keypoints × 3 values each (x, y, visibility)
//             keypoint k → d offset = 5 + k*3 + {0=x, 1=y, 2=vis}
//             x, y are already normalised to [0, 1] — do NOT divide by 640.
//
// No letterbox correction is applied because input is stretched to 640×640.
// ─────────────────────────────────────────────────────────────────────────────

import {
  DOG_KEYPOINT_NAMES,
  NUM_KEYPOINTS,
  type DogKeypointName,
  type NormalizedBBox,
  type PoseKeypoint,
  type PoseObservation,
} from '@/types/pose';

// ── Constants ─────────────────────────────────────────────────────────────────

const BBOX_DIMS = 4;           // cx, cy, w, h
const CONF_DIM = 1;            // detection confidence at d=4
const KP_VALUES_PER_KP = 3;   // x, y, visibility per keypoint
const EXPECTED_D = BBOX_DIMS + CONF_DIM + NUM_KEYPOINTS * KP_VALUES_PER_KP; // 77
const CONF_DIM_IDX = 4;        // index of the confidence dimension

/** Default detection confidence threshold. */
export const DEFAULT_DETECTION_THRESHOLD = 0.35;

/** Default per-keypoint visibility threshold. */
export const DEFAULT_KEYPOINT_THRESHOLD = 0.35;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DecodeOptions {
  /** Minimum detection confidence to consider a candidate valid. */
  detectionThreshold?: number;
  /** Minimum keypoint visibility score to include a keypoint. */
  keypointThreshold?: number;
  /** Unix timestamp (ms) to embed in the result. Defaults to Date.now(). */
  timestamp?: number;
  /** Source image pixel width, forwarded to PoseObservation unchanged. */
  sourceWidth?: number;
  /** Source image pixel height, forwarded to PoseObservation unchanged. */
  sourceHeight?: number;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Extract the detection confidence for candidate i from the raw output tensor.
 * The tensor is stored D-first: index = d * numCandidates + i.
 */
function candidateConf(data: Float32Array, numCandidates: number, i: number): number {
  return data[CONF_DIM_IDX * numCandidates + i];
}

/**
 * Find the index of the candidate with the highest detection confidence.
 * Returns -1 if no candidate meets the threshold.
 */
function bestCandidateIndex(
  data: Float32Array,
  numCandidates: number,
  threshold: number
): number {
  let bestIdx = -1;
  let bestConf = threshold; // must beat threshold to be valid

  for (let i = 0; i < numCandidates; i++) {
    const conf = candidateConf(data, numCandidates, i);
    if (conf > bestConf) {
      bestConf = conf;
      bestIdx = i;
    }
  }

  return bestIdx;
}

/**
 * Read a single float from the D-first tensor at dimension d, candidate i.
 */
function readDim(data: Float32Array, numCandidates: number, d: number, i: number): number {
  return data[d * numCandidates + i];
}

/**
 * Extract the normalised bounding box for candidate i.
 */
function extractBBox(data: Float32Array, numCandidates: number, i: number): NormalizedBBox {
  return {
    cx: readDim(data, numCandidates, 0, i),
    cy: readDim(data, numCandidates, 1, i),
    w:  readDim(data, numCandidates, 2, i),
    h:  readDim(data, numCandidates, 3, i),
  };
}

/**
 * Extract all keypoints for candidate i, filtering by visibility threshold.
 */
function extractKeypoints(
  data: Float32Array,
  numCandidates: number,
  i: number,
  keypointThreshold: number
): PoseKeypoint[] {
  const keypoints: PoseKeypoint[] = [];
  const kpBaseD = BBOX_DIMS + CONF_DIM; // d=5

  for (let k = 0; k < NUM_KEYPOINTS; k++) {
    const dX   = kpBaseD + k * KP_VALUES_PER_KP + 0;
    const dY   = kpBaseD + k * KP_VALUES_PER_KP + 1;
    const dVis = kpBaseD + k * KP_VALUES_PER_KP + 2;

    const x     = readDim(data, numCandidates, dX,   i);
    const y     = readDim(data, numCandidates, dY,   i);
    const score = readDim(data, numCandidates, dVis, i);

    if (score >= keypointThreshold) {
      keypoints.push({
        name:  DOG_KEYPOINT_NAMES[k] as DogKeypointName,
        index: k,
        x,
        y,
        score,
      });
    }
  }

  return keypoints;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Decode raw TFLite output into a PoseObservation.
 *
 * @param rawOutput  The flat Float32Array returned by the TFLite runtime for
 *                   the single output tensor (shape [1, 77, 8400], already
 *                   sliced to the inner [77, 8400] region — i.e. batch dim
 *                   stripped). Length must be 77 × 8400 = 646 800.
 * @param options    Thresholds and metadata.
 * @returns          A PoseObservation for the best detection, or null if no
 *                   candidate clears the detection threshold.
 */
export function decodePoseOutput(
  rawOutput: Float32Array,
  options: DecodeOptions = {}
): PoseObservation | null {
  const {
    detectionThreshold = DEFAULT_DETECTION_THRESHOLD,
    keypointThreshold  = DEFAULT_KEYPOINT_THRESHOLD,
    timestamp          = Date.now(),
    sourceWidth,
    sourceHeight,
  } = options;

  // ── Validate tensor dimensions ────────────────────────────────────────────

  if (rawOutput.length % EXPECTED_D !== 0) {
    console.warn(
      `[poseDecoder] Unexpected tensor length ${rawOutput.length}. ` +
      `Expected a multiple of ${EXPECTED_D} (77). Output will not be decoded.`
    );
    return null;
  }

  const numCandidates = rawOutput.length / EXPECTED_D; // should be 8400

  // ── Find best candidate ───────────────────────────────────────────────────

  const bestIdx = bestCandidateIndex(rawOutput, numCandidates, detectionThreshold);
  if (bestIdx === -1) {
    return null; // no detection above threshold
  }

  const confidence = candidateConf(rawOutput, numCandidates, bestIdx);
  const bbox       = extractBBox(rawOutput, numCandidates, bestIdx);
  const keypoints  = extractKeypoints(rawOutput, numCandidates, bestIdx, keypointThreshold);

  return {
    confidence,
    keypoints,
    timestamp,
    bbox,
    ...(sourceWidth  !== undefined ? { sourceWidth }  : {}),
    ...(sourceHeight !== undefined ? { sourceHeight } : {}),
  };
}
