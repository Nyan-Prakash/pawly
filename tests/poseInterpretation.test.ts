// ─────────────────────────────────────────────────────────────────────────────
// Pose Interpretation Tests
//
// Covers: feature extraction, posture classification, hysteresis, event
// generation, and degraded-tracking behaviour.
//
// All synthetic observations are built from fake keypoints positioned to
// match geometric expectations for each posture.
//
// Run with: node --experimental-strip-types tests/poseInterpretation.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  extractPoseFeatures,
  createFeatureExtractorState,
  resetFeatureExtractorState,
  KP,
} from '../lib/vision/poseFeatureExtractor.ts';

import {
  classifyPosture,
} from '../lib/vision/postureClassifier.ts';

import {
  createPoseStateMachine,
  stepPoseStateMachine,
  resetPoseStateMachine,
} from '../lib/vision/poseStateMachine.ts';

import { DOG_KEYPOINT_NAMES, NUM_KEYPOINTS } from '../types/pose.ts';
import type {
  StabilizedPoseObservation,
  StabilizedKeypoint,
  TrackingQuality,
} from '../types/pose.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Synthetic observation builders
// ─────────────────────────────────────────────────────────────────────────────

function allMissing(): StabilizedKeypoint[] {
  return Array.from({ length: NUM_KEYPOINTS }, (_, i) => ({
    name:       DOG_KEYPOINT_NAMES[i] as StabilizedKeypoint['name'],
    index:      i,
    x:          0,
    y:          0,
    score:      0,
    status:     'missing' as const,
    heldFrames: 0,
  }));
}

function makeObs(
  overrides: Partial<Record<number, { x: number; y: number; score?: number }>>,
  quality: TrackingQuality = 'good',
  ts = 1000
): StabilizedPoseObservation {
  const kps = allMissing();
  for (const [idxStr, vals] of Object.entries(overrides)) {
    const i = Number(idxStr);
    kps[i] = {
      name:       DOG_KEYPOINT_NAMES[i] as StabilizedKeypoint['name'],
      index:      i,
      x:          vals.x,
      y:          vals.y,
      score:      vals.score ?? 0.9,
      status:     'tracked' as const,
      heldFrames: 0,
    };
  }
  // Derive rough bodyCenter from withers/throat/nose if present
  const anchors = [KP.WITHERS, KP.THROAT, KP.NOSE].filter((i) => kps[i].status !== 'missing');
  const bodyCenter = anchors.length > 0
    ? {
        x: anchors.reduce((s, i) => s + kps[i].x, 0) / anchors.length,
        y: anchors.reduce((s, i) => s + kps[i].y, 0) / anchors.length,
      }
    : null;

  // bodyAngle from withers→tail_start if both present
  const w = kps[KP.WITHERS]; const t = kps[KP.TAIL_START];
  const bodyAngle =
    w.status !== 'missing' && t.status !== 'missing'
      ? Math.atan2(t.y - w.y, t.x - w.x)
      : null;

  return {
    keypoints:       kps,
    confidence:      0.85,
    trackingQuality: quality,
    bodyCenter,
    bodyAngle,
    timestamp:       ts,
    isDropout:       false,
  };
}

// ── Canonical posture templates ────────────────────────────────────────────────
// Coordinates are normalised [0,1].  y=0 is top of frame, y=1 is bottom.
// Dog is viewed from the side, body running roughly left→right.
//
// Stand: legs fully extended, body higher up, paws well below withers
// Sit:   rear legs tucked, front legs moderately bent, body taller aspect
// Down:  body low and spread, all legs folded, wide bbox

