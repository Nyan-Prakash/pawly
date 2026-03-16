// ─────────────────────────────────────────────────────────────────────────────
// Pose Stabilizer Tests
//
// Uses Node's built-in test runner (same pattern as the rest of the test suite).
// Run with: node --experimental-strip-types tests/poseStabilizer.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createOneEuroFilter,
  oneEuroFilterStep,
  resetOneEuroFilter,
  createOneEuroFilter2D,
  oneEuroFilter2DStep,
} from '../lib/vision/oneEuroFilter.ts';

import {
  createOutlierRejectionState,
  filterOutliers,
  resetOutlierState,
  isKeypointPlausible,
  HIGH_CONFIDENCE_OVERRIDE,
  MAX_JUMP_FRACTION,
} from '../lib/vision/poseOutlierRejection.ts';

import {
  createTrackingQualityState,
  recordFrame,
  recentDropoutRate,
  computeTrackingQuality,
  hasTorsoAnchorVisible,
} from '../lib/vision/poseTrackingQuality.ts';

import {
  createPoseStabilizer,
  stepPoseStabilizer,
  resetPoseStabilizer,
} from '../lib/vision/poseStabilizer.ts';

import { DOG_KEYPOINT_NAMES, NUM_KEYPOINTS } from '../types/pose.ts';
import type { PoseKeypoint, RawPoseObservation } from '../types/pose.ts';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeKp(index: number, x: number, y: number, score: number): PoseKeypoint {
  return { name: DOG_KEYPOINT_NAMES[index] as PoseKeypoint['name'], index, x, y, score };
}

function makeObs(kps: PoseKeypoint[], confidence = 0.8, ts = 1000): RawPoseObservation {
  return {
    confidence,
    keypoints: kps,
    timestamp: ts,
    bbox: { cx: 0.5, cy: 0.5, w: 0.4, h: 0.4 },
  };
}

