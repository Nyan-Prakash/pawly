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