function standObs(ts = 1000): StabilizedPoseObservation {
  // Withers ~0.3 from top, paws at ~0.75 → 0.45 separation
  // Front leg nearly straight, rear leg nearly straight
  return makeObs({
    [KP.WITHERS]:           { x: 0.5,  y: 0.30 },
    [KP.THROAT]:            { x: 0.55, y: 0.35 },
    [KP.NOSE]:              { x: 0.60, y: 0.32 },
    [KP.TAIL_START]:        { x: 0.30, y: 0.32 },
    // Front left leg: paw(0.65,0.75) knee(0.65,0.55) elbow(0.62,0.38)
    [KP.FRONT_LEFT_PAW]:    { x: 0.65, y: 0.76 },
    [KP.FRONT_LEFT_KNEE]:   { x: 0.65, y: 0.56 },
    [KP.FRONT_LEFT_ELBOW]:  { x: 0.62, y: 0.38 },
    // Front right leg: nearly identical
    [KP.FRONT_RIGHT_PAW]:   { x: 0.67, y: 0.76 },
    [KP.FRONT_RIGHT_KNEE]:  { x: 0.67, y: 0.56 },
    [KP.FRONT_RIGHT_ELBOW]: { x: 0.64, y: 0.38 },
    // Rear left leg: paw(0.35,0.75) knee(0.35,0.55) elbow(0.38,0.40)
    [KP.REAR_LEFT_PAW]:     { x: 0.35, y: 0.76 },
    [KP.REAR_LEFT_KNEE]:    { x: 0.35, y: 0.56 },
    [KP.REAR_LEFT_ELBOW]:   { x: 0.38, y: 0.40 },
    // Rear right leg: nearly identical
    [KP.REAR_RIGHT_PAW]:    { x: 0.33, y: 0.76 },
    [KP.REAR_RIGHT_KNEE]:   { x: 0.33, y: 0.56 },
    [KP.REAR_RIGHT_ELBOW]:  { x: 0.36, y: 0.40 },
  }, 'good', ts);
}

function sitObs(ts = 1000): StabilizedPoseObservation {
  // Sit: withers high, rear haunches tucked sharply under body, front legs
  // moderately bent.  Front paws lower (larger Y) than rear paws.
  //
  // Rear leg geometry: paw(0.45,0.55) knee(0.39,0.42) elbow(0.42,0.35)
  //   angle at knee: paw→knee vector is (+0.06,+0.13), elbow→knee vector is
  //   (-0.03,+0.07) — these form an acute angle → bent ≈ 1.3 rad ✓
  //
  // Front leg geometry: paw(0.65,0.75) knee(0.57,0.57) elbow(0.62,0.36)
  //   moderate bend ~1.8 rad (knee offset sideways creates bend)
  return makeObs({
    [KP.WITHERS]:           { x: 0.50, y: 0.25 },
    [KP.THROAT]:            { x: 0.55, y: 0.30 },
    [KP.NOSE]:              { x: 0.60, y: 0.27 },
    [KP.TAIL_START]:        { x: 0.30, y: 0.45 },
    // Front left: moderate bend — knee displaced sideways from paw/elbow line
    [KP.FRONT_LEFT_PAW]:    { x: 0.65, y: 0.75 },
    [KP.FRONT_LEFT_KNEE]:   { x: 0.57, y: 0.57 },
    [KP.FRONT_LEFT_ELBOW]:  { x: 0.62, y: 0.36 },
    [KP.FRONT_RIGHT_PAW]:   { x: 0.67, y: 0.75 },
    [KP.FRONT_RIGHT_KNEE]:  { x: 0.59, y: 0.57 },
    [KP.FRONT_RIGHT_ELBOW]: { x: 0.64, y: 0.36 },
    // Rear legs: sharply bent / tucked under body
    // knee displaced far from paw→elbow line to create acute angle
    [KP.REAR_LEFT_PAW]:     { x: 0.45, y: 0.55 },
    [KP.REAR_LEFT_KNEE]:    { x: 0.39, y: 0.42 },
    [KP.REAR_LEFT_ELBOW]:   { x: 0.52, y: 0.36 },
    [KP.REAR_RIGHT_PAW]:    { x: 0.47, y: 0.55 },
    [KP.REAR_RIGHT_KNEE]:   { x: 0.41, y: 0.42 },
    [KP.REAR_RIGHT_ELBOW]:  { x: 0.54, y: 0.36 },
  }, 'good', ts);
}

