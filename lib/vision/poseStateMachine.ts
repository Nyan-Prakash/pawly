// ─────────────────────────────────────────────────────────────────────────────
// Pose State Machine
//
// Owns the hysteresis logic that wraps the classifier and emits events.
//
// Architecture:
//
//   StabilizedPoseObservation
//         ↓
//   poseFeatureExtractor  → PoseFeatures
//         ↓
//   postureClassifier     → PostureClassification
//         ↓
//   PoseStateMachine      → PostureState + PoseEvent[]
//
// Hysteresis:
//   - To ENTER a posture:  classification must agree for ENTER_FRAMES_REQUIRED
//     consecutive frames.
//   - To EXIT a posture:   a different classification must agree for
//     EXIT_FRAMES_REQUIRED consecutive frames (prevents single-frame breaks).
//   - Poor tracking quality increases both thresholds.
//
// Usage:
//   const sm = createPoseStateMachine();
//   const { state, events } = stepPoseStateMachine(sm, stabilizedObs);
//   // events is an array (may be empty or have multiple events per frame)
//   resetPoseStateMachine(sm);
// ─────────────────────────────────────────────────────────────────────────────

import type { StabilizedPoseObservation, TrackingQuality } from '../../types/pose.ts';

import {
  extractPoseFeatures,
  createFeatureExtractorState,
  resetFeatureExtractorState,
  type FeatureExtractorState,
  type PoseFeatures,
} from './poseFeatureExtractor.ts';

import {
  classifyPosture,
  type PostureLabel,
  type PostureClassification,
} from './postureClassifier.ts';

import {
  makeEnteredEvent,
  makeBrokeEvent,
  makeHeldEvent,
  makeUnknownEvent,
  makeMotionEvent,
  makeTrackingLostEvent,
  makeTrackingRecoveredEvent,
  SIGNIFICANT_MOTION_THRESHOLD,
  HOLD_EMIT_INTERVAL_MS,
  type PoseEvent,
} from './poseEventDetector.ts';

// ── Hysteresis thresholds ─────────────────────────────────────────────────────

/**
 * Frames a candidate posture must be consistently classified before we
 * transition into it.  Higher = less reactive but more stable.
 */
const ENTER_FRAMES: Record<TrackingQuality, number> = {
  good: 3,
  fair: 4,
  poor: 6,
};

/**
 * Frames of conflicting evidence required to exit the current posture.
 * Higher = more resistant to transient breaks.
 */
const EXIT_FRAMES: Record<TrackingQuality, number> = {
  good: 3,
  fair: 5,
  poor: 8,
};

/** Frames of 'poor' quality before we emit tracking_lost. */
const TRACKING_LOST_FRAMES = 5;
/** Frames of non-poor quality before we emit tracking_recovered. */
const TRACKING_RECOVERED_FRAMES = 3;

// ── Public state shape ────────────────────────────────────────────────────────

/** The current posture state exposed to consumers. */
export interface PostureState {
  /** The currently confirmed posture label. */
  label: PostureLabel;
  /** Classifier confidence at the time the current posture was entered. */
  confidence: number;
  /** Whether tracking is currently considered lost. */
  trackingLost: boolean;
  /** How long the current label has been held (ms). */
  holdDurationMs: number;
  /** Most recent extracted features (useful for debug UIs). */
  features: PoseFeatures | null;
  /** Most recent raw classification (before hysteresis). */
  rawClassification: PostureClassification | null;
}

export interface StepResult {
  state:  PostureState;
  events: PoseEvent[];
}

// ── Internal machine state ────────────────────────────────────────────────────

export interface PoseStateMachineState {
  // Confirmed state
  currentLabel:     PostureLabel;
  currentConf:      number;
  labelEnteredAtMs: number | null;

  // Candidate accumulator (for enter hysteresis)
  candidateLabel:  PostureLabel;
  candidateFrames: number;

  // Exit accumulator (for exit hysteresis)
  exitLabel:  PostureLabel | null; // what it's trying to flip to
  exitFrames: number;

  // Tracking quality tracking
  poorQualityFrames:    number;
  goodQualityFrames:    number;
  trackingLost:         boolean;
  lastKnownQuality:     TrackingQuality;

  // Hold event throttle
  lastHoldEventMs: number;

  // Feature extractor state
  featureState: FeatureExtractorState;

  // Last computed outputs (for StepResult)
  lastFeatures:         PoseFeatures | null;
  lastClassification:   PostureClassification | null;
}

export function createPoseStateMachine(): PoseStateMachineState {
  return {
    currentLabel:     'unknown',
    currentConf:      0,
    labelEnteredAtMs: null,

    candidateLabel:  'unknown',
    candidateFrames: 0,

    exitLabel:  null,
    exitFrames: 0,

    poorQualityFrames:  0,
    goodQualityFrames:  0,
    trackingLost:       false,
    lastKnownQuality:   'good',

    lastHoldEventMs: 0,

    featureState: createFeatureExtractorState(),

    lastFeatures:       null,
    lastClassification: null,
  };
}

export function resetPoseStateMachine(sm: PoseStateMachineState): void {
  sm.currentLabel     = 'unknown';
  sm.currentConf      = 0;
  sm.labelEnteredAtMs = null;

  sm.candidateLabel  = 'unknown';
  sm.candidateFrames = 0;

  sm.exitLabel  = null;
  sm.exitFrames = 0;

  sm.poorQualityFrames  = 0;
  sm.goodQualityFrames  = 0;
  sm.trackingLost       = false;
  sm.lastKnownQuality   = 'good';
  sm.lastHoldEventMs    = 0;

  resetFeatureExtractorState(sm.featureState);
  sm.lastFeatures       = null;
  sm.lastClassification = null;
}

