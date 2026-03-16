// ─────────────────────────────────────────────────────────────────────────────
// Live Coaching Engine Tests
//
// Covers: state transitions, rep counting, reset handling, tracking loss,
// protocol completion, and message debounce / cooldown behaviour.
//
// Run with: node --experimental-strip-types tests/liveCoaching.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCoachingEngine,
  resetCoachingEngine,
  stepCoachingEngine,
} from '../lib/liveCoach/liveCoachingEngine.ts';
import {
  createCoachingSession,
  stepCoachingSession,
  getCoachingMetrics,
  getCompletedReps,
  isCoachingComplete,
  resetCoachingSession,
} from '../lib/liveCoach/liveCoachingSession.ts';
import { resolveCoachingConfig } from '../lib/liveCoach/liveCoachingTypes.ts';

import type { CoachingFrameInput } from '../lib/liveCoach/liveCoachingTypes.ts';
import type { LiveCoachingConfig } from '../constants/protocols.ts';
import type { PostureState } from '../lib/vision/poseStateMachine.ts';
import type { PoseEvent } from '../lib/vision/poseEventDetector.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal settle_s1-style config: hold 'down' for 5 s, 3 reps required. */
const BASE_CONFIG: LiveCoachingConfig = {
  mode: 'stationary_hold',
  targetPostures: ['down'],
  minTrackingQuality: 'fair',
  minPostureConfidence: 0.45,
  stabilizationProfile: 'stationary',
  successRules: [
    {
      type: 'hold_duration',
      postureLabel: 'down',
      minHoldMs: 5000,
      description: 'Hold down for 5 s',
    },
  ],
  resetRules: [
    {
      type: 'broke_posture',
      postureLabel: 'down',
      description: 'Left down posture',
    },
  ],
  feedbackTemplates: [
    '{dog_name} held for {hold_seconds} seconds!',
    'Rep {rep_count} done — great!',
  ],
  holdDurationMs: 5000,
  requiredRepCount: 3,
};

function makePostureState(
  label: PostureState['label'],
  trackingLost = false
): PostureState {
  return {
    label,
    trackingLost,
    confirmedAt: null,
    holdDurationMs: 0,
    framesSinceLastChange: 0,
  };
}

function makeFrame(overrides: Partial<CoachingFrameInput> = {}): CoachingFrameInput {
  return {
    postureState:      makePostureState('down'),
    poseEvents:        [],
    trackingQuality:   'good',
    postureConfidence: 0.80,
    elapsedSessionMs:  0,
    timestamp:         1000,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeSession(repCount = 3) {
  return createCoachingSession(BASE_CONFIG, repCount, 'Rex', 0);
}

/**
 * Drive the engine through a complete successful hold at the given rep.
 * Returns the timestamp immediately after the hold completes.
 *
 * startMs  : timestamp to begin the hold
 * holdMs   : how long the hold should last (should be >= config.holdDurationMs)
 */
function driveHold(
  session: ReturnType<typeof makeSession>,
  startMs: number,
  holdMs = 5100
): number {
  // First frame starts the hold_in_progress state
  stepCoachingSession(session, makeFrame({ timestamp: startMs }));

  // Advance time — last frame completes the hold
  const endMs = startMs + holdMs;
  const decision = stepCoachingSession(session, makeFrame({ timestamp: endMs }));
  return endMs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test('initial state is waiting', () => {
  const session = makeSession();
  // No frames yet — engine should be in waiting state internally
  assert.equal(session._engine.engineState, 'waiting');
  assert.equal(getCompletedReps(session), 0);
  assert.equal(isCoachingComplete(session), false);
});

// ── Transition: waiting → hold_in_progress ────────────────────────────────────

test('waiting → hold_in_progress when target posture confirmed with sufficient confidence', () => {
  const session = makeSession();
  const decision = stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('down'),
    postureConfidence: 0.80,  // above 0.45 + 0.05 boost
    timestamp:         1000,
  }));
  assert.equal(decision.state, 'hold_in_progress');
  assert.equal(session._engine.engineState, 'hold_in_progress');
});