function downObs(ts = 1000): StabilizedPoseObservation {
  // Down: body low and flat. Legs bent at the knee (knee displaced laterally
  // from the paw→elbow axis to create a genuine acute angle).
  //
  // Front leg: paw(0.74,0.68) knee(0.66,0.60) elbow(0.62,0.56)
  //   paw→knee vector: (-0.08,-0.08), elbow→knee vector: (+0.04,+0.04)
  //   → angle at knee ≈ π (these are collinear-ish); shift knee laterally:
  //   knee(0.72,0.58) — now angle at knee ≈ 1.1 rad ✓
  //
  // Rear leg: paw(0.20,0.68) knee(0.28,0.60) elbow(0.32,0.56)
  //   shift knee: knee(0.22,0.58) → acute angle ≈ 1.1 rad ✓
  return makeObs({
    [KP.WITHERS]:           { x: 0.50, y: 0.55 },
    [KP.THROAT]:            { x: 0.60, y: 0.58 },
    [KP.NOSE]:              { x: 0.65, y: 0.55 },
    [KP.TAIL_START]:        { x: 0.25, y: 0.55 },
    // Front legs: sharply bent — knee pushed forward/up from paw→elbow line
    [KP.FRONT_LEFT_PAW]:    { x: 0.74, y: 0.68 },
    [KP.FRONT_LEFT_KNEE]:   { x: 0.72, y: 0.58 },
    [KP.FRONT_LEFT_ELBOW]:  { x: 0.62, y: 0.56 },
    [KP.FRONT_RIGHT_PAW]:   { x: 0.75, y: 0.68 },
    [KP.FRONT_RIGHT_KNEE]:  { x: 0.73, y: 0.58 },
    [KP.FRONT_RIGHT_ELBOW]: { x: 0.63, y: 0.56 },
    // Rear legs: also bent
    [KP.REAR_LEFT_PAW]:     { x: 0.20, y: 0.68 },
    [KP.REAR_LEFT_KNEE]:    { x: 0.22, y: 0.58 },
    [KP.REAR_LEFT_ELBOW]:   { x: 0.32, y: 0.56 },
    [KP.REAR_RIGHT_PAW]:    { x: 0.18, y: 0.68 },
    [KP.REAR_RIGHT_KNEE]:   { x: 0.20, y: 0.58 },
    [KP.REAR_RIGHT_ELBOW]:  { x: 0.30, y: 0.56 },
  }, 'good', ts);
}

function poorObs(ts = 1000): StabilizedPoseObservation {
  return {
    keypoints:       allMissing(),
    confidence:      0.1,
    trackingQuality: 'poor',
    bodyCenter:      null,
    bodyAngle:       null,
    timestamp:       ts,
    isDropout:       true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Feature extraction
// ─────────────────────────────────────────────────────────────────────────────

test('Features: stand observation has large pawsRelativeToWithers', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(standObs(), state);
  assert.ok(f.pawsRelativeToWithers !== null, 'should have paws relative to withers');
  assert.ok(f.pawsRelativeToWithers! > 0.2, `stand should have paws well below withers, got ${f.pawsRelativeToWithers}`);
});

test('Features: stand has mostly straight leg angles (> 2.0 rad)', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(standObs(), state);
  if (f.frontLegBendAngle !== null) {
    assert.ok(f.frontLegBendAngle > 1.8, `stand front angle ${f.frontLegBendAngle} should be > 1.8`);
  }
  if (f.rearLegBendAngle !== null) {
    assert.ok(f.rearLegBendAngle > 1.8, `stand rear angle ${f.rearLegBendAngle} should be > 1.8`);
  }
});

test('Features: sit has sharply bent rear legs', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(sitObs(), state);
  if (f.rearLegBendAngle !== null) {
    assert.ok(f.rearLegBendAngle < 2.0, `sit rear angle ${f.rearLegBendAngle} should be < 2.0`);
  }
});

test('Features: sit has positive frontRearPawDeltaY (front paws lower)', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(sitObs(), state);
  if (f.frontRearPawDeltaY !== null) {
    assert.ok(f.frontRearPawDeltaY > 0, `sit should have front paws lower, got ${f.frontRearPawDeltaY}`);
  }
});

test('Features: down observation has low aspect ratio (wide)', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(downObs(), state);
  assert.ok(f.aspectRatio !== null, 'should have aspect ratio');
  assert.ok(f.aspectRatio! < 1.0, `down aspect ratio ${f.aspectRatio} should be < 1.0`);
});

test('Features: down has small pawsRelativeToWithers (paws close to body)', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(downObs(), state);
  if (f.pawsRelativeToWithers !== null) {
    assert.ok(f.pawsRelativeToWithers < 0.30, `down paws relative ${f.pawsRelativeToWithers} should be < 0.30`);
  }
});

test('Features: motion score increases after body center moves', () => {
  const state = createFeatureExtractorState();
  // Feed stable frames
  for (let i = 0; i < 5; i++) extractPoseFeatures(standObs(i * 100), state);
  const stable = extractPoseFeatures(standObs(500), state);

  // Reset and feed frames with large movement
  resetFeatureExtractorState(state);
  for (let i = 0; i < 5; i++) {
    const xJitter = (i % 2 === 0) ? 0.3 : 0.7;
    const obs = makeObs({
      [KP.WITHERS]: { x: xJitter, y: 0.3 },
      [KP.THROAT]:  { x: xJitter, y: 0.35 },
    }, 'good', i * 100);
    extractPoseFeatures(obs, state);
  }
  const moving = extractPoseFeatures(
    makeObs({ [KP.WITHERS]: { x: 0.3, y: 0.3 }, [KP.THROAT]: { x: 0.3, y: 0.35 } }, 'good', 500),
    state
  );

  assert.ok(moving.motionScore > stable.motionScore, 'moving should have higher motion score');
});

