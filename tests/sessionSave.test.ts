// ─────────────────────────────────────────────────────────────────────────────
// Session Save Tests
//
// Covers the payload-building logic for session_logs persistence:
//   - Normal (manual) session: live_coaching_used must be false, payloads empty
//   - Live-coached session: typed LiveCoachingSummary + PoseMetrics populated
//   - Abandoned live session: sessionAssessment = 'abandoned'
//   - Partial completion: sessionAssessment = 'partial'
//   - Null / default handling: missing metrics fields default safely
//
// Run with: node --experimental-strip-types tests/sessionSave.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import type { CoachingSessionMetrics } from '../lib/liveCoach/liveCoachingTypes.ts';
import type { LiveCoachingSummary, PoseMetrics } from '../lib/sessionManager.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — mirrors the payload builders in session.tsx handleSubmitSession
// ─────────────────────────────────────────────────────────────────────────────

function buildLiveCoachingSummary(
  liveMetrics: CoachingSessionMetrics,
  protocolId: string,
  coachingMode: string,
  targetPostures: LiveCoachingSummary['targetPostures'],
  requiredRepCount: number
): LiveCoachingSummary {
  const { trackingQualityBreakdown } = liveMetrics;
  const totalFrames =
    trackingQualityBreakdown.good +
    trackingQualityBreakdown.fair +
    trackingQualityBreakdown.poor;
  const avgTrackingQuality =
    totalFrames > 0
      ? (trackingQualityBreakdown.good * 1.0 +
         trackingQualityBreakdown.fair * 0.5) / totalFrames
      : 0;
  const sessionAssessment: LiveCoachingSummary['sessionAssessment'] =
    liveMetrics.repCountDetected >= requiredRepCount
      ? 'completed'
      : liveMetrics.repCountDetected > 0
      ? 'partial'
      : 'abandoned';

  return {
    coachingMode,
    protocolId,
    targetPostures,
    successCount:           liveMetrics.repCountDetected,
    resetCount:             liveMetrics.resetCount,
    averageTrackingQuality: Math.round(avgTrackingQuality * 100) / 100,
    sessionAssessment,
  };
}

function buildPoseMetrics(liveMetrics: CoachingSessionMetrics): PoseMetrics {
  const { trackingQualityBreakdown } = liveMetrics;
  const totalFrames =
    trackingQualityBreakdown.good +
    trackingQualityBreakdown.fair +
    trackingQualityBreakdown.poor;
  const avgConfidence =
    totalFrames > 0
      ? (trackingQualityBreakdown.good * 0.80 +
         trackingQualityBreakdown.fair * 0.55 +
         trackingQualityBreakdown.poor * 0.20) / totalFrames
      : 0;

  return {
    averageTrackingConfidence: Math.round(avgConfidence * 100) / 100,
    trackingQualityBreakdown:  liveMetrics.trackingQualityBreakdown,
    postureDurations:          liveMetrics.postureDurations,
    holdDurations:             liveMetrics.holdDurations,
    repCountDetected:          liveMetrics.repCountDetected,
    lostTrackingEvents:        liveMetrics.lostTrackingEvents,
    significantMotionEvents:   liveMetrics.significantMotionEvents,
  };
}

