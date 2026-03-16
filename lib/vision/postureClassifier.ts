// ─────────────────────────────────────────────────────────────────────────────
// Posture Classifier
//
// Deterministic, rule-based classifier that maps PoseFeatures → PostureLabel.
//
// Strategy:
//   Each candidate posture (sit / down / stand) is scored by accumulating
//   weighted evidence from available features.  A posture is selected only if
//   its score exceeds a minimum confidence threshold AND beats all alternatives
//   by a margin.  Otherwise we return 'unknown'.
//
//   Because individual features may be missing (occluded keypoints, poor
//   tracking), every rule is conditional: it only contributes when its input
//   is non-null.  The overall confidence is automatically lower when fewer
//   features are available.
//
// Hysteresis is NOT in this file — it lives in poseStateMachine.ts which
// wraps this classifier.  This function is pure: same inputs → same output.
//
// Posture heuristics (dog model, side or angled view):
//
//   SIT:
//     - aspect ratio: h/w in [0.9, 2.0] (taller than wide or square-tall)
//     - front legs: moderately bent (1.2–2.4 rad)
//     - rear legs: significantly bent (< 1.8 rad), haunches tucked under
//     - front paws above rear paws in Y (front lower in frame = positive deltaY)
//     - withers relatively high in frame (small withersRelativeY)
//     - pawsRelativeToWithers: medium (0.1–0.5)
//
//   DOWN:
//     - aspect ratio: h/w < 0.8 (wider than tall — body spread out)
//     - front legs: sharply bent (< 1.4 rad) OR front elbows near ground level
//     - rear legs: also bent (< 1.8 rad)
//     - pawsRelativeToWithers: small (< 0.25) — paws close to body height
//     - compactness: low (dog is spread flat)
//     - low motion score
//
//   STAND:
//     - aspect ratio: h/w in [0.6, 1.3]
//     - front legs: mostly straight (> 2.2 rad)
//     - rear legs: mostly straight (> 2.2 rad)
//     - pawsRelativeToWithers: large (> 0.3) — legs extended below body
//     - frontRearPawDeltaY: near zero (paws roughly level)
// ─────────────────────────────────────────────────────────────────────────────

import type { PoseFeatures } from './poseFeatureExtractor.ts';
import type { TrackingQuality } from '../../types/pose.ts';

// ── Output types ──────────────────────────────────────────────────────────────

export type PostureLabel = 'sit' | 'down' | 'stand' | 'unknown';

export interface PostureClassification {
  /** Best posture label. */
  label: PostureLabel;
  /** Classifier confidence in [0, 1]. Degrades under poor tracking. */
  confidence: number;
  /** Raw evidence scores per candidate before quality gating. */
  scores: Record<PostureLabel, number>;
  /** How many independent feature sources contributed to this decision. */
  evidenceCount: number;
}

// ── Tuning constants ──────────────────────────────────────────────────────────

/** A posture must beat this raw score to be considered. */
const MIN_RAW_SCORE = 0.35;

/** Winner must lead the runner-up by at least this margin to avoid 'unknown'. */
const MARGIN_THRESHOLD = 0.12;

/** Minimum postureConfidence (keypoint quality) below which we return unknown. */
const MIN_KEYPOINT_CONF = 0.25;

/** Minimum visible posture keypoints required to attempt classification. */
const MIN_VISIBLE_KEYS = 3;

// Quality multipliers applied to final confidence
const QUALITY_MULTIPLIER: Record<TrackingQuality, number> = {
  good: 1.0,
  fair: 0.75,
  poor: 0.40,
};

// ── Evidence scoring helpers ──────────────────────────────────────────────────

/**
 * Returns a soft score in [0, 1] for how well a value fits a window.
 * - value in [lo, hi] → 1.0
 * - value outside by more than `margin` → 0.0
 * - linear ramp between
 */
function windowScore(value: number, lo: number, hi: number, margin: number = 0.15): number {
  if (value >= lo && value <= hi) return 1.0;
  if (value < lo) return Math.max(0, 1 - (lo - value) / margin);
  return Math.max(0, 1 - (value - hi) / margin);
}

/**
 * Returns 1.0 if value < threshold, fading to 0 at threshold + margin.
 */
function belowScore(value: number, threshold: number, margin: number = 0.3): number {
  return Math.max(0, Math.min(1, (threshold + margin - value) / margin));
}

/**
 * Returns 1.0 if value > threshold, fading to 0 at threshold - margin.
 */
function aboveScore(value: number, threshold: number, margin: number = 0.3): number {
  return Math.max(0, Math.min(1, (value - (threshold - margin)) / margin));
}

// ── Per-posture scoring ───────────────────────────────────────────────────────

interface EvidenceAccumulator {
  sum: number;
  count: number;
}

function acc(): EvidenceAccumulator {
  return { sum: 0, count: 0 };
}

function add(a: EvidenceAccumulator, weight: number, score: number): void {
  a.sum += weight * score;
  a.count += weight;
}

function score(a: EvidenceAccumulator): number {
  return a.count > 0 ? a.sum / a.count : 0;
}