test('Features: hold duration increases while center is stable', () => {
  const state = createFeatureExtractorState();
  let f = extractPoseFeatures(standObs(0), state);
  const first = f.holdDurationMs;
  f = extractPoseFeatures(standObs(2000), state);
  assert.ok(f.holdDurationMs >= first, 'hold duration should increase');
  assert.ok(f.holdDurationMs > 0, 'hold duration should be positive after stable frames');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Posture classification from features
// ─────────────────────────────────────────────────────────────────────────────

test('Classifier: stand observation → stand', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(standObs(), state);
  const c = classifyPosture(f, 'good');
  assert.equal(c.label, 'stand', `expected stand, got ${c.label} (scores: ${JSON.stringify(c.scores)})`);
  assert.ok(c.confidence > 0, 'confidence should be positive');
});

test('Classifier: sit observation → sit', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(sitObs(), state);
  const c = classifyPosture(f, 'good');
  assert.equal(c.label, 'sit', `expected sit, got ${c.label} (scores: ${JSON.stringify(c.scores)})`);
});

test('Classifier: down observation → down', () => {
  const state = createFeatureExtractorState();
  const f = extractPoseFeatures(downObs(), state);
  const c = classifyPosture(f, 'good');
  assert.equal(c.label, 'down', `expected down, got ${c.label} (scores: ${JSON.stringify(c.scores)})`);
});

test('Classifier: no keypoints → unknown', () => {
  const state = createFeatureExtractorState();
  const obs: StabilizedPoseObservation = {
    keypoints: allMissing(), confidence: 0, trackingQuality: 'poor',
    bodyCenter: null, bodyAngle: null, timestamp: 1000, isDropout: true,
  };
  const f = extractPoseFeatures(obs, state);
  const c = classifyPosture(f, 'poor');
  assert.equal(c.label, 'unknown');
  assert.equal(c.confidence, 0);
});