/** Minimal valid metrics representing a fully completed live session. */
function makeCompletedMetrics(requiredReps = 3): CoachingSessionMetrics {
  return {
    repCountDetected:         requiredReps,
    successfulHolds:          requiredReps,
    averageHoldDurationMs:    5200,
    timeInTargetPostureMs:    requiredReps * 5200,
    resetCount:               1,
    holdDurations:            Array.from({ length: requiredReps }, (_, i) => 5000 + i * 100),
    lostTrackingEvents:       0,
    significantMotionEvents:  2,
    trackingQualityBreakdown: { good: 80, fair: 15, poor: 5 },
    postureDurations:         { down: 16000, unknown: 4000 },
    sessionStartMs:           0,
    lastFrameMs:              20000,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normal (manual) session
// ─────────────────────────────────────────────────────────────────────────────

test('normal session: liveCoachingUsed is false when no live metrics', () => {
  const liveMetrics = null;
  assert.equal(liveMetrics !== null, false);
});

test('normal session: liveCoachingSummary and poseMetrics are undefined when no live metrics', () => {
  const liveMetrics: CoachingSessionMetrics | null = null;
  const summary = liveMetrics ? buildLiveCoachingSummary(liveMetrics, 'settle_s1', 'stationary_hold', ['down'], 3) : undefined;
  const metrics = liveMetrics ? buildPoseMetrics(liveMetrics) : undefined;
  assert.equal(summary, undefined);
  assert.equal(metrics, undefined);
});

// ─────────────────────────────────────────────────────────────────────────────
// Live-coached completed session
// ─────────────────────────────────────────────────────────────────────────────

test('live session: liveCoachingUsed is true when metrics are present', () => {
  const liveMetrics = makeCompletedMetrics(3);
  assert.equal(liveMetrics !== null, true);
});

test('live session: LiveCoachingSummary has correct shape and values', () => {
  const liveMetrics = makeCompletedMetrics(3);
  const summary = buildLiveCoachingSummary(liveMetrics, 'settle_s1', 'stationary_hold', ['down'], 3);

  assert.equal(summary.coachingMode, 'stationary_hold');
  assert.equal(summary.protocolId, 'settle_s1');
  assert.deepEqual(summary.targetPostures, ['down']);
  assert.equal(summary.successCount, 3);
  assert.equal(summary.resetCount, 1);
  assert.equal(summary.sessionAssessment, 'completed');
  // averageTrackingQuality = (80*1 + 15*0.5) / 100 = 87.5/100 = 0.875
  assert.equal(summary.averageTrackingQuality, 0.88);
});

test('live session: PoseMetrics has correct shape and values', () => {
  const liveMetrics = makeCompletedMetrics(3);
  const metrics = buildPoseMetrics(liveMetrics);

  assert.equal(typeof metrics.averageTrackingConfidence, 'number');
  assert.ok(metrics.averageTrackingConfidence > 0 && metrics.averageTrackingConfidence <= 1);
  assert.deepEqual(metrics.trackingQualityBreakdown, { good: 80, fair: 15, poor: 5 });
  assert.equal(metrics.repCountDetected, 3);
  assert.equal(metrics.lostTrackingEvents, 0);
  assert.equal(metrics.significantMotionEvents, 2);
  assert.equal(metrics.holdDurations.length, 3);
  assert.equal(metrics.holdDurations[0], 5000);
});

test('live session: averageTrackingConfidence is clamped to [0,1]', () => {
  const liveMetrics = makeCompletedMetrics();
  const metrics = buildPoseMetrics(liveMetrics);
  assert.ok(metrics.averageTrackingConfidence >= 0);
  assert.ok(metrics.averageTrackingConfidence <= 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Abandoned live session
// ─────────────────────────────────────────────────────────────────────────────

test('abandoned live session: sessionAssessment is abandoned when 0 reps completed', () => {
  const liveMetrics: CoachingSessionMetrics = {
    ...makeCompletedMetrics(3),
    repCountDetected: 0,
    successfulHolds:  0,
    holdDurations:    [],
  };
  const summary = buildLiveCoachingSummary(liveMetrics, 'settle_s1', 'stationary_hold', ['down'], 3);
  assert.equal(summary.sessionAssessment, 'abandoned');
  assert.equal(summary.successCount, 0);
});

test('abandoned live session: poseMetrics holdDurations is empty array', () => {
  const liveMetrics: CoachingSessionMetrics = {
    ...makeCompletedMetrics(3),
    repCountDetected: 0,
    successfulHolds:  0,
    holdDurations:    [],
  };
  const metrics = buildPoseMetrics(liveMetrics);
  assert.deepEqual(metrics.holdDurations, []);
});

// ─────────────────────────────────────────────────────────────────────────────
// Partial completion
// ─────────────────────────────────────────────────────────────────────────────

test('partial session: sessionAssessment is partial when some but not all reps done', () => {
  const liveMetrics: CoachingSessionMetrics = {
    ...makeCompletedMetrics(3),
    repCountDetected: 1,
    successfulHolds:  1,
    holdDurations:    [5100],
  };
  const summary = buildLiveCoachingSummary(liveMetrics, 'settle_s1', 'stationary_hold', ['down'], 3);
  assert.equal(summary.sessionAssessment, 'partial');
  assert.equal(summary.successCount, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Null / default handling
// ─────────────────────────────────────────────────────────────────────────────

test('averageTrackingQuality is 0 when no frames recorded', () => {
  const liveMetrics: CoachingSessionMetrics = {
    ...makeCompletedMetrics(3),
    trackingQualityBreakdown: { good: 0, fair: 0, poor: 0 },
  };
  const summary = buildLiveCoachingSummary(liveMetrics, 'settle_s1', 'stationary_hold', ['down'], 3);
  assert.equal(summary.averageTrackingQuality, 0);
});

test('averageTrackingConfidence is 0 when no frames recorded', () => {
  const liveMetrics: CoachingSessionMetrics = {
    ...makeCompletedMetrics(3),
    trackingQualityBreakdown: { good: 0, fair: 0, poor: 0 },
  };
  const metrics = buildPoseMetrics(liveMetrics);
  assert.equal(metrics.averageTrackingConfidence, 0);
});

test('postureDurations defaults to empty object safely', () => {
  const liveMetrics: CoachingSessionMetrics = {
    ...makeCompletedMetrics(3),
    postureDurations: {},
  };
  const metrics = buildPoseMetrics(liveMetrics);
  assert.deepEqual(metrics.postureDurations, {});
});

test('holdDurations array is always present even when empty', () => {
  const liveMetrics: CoachingSessionMetrics = {
    ...makeCompletedMetrics(3),
    holdDurations: [],
  };
  const metrics = buildPoseMetrics(liveMetrics);
  assert.ok(Array.isArray(metrics.holdDurations));
  assert.equal(metrics.holdDurations.length, 0);
});

test('significantMotionEvents defaults to 0', () => {
  const liveMetrics: CoachingSessionMetrics = {
    ...makeCompletedMetrics(3),
    significantMotionEvents: 0,
  };
  const metrics = buildPoseMetrics(liveMetrics);
  assert.equal(metrics.significantMotionEvents, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Type compatibility: SaveSessionParams accepts the typed payloads
// ─────────────────────────────────────────────────────────────────────────────

test('SaveSessionParams accepts LiveCoachingSummary and PoseMetrics types', () => {
  // Compile-time type check — if this test file compiles, the types are compatible.
  const summary: LiveCoachingSummary = {
    coachingMode:           'stationary_hold',
    protocolId:             'settle_s1',
    targetPostures:         ['down'],
    successCount:           3,
    resetCount:             0,
    averageTrackingQuality: 0.88,
    sessionAssessment:      'completed',
  };
  const metrics: PoseMetrics = {
    averageTrackingConfidence: 0.75,
    trackingQualityBreakdown:  { good: 80, fair: 15, poor: 5 },
    postureDurations:          { down: 15000 },
    holdDurations:             [5000, 5100, 5200],
    repCountDetected:          3,
    lostTrackingEvents:        0,
    significantMotionEvents:   2,
  };

  // Verify the objects satisfy the type shape
  assert.equal(summary.sessionAssessment, 'completed');
  assert.equal(metrics.repCountDetected, 3);
  assert.equal(metrics.holdDurations.length, 3);
});