function scoreSit(f: PoseFeatures): { score: number; count: number } {
  const ev = acc();

  // Aspect ratio: tall-ish (0.9–2.2)
  if (f.aspectRatio !== null) {
    add(ev, 2.0, windowScore(f.aspectRatio, 0.9, 2.2, 0.3));
  }

  // Front leg bend: moderately bent (1.2–2.5 rad)
  if (f.frontLegBendAngle !== null) {
    add(ev, 1.5, windowScore(f.frontLegBendAngle, 1.2, 2.5, 0.4));
  }

  // Rear leg bend: more bent (0.5–1.9 rad) — haunches tucked
  if (f.rearLegBendAngle !== null) {
    add(ev, 1.5, belowScore(f.rearLegBendAngle, 1.9, 0.5));
  }

  // Paws relative to withers: moderate offset (0.08–0.55)
  if (f.pawsRelativeToWithers !== null) {
    add(ev, 1.2, windowScore(f.pawsRelativeToWithers, 0.08, 0.55, 0.08));
  }

  // Front paws higher than rear paws (sitting back on haunches, front paws lower in frame)
  // In image coords, higher Y = lower in frame, so front paws lower = positive deltaY
  if (f.frontRearPawDeltaY !== null) {
    add(ev, 1.0, aboveScore(f.frontRearPawDeltaY, 0.02, 0.05));
  }

  // Withers high in the visible bbox (small relative Y)
  if (f.withersRelativeY !== null) {
    add(ev, 1.0, belowScore(f.withersRelativeY, 0.35, 0.15));
  }

  return { score: score(ev), count: ev.count };
}

function scoreDown(f: PoseFeatures): { score: number; count: number } {
  const ev = acc();

  // Aspect ratio: wide / flat (< 0.85)
  if (f.aspectRatio !== null) {
    add(ev, 2.0, belowScore(f.aspectRatio, 0.85, 0.25));
  }

  // Front legs: very bent or folded (< 1.6 rad)
  if (f.frontLegBendAngle !== null) {
    add(ev, 1.5, belowScore(f.frontLegBendAngle, 1.6, 0.5));
  }

  // Rear legs: also bent (< 1.9 rad)
  if (f.rearLegBendAngle !== null) {
    add(ev, 1.2, belowScore(f.rearLegBendAngle, 1.9, 0.5));
  }

  // Paws close to body height (small pawsRelativeToWithers, < 0.28)
  if (f.pawsRelativeToWithers !== null) {
    add(ev, 1.3, belowScore(f.pawsRelativeToWithers, 0.28, 0.12));
  }

  // Body not moving (low motion score)
  add(ev, 0.8, belowScore(f.motionScore, 0.25, 0.2));

  // Compactness: low (dog spread out) — postureCompactness < 1.0
  if (f.postureCompactness !== null) {
    add(ev, 1.0, belowScore(f.postureCompactness, 1.0, 0.4));
  }

  return { score: score(ev), count: ev.count };
}

function scoreStand(f: PoseFeatures): { score: number; count: number } {
  const ev = acc();

  // Aspect ratio: moderate (0.55–1.4)
  if (f.aspectRatio !== null) {
    add(ev, 2.0, windowScore(f.aspectRatio, 0.55, 1.4, 0.2));
  }

  // Front legs: mostly straight (> 2.0 rad)
  if (f.frontLegBendAngle !== null) {
    add(ev, 1.5, aboveScore(f.frontLegBendAngle, 2.0, 0.4));
  }

  // Rear legs: mostly straight (> 2.0 rad)
  if (f.rearLegBendAngle !== null) {
    add(ev, 1.5, aboveScore(f.rearLegBendAngle, 2.0, 0.4));
  }

  // Paws well below withers (> 0.25) — legs extended
  if (f.pawsRelativeToWithers !== null) {
    add(ev, 1.2, aboveScore(f.pawsRelativeToWithers, 0.25, 0.1));
  }

  // Front and rear paws at similar height (near-zero deltaY)
  if (f.frontRearPawDeltaY !== null) {
    add(ev, 0.8, windowScore(f.frontRearPawDeltaY, -0.08, 0.08, 0.08));
  }

  return { score: score(ev), count: ev.count };
}

// ── Public classifier ─────────────────────────────────────────────────────────

/**
 * Classify posture from extracted features.
 * Pure function — no side effects.
 */
export function classifyPosture(
  features: PoseFeatures,
  trackingQuality: TrackingQuality
): PostureClassification {
  const qualityMult = QUALITY_MULTIPLIER[trackingQuality];

  // Gate: not enough keypoints or confidence
  if (
    features.visibleKeyCount < MIN_VISIBLE_KEYS ||
    features.postureConfidence < MIN_KEYPOINT_CONF
  ) {
    return {
      label:         'unknown',
      confidence:    0,
      scores:        { sit: 0, down: 0, stand: 0, unknown: 1 },
      evidenceCount: 0,
    };
  }

  const sitResult   = scoreSit(features);
  const downResult  = scoreDown(features);
  const standResult = scoreStand(features);

  const rawScores: Record<PostureLabel, number> = {
    sit:     sitResult.score,
    down:    downResult.score,
    stand:   standResult.score,
    unknown: 0,
  };

  const totalEvidence = sitResult.count + downResult.count + standResult.count;
  const evidenceCount = Math.round(totalEvidence / 3);

  // Find winner
  const candidates: [PostureLabel, number][] = [
    ['sit',   rawScores.sit],
    ['down',  rawScores.down],
    ['stand', rawScores.stand],
  ];
  candidates.sort((a, b) => b[1] - a[1]);

  const [winner, winScore] = candidates[0];
  const [, runnerScore]    = candidates[1];

  const margin = winScore - runnerScore;
  const meetsThreshold = winScore >= MIN_RAW_SCORE && margin >= MARGIN_THRESHOLD;

  const label: PostureLabel = meetsThreshold ? winner : 'unknown';
  const confidence = meetsThreshold
    ? Math.min(winScore * qualityMult * (1 + margin), 1)
    : 0;

  rawScores.unknown = meetsThreshold ? 0 : 1 - winScore;

  return { label, confidence, scores: rawScores, evidenceCount };
}