// ── Step function ─────────────────────────────────────────────────────────────

/**
 * Process one stabilized observation through the full interpretation pipeline.
 * Returns the current PostureState and any events emitted this frame.
 * Mutates `sm` in place.
 */
export function stepPoseStateMachine(
  sm: PoseStateMachineState,
  obs: StabilizedPoseObservation
): StepResult {
  const events: PoseEvent[] = [];
  const { timestamp, trackingQuality } = obs;

  // ── 1. Tracking quality bookkeeping ───────────────────────────────────────
  sm.lastKnownQuality = trackingQuality;

  if (trackingQuality === 'poor' || obs.isDropout) {
    sm.poorQualityFrames  += 1;
    sm.goodQualityFrames   = 0;

    if (!sm.trackingLost && sm.poorQualityFrames >= TRACKING_LOST_FRAMES) {
      sm.trackingLost = true;
      events.push(makeTrackingLostEvent(trackingQuality, timestamp));
    }
  } else {
    sm.goodQualityFrames  += 1;
    sm.poorQualityFrames   = 0;

    if (sm.trackingLost && sm.goodQualityFrames >= TRACKING_RECOVERED_FRAMES) {
      sm.trackingLost = false;
      events.push(makeTrackingRecoveredEvent(trackingQuality, timestamp));
    }
  }

  // ── 2. Feature extraction ─────────────────────────────────────────────────
  const features = extractPoseFeatures(obs, sm.featureState);
  sm.lastFeatures = features;

  // ── 3. Posture classification ─────────────────────────────────────────────
  const classification = classifyPosture(features, trackingQuality);
  sm.lastClassification = classification;

  const rawLabel = classification.label;

  // ── 4. Hysteresis: enter logic ────────────────────────────────────────────
  const enterRequired = ENTER_FRAMES[trackingQuality];
  const exitRequired  = EXIT_FRAMES[trackingQuality];

  if (sm.currentLabel === 'unknown') {
    // Trying to establish first posture
    if (rawLabel !== 'unknown') {
      if (rawLabel === sm.candidateLabel) {
        sm.candidateFrames += 1;
      } else {
        sm.candidateLabel  = rawLabel;
        sm.candidateFrames = 1;
      }

      if (sm.candidateFrames >= enterRequired) {
        const prev = sm.currentLabel;
        sm.currentLabel     = rawLabel;
        sm.currentConf      = classification.confidence;
        sm.labelEnteredAtMs = timestamp;
        sm.candidateFrames  = 0;
        sm.exitLabel        = null;
        sm.exitFrames       = 0;

        if (prev === 'unknown') {
          // First time establishing
          events.push(makeEnteredEvent(
            rawLabel as Exclude<PostureLabel, 'unknown'>,
            classification.confidence,
            timestamp
          ));
        }
      }
    } else {
      // Still unknown
      sm.candidateFrames = 0;
      events.push(makeUnknownEvent(null, timestamp));
    }
  } else {
    // Currently in a confirmed posture
    if (rawLabel === sm.currentLabel || rawLabel === 'unknown') {
      // Same posture (or transient unknown) — reset exit counter
      sm.exitLabel  = null;
      sm.exitFrames = 0;
    } else {
      // Different posture observed — accumulate exit evidence
      if (rawLabel === sm.exitLabel) {
        sm.exitFrames += 1;
      } else {
        sm.exitLabel  = rawLabel;
        sm.exitFrames = 1;
      }

      if (sm.exitFrames >= exitRequired) {
        // Confirmed transition
        const leavingPosture = sm.currentLabel as Exclude<PostureLabel, 'unknown'>;
        const enteringPosture = sm.exitLabel as Exclude<PostureLabel, 'unknown'>;

        // Emit broke event for old posture
        events.push(makeBrokeEvent(leavingPosture, classification.confidence, timestamp));

        // Transition to new posture directly (no re-entry hysteresis needed
        // since we have exitRequired frames of evidence already)
        sm.currentLabel     = enteringPosture;
        sm.currentConf      = classification.confidence;
        sm.labelEnteredAtMs = timestamp;
        sm.exitLabel        = null;
        sm.exitFrames       = 0;
        sm.candidateFrames  = 0;

        events.push(makeEnteredEvent(enteringPosture, classification.confidence, timestamp));
      }
    }

    // ── 5. Held posture events ───────────────────────────────────────────────
    const holdDurationMs = sm.labelEnteredAtMs !== null
      ? timestamp - sm.labelEnteredAtMs
      : 0;

    const confirmedLabel = sm.currentLabel as Exclude<PostureLabel, 'unknown'>;
    if (
      holdDurationMs > 0 &&
      timestamp - sm.lastHoldEventMs >= HOLD_EMIT_INTERVAL_MS
    ) {
      events.push(makeHeldEvent(
        confirmedLabel,
        holdDurationMs,
        sm.currentConf,
        timestamp
      ));
      sm.lastHoldEventMs = timestamp;
    }

    // ── 6. Significant motion ────────────────────────────────────────────────
    if (
      features.motionScore > SIGNIFICANT_MOTION_THRESHOLD &&
      trackingQuality !== 'poor'
    ) {
      events.push(makeMotionEvent(features.motionScore, timestamp));
    }
  }

  // ── 7. Build posture state output ─────────────────────────────────────────
  const holdDurationMs = sm.labelEnteredAtMs !== null
    ? Math.max(0, timestamp - sm.labelEnteredAtMs)
    : 0;

  const state: PostureState = {
    label:             sm.currentLabel,
    confidence:        sm.currentConf,
    trackingLost:      sm.trackingLost,
    holdDurationMs,
    features,
    rawClassification: classification,
  };

  return { state, events };
}