test('stays waiting when confidence is below hold-start threshold', () => {
  const session = makeSession();
  // minPostureConfidence=0.45, boost=0.05 → requires >= 0.50 to start hold
  const decision = stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('down'),
    postureConfidence: 0.49,  // just below threshold
    timestamp:         1000,
  }));
  assert.equal(decision.state, 'waiting');
});

test('stays waiting when posture is not the target', () => {
  const session = makeSession();
  const decision = stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('sit'),
    postureConfidence: 0.90,
    timestamp:         1000,
  }));
  assert.equal(decision.state, 'waiting');
});

// ── Successful hold completion ─────────────────────────────────────────────────

test('successful hold transitions to good_rep', () => {
  const session = makeSession();

  // Start hold
  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  assert.equal(session._engine.engineState, 'hold_in_progress');

  // Complete hold (5100 ms later)
  const decision = stepCoachingSession(session, makeFrame({ timestamp: 6100 }));
  assert.equal(decision.state, 'good_rep');
  assert.equal(decision.incrementRep, true);
});

test('one hold counts exactly one rep', () => {
  const session = makeSession();

  // Rep 1
  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  stepCoachingSession(session, makeFrame({ timestamp: 6100 }));
  assert.equal(getCompletedReps(session), 1);

  // good_rep display expires → back to waiting
  stepCoachingSession(session, makeFrame({
    timestamp:         8000,  // 1900 ms after good_rep (> GOOD_REP_DISPLAY_MS=1200)
    postureState:      makePostureState('stand'),  // dog stood up during display
    postureConfidence: 0.80,
  }));
  assert.equal(session._engine.engineState, 'waiting');
  // Still only 1 rep
  assert.equal(getCompletedReps(session), 1);
});

test('completed rep metrics are updated after successful hold', () => {
  const session = makeSession();

  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  stepCoachingSession(session, makeFrame({ timestamp: 6100 }));

  const metrics = getCoachingMetrics(session);
  assert.equal(metrics.repCountDetected, 1);
  assert.equal(metrics.successfulHolds, 1);
  assert.ok(metrics.averageHoldDurationMs > 0);
});

// ── Broken posture reset ───────────────────────────────────────────────────────

test('broke_posture event triggers reset during hold_in_progress', () => {
  const session = makeSession();

  // Start hold
  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  assert.equal(session._engine.engineState, 'hold_in_progress');

  // Broke posture event arrives before hold duration
  const brokeEvent: PoseEvent = { type: 'broke_down', timestamp: 2000 };
  const decision = stepCoachingSession(session, makeFrame({
    timestamp:  2000,
    poseEvents: [brokeEvent],
  }));

  assert.equal(decision.state, 'reset');
  assert.equal(decision.incrementRep, false);
  assert.equal(getCompletedReps(session), 0);
});

test('switching to non-target posture triggers reset', () => {
  const session = makeSession();

  // Start hold
  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));

  // Dog gets up mid-hold — posture label changes to 'stand'
  const decision = stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('stand'),
    postureConfidence: 0.80,
    timestamp:         2000,
  }));

  assert.equal(decision.state, 'reset');
  assert.equal(getCompletedReps(session), 0);
});

test('reset increments metrics.resetCount', () => {
  const session = makeSession();

  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));

  const brokeEvent: PoseEvent = { type: 'broke_down', timestamp: 2000 };
  stepCoachingSession(session, makeFrame({ timestamp: 2000, poseEvents: [brokeEvent] }));

  const metrics = getCoachingMetrics(session);
  assert.equal(metrics.resetCount, 1);
});

test('after reset display expires engine returns to waiting', () => {
  const session = makeSession();

  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  const brokeEvent: PoseEvent = { type: 'broke_down', timestamp: 2000 };
  stepCoachingSession(session, makeFrame({ timestamp: 2000, poseEvents: [brokeEvent] }));
  assert.equal(session._engine.engineState, 'reset');

  // RESET_DISPLAY_MS = 1000; advance past it
  stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('stand'),
    postureConfidence: 0.80,
    timestamp:         3100,
  }));
  assert.equal(session._engine.engineState, 'waiting');
});

// ── Tracking loss blocking success ────────────────────────────────────────────