/** Full 24-keypoint observation with all keypoints at a given position. */
function makeFullObs(x: number, y: number, score: number, ts = 1000): RawPoseObservation {
  const kps = Array.from({ length: NUM_KEYPOINTS }, (_, i) => makeKp(i, x, y, score));
  return makeObs(kps, score, ts);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. One Euro Filter — smoothing behaviour
// ─────────────────────────────────────────────────────────────────────────────

test('OneEuroFilter: first value passes through unchanged', () => {
  const f = createOneEuroFilter();
  const out = oneEuroFilterStep(f, 0.5);
  assert.equal(out, 0.5);
});

test('OneEuroFilter: smooths a step change over multiple frames', () => {
  const f = createOneEuroFilter({ freq: 10, minCutoff: 1.0, beta: 0 });
  // Feed a constant value to converge the filter
  for (let i = 0; i < 20; i++) oneEuroFilterStep(f, 0.0);
  // Now introduce a step
  const first  = oneEuroFilterStep(f, 1.0);
  const second = oneEuroFilterStep(f, 1.0);
  // Output should be between old and new value, and increasing toward 1
  assert.ok(first  > 0.0 && first  < 1.0, `first=${first} should be between 0 and 1`);
  assert.ok(second > first, `second=${second} should be > first=${first}`);
});

test('OneEuroFilter: steady signal barely changes after convergence', () => {
  const f = createOneEuroFilter({ freq: 10, minCutoff: 1.0, beta: 0 });
  let last = 0;
  for (let i = 0; i < 50; i++) last = oneEuroFilterStep(f, 0.5);
  assert.ok(Math.abs(last - 0.5) < 0.001, `Converged value ${last} should be ~0.5`);
});

test('OneEuroFilter: reset clears state', () => {
  const f = createOneEuroFilter();
  for (let i = 0; i < 20; i++) oneEuroFilterStep(f, 1.0);
  resetOneEuroFilter(f);
  // After reset, first value should pass through again
  const out = oneEuroFilterStep(f, 0.25);
  assert.equal(out, 0.25);
});

test('OneEuroFilter2D: filters x and y independently', () => {
  const f = createOneEuroFilter2D({ freq: 10, minCutoff: 1.0, beta: 0 });
  const out = oneEuroFilter2DStep(f, 0.3, 0.7);
  assert.equal(out.x, 0.3);
  assert.equal(out.y, 0.7);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Outlier Rejection
// ─────────────────────────────────────────────────────────────────────────────

test('OutlierRejection: first keypoint always accepted', () => {
  const state = createOutlierRejectionState();
  const kp = makeKp(0, 0.5, 0.5, 0.6);
  assert.equal(isKeypointPlausible(state, kp), true);
});

test('OutlierRejection: small move accepted', () => {
  const state = createOutlierRejectionState();
  state.lastAccepted.set(0, { x: 0.5, y: 0.5 });
  state.bodyDiagonal = 0.4; // body diag
  const kp = makeKp(0, 0.52, 0.52, 0.6); // tiny jump
  assert.equal(isKeypointPlausible(state, kp), true);
});

test('OutlierRejection: large jump rejected when low confidence', () => {
  const state = createOutlierRejectionState();
  state.lastAccepted.set(0, { x: 0.1, y: 0.1 });
  state.bodyDiagonal = 0.3;
  // jump of ~0.57 >> MAX_JUMP_FRACTION * 0.3 ≈ 0.09
  const kp = makeKp(0, 0.5, 0.5, 0.5);
  assert.equal(isKeypointPlausible(state, kp), false);
});

test('OutlierRejection: large jump accepted with high confidence override', () => {
  const state = createOutlierRejectionState();
  state.lastAccepted.set(0, { x: 0.1, y: 0.1 });
  state.bodyDiagonal = 0.3;
  const kp = makeKp(0, 0.5, 0.5, HIGH_CONFIDENCE_OVERRIDE);
  assert.equal(isKeypointPlausible(state, kp), true);
});

test('OutlierRejection: filterOutliers only returns accepted keypoints', () => {
  const state = createOutlierRejectionState();
  // kp 0 at origin accepted first
  const kp0a = makeKp(0, 0.1, 0.1, 0.6);
  filterOutliers(state, [kp0a]);
  // Now a huge jump with moderate confidence → rejected
  const kp0b = makeKp(0, 0.9, 0.9, 0.6);
  const kp1  = makeKp(1, 0.5, 0.5, 0.6); // new point — always accepted
  const result = filterOutliers(state, [kp0b, kp1], { cx: 0.5, cy: 0.5, w: 0.4, h: 0.4 });
  assert.equal(result.length, 1, 'Only kp1 should be accepted');
  assert.equal(result[0].index, 1);
});

test('OutlierRejection: reset clears accepted positions', () => {
  const state = createOutlierRejectionState();
  const kp = makeKp(0, 0.5, 0.5, 0.6);
  filterOutliers(state, [kp]);
  resetOutlierState(state);
  assert.equal(state.lastAccepted.size, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Tracking Quality
// ─────────────────────────────────────────────────────────────────────────────

test('TrackingQuality: 100% visibility → good', () => {
  const q = computeTrackingQuality({
    visibleConfidences: Array(24).fill(0.9),
    visibleCount: 24,
    hasTorsoAnchor: true,
    dropoutRate: 0,
  });
  assert.equal(q, 'good');
});

test('TrackingQuality: zero keypoints → poor', () => {
  const q = computeTrackingQuality({
    visibleConfidences: [],
    visibleCount: 0,
    hasTorsoAnchor: false,
    dropoutRate: 0.8,
  });
  assert.equal(q, 'poor');
});

test('TrackingQuality: partial visibility mid confidence → fair', () => {
  const q = computeTrackingQuality({
    visibleConfidences: Array(8).fill(0.5),
    visibleCount: 8,
    hasTorsoAnchor: false,
    dropoutRate: 0.3,
  });
  // 0.35*0.5 + 0.25*(8/24) + 0.20*0 + 0.20*0.7 ≈ 0.175+0.083+0+0.14 ≈ 0.40 → fair
  assert.equal(q, 'fair');
});

test('TrackingQuality: dropout rate tracking updates correctly', () => {
  const state = createTrackingQualityState();
  // 8 detections, 2 dropouts
  for (let i = 0; i < 8; i++) recordFrame(state, true);
  for (let i = 0; i < 2; i++) recordFrame(state, false);
  const rate = recentDropoutRate(state);
  assert.ok(rate > 0 && rate <= 0.2 + 1e-9, `dropout rate ${rate} should be ~0.2`);
});

test('hasTorsoAnchorVisible: returns true when withers visible', () => {
  assert.equal(hasTorsoAnchorVisible(new Set([22])), true);
});

test('hasTorsoAnchorVisible: returns false when no anchors', () => {
  assert.equal(hasTorsoAnchorVisible(new Set([0, 1, 2])), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PoseStabilizer — integration
// ─────────────────────────────────────────────────────────────────────────────

test('PoseStabilizer: dropout frame returns all missing/held keypoints', () => {
  const stab = createPoseStabilizer();
  const result = stepPoseStabilizer(stab, null, 1000);
  assert.equal(result.isDropout, true);
  assert.equal(result.confidence, 0);
  // All keypoints should be missing since nothing was ever tracked
  assert.ok(result.keypoints.every((kp) => kp.status === 'missing'));
});

test('PoseStabilizer: first observation initializes keypoints as tracked', () => {
  const stab = createPoseStabilizer();
  const obs = makeFullObs(0.5, 0.5, 0.8);
  const result = stepPoseStabilizer(stab, obs, 1000);
  assert.equal(result.isDropout, false);
  // All keypoints with score >= CONF_LOW should be tracked
  const tracked = result.keypoints.filter((kp) => kp.status === 'tracked');
  assert.ok(tracked.length > 0, 'At least some keypoints should be tracked');
});

test('PoseStabilizer: dropout hold behaviour', () => {
  const stab = createPoseStabilizer();
  // Establish a tracked state
  for (let t = 0; t < 5; t++) {
    stepPoseStabilizer(stab, makeFullObs(0.5, 0.5, 0.8), t * 100);
  }

  // Now feed 3 dropout frames — keypoints should be 'held'
  let result = stepPoseStabilizer(stab, null, 600);
  const heldKps = result.keypoints.filter((kp) => kp.status === 'held');
  assert.ok(heldKps.length > 0, 'Keypoints should be held after short dropout');

  // After MAX_HOLD_FRAMES (6) consecutive dropouts, they become missing
  for (let t = 0; t < 6; t++) {
    result = stepPoseStabilizer(stab, null, 700 + t * 100);
  }
  const missingKps = result.keypoints.filter((kp) => kp.status === 'missing');
  assert.ok(missingKps.length > 0, 'Keypoints should become missing after long dropout');
});

test('PoseStabilizer: position stays near last known during hold', () => {
  const stab = createPoseStabilizer();
  // Track keypoint 0 at known position
  const kp0 = makeKp(0, 0.3, 0.4, 0.8);
  for (let t = 0; t < 5; t++) {
    stepPoseStabilizer(stab, makeObs([kp0], 0.8, t * 100), t * 100);
  }
  // Record stabilized position
  const before = stepPoseStabilizer(stab, makeObs([kp0], 0.8, 500), 500);
  const heldX = before.keypoints[0].x;
  const heldY = before.keypoints[0].y;

  // Feed one dropout
  const after = stepPoseStabilizer(stab, null, 600);
  const kpAfter = after.keypoints[0];
  assert.equal(kpAfter.status, 'held');
  // Position should be very close to last known
  assert.ok(Math.abs(kpAfter.x - heldX) < 0.05, 'x should stay near last known');
  assert.ok(Math.abs(kpAfter.y - heldY) < 0.05, 'y should stay near last known');
});

test('PoseStabilizer: smoothing reduces jitter (output variance < input variance)', () => {
  const stab = createPoseStabilizer();
  const noisy: number[] = [];
  const smoothed: number[] = [];

  // Feed noisy signal for keypoint 22 (withers)
  for (let t = 0; t < 30; t++) {
    const noise = (Math.random() - 0.5) * 0.1;
    const rawX = 0.5 + noise;
    noisy.push(rawX);
    const kps = [makeKp(22, rawX, 0.5, 0.9)];
    const result = stepPoseStabilizer(stab, makeObs(kps, 0.9, t * 100), t * 100);
    smoothed.push(result.keypoints[22].x);
  }

  // Compute variance
  const variance = (arr: number[]) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
  };

  const vNoise    = variance(noisy.slice(10)); // skip warm-up
  const vSmoothed = variance(smoothed.slice(10));
  assert.ok(vSmoothed < vNoise, `Smoothed variance ${vSmoothed} should be < noisy ${vNoise}`);
});

test('PoseStabilizer: outlier rejection prevents position jump', () => {
  const stab = createPoseStabilizer();
  // Establish keypoint 0 at (0.1, 0.1)
  for (let t = 0; t < 5; t++) {
    stepPoseStabilizer(stab, makeObs([makeKp(0, 0.1, 0.1, 0.8)], 0.8, t * 100), t * 100);
  }
  const before = stepPoseStabilizer(stab, makeObs([makeKp(0, 0.1, 0.1, 0.8)], 0.8, 500), 500);
  const posX = before.keypoints[0].x;

  // Feed a huge jump with mid confidence → should be rejected
  const jumpObs = makeObs([makeKp(0, 0.9, 0.9, 0.6)], 0.6, 600);
  const after = stepPoseStabilizer(stab, jumpObs, 600);
  // Position should not have jumped drastically
  assert.ok(
    Math.abs(after.keypoints[0].x - posX) < 0.4,
    `Position should not have jumped from ${posX} to ${after.keypoints[0].x}`
  );
});

test('PoseStabilizer: output has correct shape (24 keypoints, all fields)', () => {
  const stab = createPoseStabilizer();
  const result = stepPoseStabilizer(stab, makeFullObs(0.5, 0.5, 0.8), 1000);
  assert.equal(result.keypoints.length, NUM_KEYPOINTS);
  for (const kp of result.keypoints) {
    assert.ok('name'       in kp);
    assert.ok('index'      in kp);
    assert.ok('x'          in kp);
    assert.ok('y'          in kp);
    assert.ok('score'      in kp);
    assert.ok('status'     in kp);
    assert.ok('heldFrames' in kp);
  }
  assert.ok('confidence'      in result);
  assert.ok('trackingQuality' in result);
  assert.ok('timestamp'       in result);
  assert.ok('isDropout'       in result);
});

test('PoseStabilizer: bodyCenter derived from torso anchors when visible', () => {
  const stab = createPoseStabilizer();
  const kps = [
    makeKp(22, 0.4, 0.4, 0.9), // withers
    makeKp(23, 0.6, 0.6, 0.9), // throat
  ];
  for (let t = 0; t < 5; t++) {
    stepPoseStabilizer(stab, makeObs(kps, 0.9, t * 100), t * 100);
  }
  const result = stepPoseStabilizer(stab, makeObs(kps, 0.9, 500), 500);
  assert.ok(result.bodyCenter !== null, 'bodyCenter should be derivable');
  assert.ok(result.bodyCenter!.x > 0.35 && result.bodyCenter!.x < 0.65);
});

test('PoseStabilizer: bodyAngle derivable from withers→tail_start', () => {
  const stab = createPoseStabilizer();
  const kps = [
    makeKp(22, 0.3, 0.5, 0.9), // withers
    makeKp(12, 0.7, 0.5, 0.9), // tail_start — same y, so angle should be ~0
  ];
  for (let t = 0; t < 5; t++) {
    stepPoseStabilizer(stab, makeObs(kps, 0.9, t * 100), t * 100);
  }
  const result = stepPoseStabilizer(stab, makeObs(kps, 0.9, 500), 500);
  assert.ok(result.bodyAngle !== null, 'bodyAngle should be derivable');
  assert.ok(Math.abs(result.bodyAngle!) < 0.2, `angle should be near 0 radians, got ${result.bodyAngle}`);
});

test('PoseStabilizer: reset clears all state', () => {
  const stab = createPoseStabilizer();
  for (let t = 0; t < 10; t++) {
    stepPoseStabilizer(stab, makeFullObs(0.5, 0.5, 0.9), t * 100);
  }
  resetPoseStabilizer(stab);
  const result = stepPoseStabilizer(stab, null, 2000);
  // After reset, all keypoints should be missing again
  assert.ok(result.keypoints.every((kp) => kp.status === 'missing'));
});