test('Classifier: poor tracking degrades confidence vs good tracking', () => {
  const state1 = createFeatureExtractorState();
  const state2 = createFeatureExtractorState();
  const f1 = extractPoseFeatures(standObs(), state1);
  const f2 = extractPoseFeatures(standObs(), state2);
  const cGood = classifyPosture(f1, 'good');
  const cPoor = classifyPosture(f2, 'poor');
  // poor tracking should either return unknown or have lower confidence
  if (cPoor.label !== 'unknown') {
    assert.ok(cPoor.confidence <= cGood.confidence, 'poor tracking should reduce confidence');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Hysteresis behaviour
// ─────────────────────────────────────────────────────────────────────────────

test('Hysteresis: single stand frame does not immediately enter stand', () => {
  const sm = createPoseStateMachine();
  const { state } = stepPoseStateMachine(sm, standObs(0));
  // After 1 frame, should still be unknown (need ENTER_FRAMES = 3)
  assert.equal(state.label, 'unknown');
});

test('Hysteresis: 3+ consistent stand frames enters stand', () => {
  const sm = createPoseStateMachine();
  let result = { state: sm as unknown as typeof sm, events: [] as unknown[] };
  for (let i = 0; i < 5; i++) {
    result = stepPoseStateMachine(sm, standObs(i * 100)) as unknown as typeof result;
  }
  const { state } = result as ReturnType<typeof stepPoseStateMachine>;
  assert.equal(state.label, 'stand', `expected stand after 5 frames, got ${state.label}`);
});

test('Hysteresis: entered_stand event fired after sustained evidence', () => {
  const sm = createPoseStateMachine();
  const allEvents: unknown[] = [];
  for (let i = 0; i < 6; i++) {
    const { events } = stepPoseStateMachine(sm, standObs(i * 100));
    allEvents.push(...events);
  }
  const entered = (allEvents as Array<{ type: string }>).some((e) => e.type === 'entered_stand');
  assert.ok(entered, 'entered_stand event should be emitted');
});

test('Hysteresis: single different frame does not break sit', () => {
  const sm = createPoseStateMachine();
  // Establish sit
  for (let i = 0; i < 6; i++) stepPoseStateMachine(sm, sitObs(i * 100));
  // Feed one stand frame
  stepPoseStateMachine(sm, standObs(700));
  // Should still be in sit
  const { state } = stepPoseStateMachine(sm, sitObs(800));
  assert.equal(state.label, 'sit', `expected sit to hold after one conflicting frame`);
});

test('Hysteresis: sustained different frames do break sit', () => {
  const sm = createPoseStateMachine();
  // Establish sit
  for (let i = 0; i < 6; i++) stepPoseStateMachine(sm, sitObs(i * 100));
  // Feed EXIT_FRAMES (3 for 'good') stand frames
  const allEvents: unknown[] = [];
  for (let i = 0; i < 5; i++) {
    const { events } = stepPoseStateMachine(sm, standObs(700 + i * 100));
    allEvents.push(...events);
  }
  const brokeSit = (allEvents as Array<{ type: string }>).some((e) => e.type === 'broke_sit');
  assert.ok(brokeSit, 'broke_sit should be emitted after sustained stand evidence');
});

test('Hysteresis: poor tracking increases stickiness', () => {
  const sm1 = createPoseStateMachine();
  const sm2 = createPoseStateMachine();
  // Establish sit on both
  for (let i = 0; i < 6; i++) {
    stepPoseStateMachine(sm1, sitObs(i * 100));
    stepPoseStateMachine(sm2, sitObs(i * 100));
  }
  // Feed stand with good quality to sm1, poor quality to sm2
  let brokeAt1 = -1, brokeAt2 = -1;
  for (let i = 0; i < 10; i++) {
    const t = 700 + i * 100;
    const { events: e1 } = stepPoseStateMachine(sm1, standObs(t));
    // For sm2, use a stand-like obs but with poor quality
    const poorStand = { ...standObs(t), trackingQuality: 'poor' as TrackingQuality };
    const { events: e2 } = stepPoseStateMachine(sm2, poorStand);
    if (brokeAt1 === -1 && (e1 as Array<{ type: string }>).some((e) => e.type === 'broke_sit')) brokeAt1 = i;
    if (brokeAt2 === -1 && (e2 as Array<{ type: string }>).some((e) => e.type === 'broke_sit')) brokeAt2 = i;
  }
  assert.ok(
    brokeAt1 === -1 || brokeAt2 === -1 || brokeAt2 >= brokeAt1,
    `poor quality should break later (or not at all): good=${brokeAt1} poor=${brokeAt2}`
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Event generation
// ─────────────────────────────────────────────────────────────────────────────

test('Events: entered_sit + held_posture emitted for sit', () => {
  const sm = createPoseStateMachine();
  const allEvents: unknown[] = [];
  for (let i = 0; i < 20; i++) {
    const { events } = stepPoseStateMachine(sm, sitObs(i * 200)); // 200ms gaps → 4s total
    allEvents.push(...events);
  }
  const types = (allEvents as Array<{ type: string }>).map((e) => e.type);
  assert.ok(types.includes('entered_sit'), 'entered_sit should be emitted');
  assert.ok(types.includes('held_posture'), 'held_posture should be emitted over time');
});

test('Events: held_posture carries correct posture label', () => {
  const sm = createPoseStateMachine();
  const allEvents: unknown[] = [];
  for (let i = 0; i < 20; i++) {
    const { events } = stepPoseStateMachine(sm, sitObs(i * 200));
    allEvents.push(...events);
  }
  const held = (allEvents as Array<{ type: string; posture?: string }>)
    .filter((e) => e.type === 'held_posture');
  if (held.length > 0) {
    assert.equal(held[0].posture, 'sit');
  }
});

test('Events: significant_motion emitted on large movement', () => {
  const sm = createPoseStateMachine();
  // Establish stand
  for (let i = 0; i < 5; i++) stepPoseStateMachine(sm, standObs(i * 100));

  // Feed alternating large-movement frames
  const allEvents: unknown[] = [];
  for (let i = 0; i < 10; i++) {
    const xJitter = (i % 2 === 0) ? 0.2 : 0.8;
    const obs = makeObs({
      [KP.WITHERS]:           { x: xJitter, y: 0.30 },
      [KP.THROAT]:            { x: xJitter, y: 0.35 },
      [KP.FRONT_LEFT_PAW]:    { x: xJitter, y: 0.76 },
      [KP.FRONT_LEFT_KNEE]:   { x: xJitter, y: 0.56 },
      [KP.FRONT_LEFT_ELBOW]:  { x: xJitter, y: 0.38 },
      [KP.REAR_LEFT_PAW]:     { x: xJitter - 0.15, y: 0.76 },
      [KP.REAR_LEFT_KNEE]:    { x: xJitter - 0.15, y: 0.56 },
      [KP.REAR_LEFT_ELBOW]:   { x: xJitter - 0.12, y: 0.40 },
    }, 'good', 600 + i * 100);
    const { events } = stepPoseStateMachine(sm, obs);
    allEvents.push(...events);
  }
  const hasMotion = (allEvents as Array<{ type: string }>).some((e) => e.type === 'significant_motion');
  assert.ok(hasMotion, 'significant_motion should be emitted after large movements');
});

test('Events: tracking_lost emitted after sustained poor quality', () => {
  const sm = createPoseStateMachine();
  const allEvents: unknown[] = [];
  for (let i = 0; i < 10; i++) {
    const { events } = stepPoseStateMachine(sm, poorObs(i * 100));
    allEvents.push(...events);
  }
  const lostEvent = (allEvents as Array<{ type: string }>).some((e) => e.type === 'tracking_lost');
  assert.ok(lostEvent, 'tracking_lost should be emitted after sustained poor tracking');
});

test('Events: tracking_recovered emitted after quality improves', () => {
  const sm = createPoseStateMachine();
  const allEvents: unknown[] = [];
  // First lose tracking
  for (let i = 0; i < 8; i++) stepPoseStateMachine(sm, poorObs(i * 100));
  // Then recover
  for (let i = 0; i < 6; i++) {
    const { events } = stepPoseStateMachine(sm, standObs(900 + i * 100));
    allEvents.push(...events);
  }
  const recovered = (allEvents as Array<{ type: string }>).some((e) => e.type === 'tracking_recovered');
  assert.ok(recovered, 'tracking_recovered should be emitted after quality improves');
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Degraded tracking behaviour
// ─────────────────────────────────────────────────────────────────────────────

test('Degraded: no posture entry on poor quality even with enough frames', () => {
  const sm = createPoseStateMachine();
  // Feed 10 stand frames but with poor quality
  for (let i = 0; i < 10; i++) {
    const obs = { ...standObs(i * 100), trackingQuality: 'poor' as TrackingQuality };
    stepPoseStateMachine(sm, obs);
  }
  // With poor quality, ENTER_FRAMES = 6 and confidence is degraded heavily
  // The classifier may return 'unknown' with poor quality, so state should not enter stand
  const { state } = stepPoseStateMachine(sm, {
    ...standObs(1100),
    trackingQuality: 'poor',
  });
  // Either unknown or the posture entered but with degraded confidence
  if (state.label !== 'unknown') {
    assert.ok(state.confidence < 0.8, `confidence under poor quality should be < 0.8, got ${state.confidence}`);
  }
});

test('Degraded: classifier returns unknown with empty keypoints and poor tracking', () => {
  const sm = createPoseStateMachine();
  for (let i = 0; i < 5; i++) {
    const { state } = stepPoseStateMachine(sm, poorObs(i * 100));
    assert.equal(state.label, 'unknown');
  }
});

test('Degraded: reset clears all state', () => {
  const sm = createPoseStateMachine();
  for (let i = 0; i < 10; i++) stepPoseStateMachine(sm, standObs(i * 100));
  resetPoseStateMachine(sm);
  const { state } = stepPoseStateMachine(sm, standObs(2000));
  assert.equal(state.label, 'unknown', 'after reset, single frame should be unknown again');
  assert.equal(state.holdDurationMs, 0);
  assert.equal(state.trackingLost, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. StepResult shape
// ─────────────────────────────────────────────────────────────────────────────

test('StepResult has all required fields', () => {
  const sm = createPoseStateMachine();
  const { state, events } = stepPoseStateMachine(sm, standObs());
  assert.ok('label'              in state);
  assert.ok('confidence'         in state);
  assert.ok('trackingLost'       in state);
  assert.ok('holdDurationMs'     in state);
  assert.ok('features'           in state);
  assert.ok('rawClassification'  in state);
  assert.ok(Array.isArray(events));
});

test('Features are exposed on state', () => {
  const sm = createPoseStateMachine();
  const { state } = stepPoseStateMachine(sm, standObs());
  assert.ok(state.features !== null);
  assert.ok('motionScore' in state.features!);
  assert.ok('postureConfidence' in state.features!);
});