test('gate closed (poor quality) transitions to lost_tracking', () => {
  const session = makeSession();

  const decision = stepCoachingSession(session, makeFrame({
    trackingQuality:   'poor',
    postureConfidence: 0.10,  // below minPostureConfidence
    timestamp:         1000,
  }));

  assert.equal(decision.state, 'lost_tracking');
  assert.equal(decision.trackingBlocked, true);
});

test('hold does not complete while tracking is lost', () => {
  const session = makeSession();

  // Start hold
  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  assert.equal(session._engine.engineState, 'hold_in_progress');

  // Tracking drops out
  stepCoachingSession(session, makeFrame({
    trackingQuality:   'poor',
    postureConfidence: 0.10,
    timestamp:         2000,
  }));
  assert.equal(session._engine.engineState, 'lost_tracking');

  // Even though wall time has elapsed, no rep should be counted
  assert.equal(getCompletedReps(session), 0);
});

test('engine recovers from lost_tracking to waiting when gate reopens', () => {
  const session = makeSession();

  // Close gate
  stepCoachingSession(session, makeFrame({
    trackingQuality:   'poor',
    postureConfidence: 0.10,
    timestamp:         1000,
  }));
  assert.equal(session._engine.engineState, 'lost_tracking');

  // Reopen gate
  const decision = stepCoachingSession(session, makeFrame({
    trackingQuality:   'good',
    postureConfidence: 0.80,
    postureState:      makePostureState('stand'),  // not target → still waiting
    timestamp:         2000,
  }));
  assert.equal(decision.state, 'waiting');
});

test('hold timer resets when tracking is lost mid-hold', () => {
  const session = makeSession();

  // Start hold
  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));

  // Lose tracking
  stepCoachingSession(session, makeFrame({
    trackingQuality:   'poor',
    postureConfidence: 0.10,
    timestamp:         4000,  // 3 s into hold — not yet complete
  }));

  // Regain tracking — gate reopens
  stepCoachingSession(session, makeFrame({
    trackingQuality:   'good',
    postureConfidence: 0.80,
    postureState:      makePostureState('stand'),
    timestamp:         5000,
  }));

  // Start a new hold from here — hold timer restarts from 0
  stepCoachingSession(session, makeFrame({ timestamp: 5000 }));
  assert.equal(session._engine.holdTimerMs, 0);
});

// ── Protocol completion ───────────────────────────────────────────────────────

test('completing requiredRepCount reps transitions to complete', () => {
  // Use 1-rep config for simplicity
  const singleRepConfig: LiveCoachingConfig = {
    ...BASE_CONFIG,
    requiredRepCount: 1,
  };
  const session = createCoachingSession(singleRepConfig, 1, 'Rex', 0);

  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  const decision = stepCoachingSession(session, makeFrame({ timestamp: 6100 }));

  assert.equal(decision.state, 'complete');
  assert.equal(decision.markSuccess, true);
  assert.equal(isCoachingComplete(session), true);
});

test('engine stays in complete after reaching requiredRepCount', () => {
  const singleRepConfig: LiveCoachingConfig = {
    ...BASE_CONFIG,
    requiredRepCount: 1,
  };
  const session = createCoachingSession(singleRepConfig, 1, 'Rex', 0);

  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  stepCoachingSession(session, makeFrame({ timestamp: 6100 }));

  // Additional frames should not change state
  const d1 = stepCoachingSession(session, makeFrame({ timestamp: 7000 }));
  const d2 = stepCoachingSession(session, makeFrame({ timestamp: 8000 }));
  assert.equal(d1.state, 'complete');
  assert.equal(d2.state, 'complete');
  assert.equal(getCompletedReps(session), 1);
});

test('full 3-rep protocol completes after 3 successful holds', () => {
  const session = makeSession(3);  // 3 reps required

  for (let rep = 0; rep < 3; rep++) {
    // Start of this rep (after any display window)
    const baseMs = rep * 10_000 + 1000;

    // Enter target posture → hold_in_progress
    stepCoachingSession(session, makeFrame({ timestamp: baseMs }));
    // Complete hold
    const decision = stepCoachingSession(session, makeFrame({ timestamp: baseMs + 5100 }));

    if (rep < 2) {
      assert.equal(decision.state, 'good_rep', `rep ${rep + 1} should be good_rep`);
      // Advance past GOOD_REP_DISPLAY_MS=1200
      stepCoachingSession(session, makeFrame({
        postureState:      makePostureState('stand'),
        postureConfidence: 0.80,
        timestamp:         baseMs + 5100 + 1300,
      }));
    } else {
      assert.equal(decision.state, 'complete', 'final rep should be complete');
    }
  }

  assert.equal(isCoachingComplete(session), true);
  assert.equal(getCompletedReps(session), 3);
});

