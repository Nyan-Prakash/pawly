// ─────────────────────────────────────────────────────────────────────────────
// Dog Pose Types
//
// Normalized coordinate system: x and y are in [0, 1] relative to the
// image dimensions (0,0 = top-left, 1,1 = bottom-right).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Canonical keypoint indices produced by best_float16.tflite.
 * The model outputs 24 keypoints in this exact order.
 */
export const DOG_KEYPOINT_NAMES = [
  'front_left_paw',    // 0
  'front_left_knee',   // 1
  'front_left_elbow',  // 2
  'rear_left_paw',     // 3
  'rear_left_knee',    // 4
  'rear_left_elbow',   // 5
  'front_right_paw',   // 6
  'front_right_knee',  // 7
  'front_right_elbow', // 8
  'rear_right_paw',    // 9
  'rear_right_knee',   // 10
  'rear_right_elbow',  // 11
  'tail_start',        // 12
  'tail_end',          // 13
  'left_ear_base',     // 14
  'right_ear_base',    // 15
  'nose',              // 16
  'chin',              // 17
  'left_ear_tip',      // 18
  'right_ear_tip',     // 19
  'left_eye',          // 20
  'right_eye',         // 21
  'withers',           // 22
  'throat',            // 23
] as const;

export type DogKeypointName = (typeof DOG_KEYPOINT_NAMES)[number];

export const NUM_KEYPOINTS = DOG_KEYPOINT_NAMES.length; // 24

/**
 * A single detected body landmark.
 *
 * @property name    - Semantic label from DOG_KEYPOINT_NAMES.
 * @property index   - Index in the model's keypoint array (0-23).
 * @property x       - Normalized x coordinate in [0, 1].
 * @property y       - Normalized y coordinate in [0, 1].
 * @property score   - Visibility/confidence in [0, 1].
 */
export interface PoseKeypoint {
  name: DogKeypointName;
  index: number;
  x: number;
  y: number;
  score: number;
}

/**
 * Bounding box in normalized coordinates.
 * cx/cy are the box centre; w/h are full width/height, all in [0, 1].
 */
export interface NormalizedBBox {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

/**
 * The result of one inference pass over a single image frame.
 *
 * @property confidence    - Detection confidence of the best candidate.
 * @property keypoints     - Array of 24 keypoints (only those above the
 *                           visibility threshold are included).
 * @property timestamp     - Unix ms at the time of inference.
 * @property bbox          - Optional bounding box in normalized coords.
 * @property sourceWidth   - Pixel width of the image passed to the model.
 * @property sourceHeight  - Pixel height of the image passed to the model.
 */
export interface PoseObservation {
  confidence: number;
  keypoints: PoseKeypoint[];
  timestamp: number;
  bbox?: NormalizedBBox;
  sourceWidth?: number;
  sourceHeight?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stabilized pose types
// ─────────────────────────────────────────────────────────────────────────────

/** Raw observation directly from the model decoder, before any stabilization. */
export type RawPoseObservation = PoseObservation;

/** Per-keypoint tracking lifecycle state. */
export type KeypointTrackingStatus = 'tracked' | 'held' | 'missing';

/** Classified dog posture. */
export type PostureLabel = 'sit' | 'down' | 'stand' | 'unknown';

/**
 * Human-readable overall tracking quality.
 *
 * - 'good'  — most keypoints visible, high confidence, low dropout rate
 * - 'fair'  — partial visibility or moderate dropout
 * - 'poor'  — few keypoints visible, low confidence, or sustained dropout
 */
export type TrackingQuality = 'good' | 'fair' | 'poor';

/**
 * A single smoothed and validated keypoint with lifecycle metadata.
 *
 * @property name          - Semantic label (same as PoseKeypoint.name).
 * @property index         - Keypoint index 0-23.
 * @property x             - Smoothed normalised x in [0, 1].
 * @property y             - Smoothed normalised y in [0, 1].
 * @property score         - Smoothed confidence in [0, 1].
 * @property status        - Whether this point is actively tracked, held from
 *                           a recent frame, or has been missing too long.
 * @property heldFrames    - How many consecutive frames this point has been
 *                           held (0 when status is 'tracked').
 */
export interface StabilizedKeypoint {
  name: DogKeypointName;
  index: number;
  x: number;
  y: number;
  score: number;
  status: KeypointTrackingStatus;
  heldFrames: number;
}

/**
 * The stabilized output of one camera frame after smoothing, outlier
 * rejection, dropout handling, and quality classification.
 *
 * @property keypoints         - 24 entries, one per model keypoint.
 *                               Missing keypoints are still present in the
 *                               array but have status 'missing'.
 * @property confidence        - Detection confidence of the underlying
 *                               raw observation, or 0 if fully dropped out.
 * @property trackingQuality   - Global quality classification.
 * @property bodyCenter        - Estimated center of the dog's body in
 *                               normalised coords, derived from torso anchors.
 *                               null when not enough anchors are visible.
 * @property bodyAngle         - Estimated body orientation in radians
 *                               (withers→tail_start vector). null when not
 *                               derivable.
 * @property timestamp         - Unix ms timestamp of the underlying frame.
 * @property isDropout         - true when no detection was received this frame
 *                               (keypoints are all held or missing).
 */
export interface StabilizedPoseObservation {
  keypoints: StabilizedKeypoint[];
  confidence: number;
  trackingQuality: TrackingQuality;
  bodyCenter: { x: number; y: number } | null;
  bodyAngle: number | null;
  timestamp: number;
  isDropout: boolean;
}