// ── Message debounce / cooldown ───────────────────────────────────────────────

test('message does not change while cooldown has not elapsed', () => {
  const session = makeSession();

  // Enter waiting state — initial message set
  const d1 = stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('stand'),
    postureConfidence: 0.80,
    timestamp:         1000,
  }));
  const firstMessage = d1.message;

  // Same state, 500 ms later (< MESSAGE_COOLDOWN_MS = 2000)
  const d2 = stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('stand'),
    postureConfidence: 0.80,
    timestamp:         1500,
  }));
  assert.equal(d2.message, firstMessage);
});

test('state-change forces message update regardless of cooldown', () => {
  const session = makeSession();

  // Waiting message
  const d1 = stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('stand'),
    postureConfidence: 0.80,
    timestamp:         1000,
  }));

  // Immediately enter hold (10 ms later — well within cooldown)
  const d2 = stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('down'),
    postureConfidence: 0.80,
    timestamp:         1010,
  }));

  assert.equal(d2.state, 'hold_in_progress');
  assert.notEqual(d2.message, d1.message);
});

// ── Session-level API (liveCoachingSession.ts) ────────────────────────────────

test('createCoachingSession resolves config correctly', () => {
  const session = makeSession(5);
  assert.equal(session.config.requiredRepCount, 3);  // config.requiredRepCount=3 overrides protocol's 5
  assert.equal(session.config.holdDurationMs, 5000);
  assert.deepEqual(session.config.targetPostures, ['down']);
});

test('resetCoachingSession resets engine to waiting with zero reps', () => {
  const session = makeSession();

  // Do some work
  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  stepCoachingSession(session, makeFrame({ timestamp: 6100 }));
  assert.equal(getCompletedReps(session), 1);

  resetCoachingSession(session, 20_000);
  assert.equal(getCompletedReps(session), 0);
  assert.equal(session._engine.engineState, 'waiting');
  assert.equal(isCoachingComplete(session), false);
});

test('getCoachingMetrics returns a snapshot copy', () => {
  const session = makeSession();

  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  stepCoachingSession(session, makeFrame({ timestamp: 6100 }));

  const snap1 = getCoachingMetrics(session);

  // Advance and do another rep
  stepCoachingSession(session, makeFrame({
    postureState:      makePostureState('stand'),
    postureConfidence: 0.80,
    timestamp:         7500,
  }));
  stepCoachingSession(session, makeFrame({ timestamp: 8000 }));
  stepCoachingSession(session, makeFrame({ timestamp: 13100 }));

  const snap2 = getCoachingMetrics(session);

  // snap1 should be unchanged
  assert.equal(snap1.repCountDetected, 1);
  assert.equal(snap2.repCountDetected, 2);
});

// ── Hold timer accuracy ───────────────────────────────────────────────────────

test('hold timer reflects elapsed time in hold_in_progress', () => {
  const session = makeSession();

  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  // 2 s into hold
  const decision = stepCoachingSession(session, makeFrame({ timestamp: 3000 }));
  assert.equal(decision.state, 'hold_in_progress');
  assert.ok(decision.holdTimerMs >= 2000, `expected holdTimerMs >= 2000, got ${decision.holdTimerMs}`);
});

test('hold timer resets to 0 after completed rep', () => {
  const session = makeSession();

  stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  const decision = stepCoachingSession(session, makeFrame({ timestamp: 6100 }));

  assert.equal(decision.state, 'good_rep');
  assert.equal(decision.holdTimerMs, 0);
});

test('targetHoldMs matches config holdDurationMs', () => {
  const session = makeSession();
  const decision = stepCoachingSession(session, makeFrame({ timestamp: 1000 }));
  assert.equal(decision.targetHoldMs, 5000);
});
