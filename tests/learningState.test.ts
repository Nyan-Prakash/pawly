import assert from 'node:assert/strict';
import test from 'node:test';

import type { DogLearningState, Plan } from '../types/index.ts';
import {
  aggregateRecentSignals,
  trimSignalsForWindow,
  type SessionLogInput,
  type WalkLogInput,
} from '../lib/adaptivePlanning/learningSignals.ts';
import {
  computeUpdatedLearningState,
  recomputeLearningStateFromHistory,
} from '../lib/adaptivePlanning/learningStateScoring.ts';
import { buildLearningStateCoachSummary } from '../lib/adaptivePlanning/learningStateSummary.ts';

function makeState(overrides: Partial<DogLearningState> = {}): DogLearningState {
  return {
    id: 'state_1',
    dogId: 'dog_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    motivationScore: 3,
    distractionSensitivity: 3,
    confidenceScore: 3,
    impulseControlScore: 3,
    handlerConsistencyScore: 3,
    fatigueRiskScore: 3,
    recoverySpeedScore: 3,
    environmentConfidence: {
      indoors_low_distraction: 3,
      indoors_moderate_distraction: 3,
      outdoors_low_distraction: 3,
      outdoors_moderate_distraction: 3,
      outdoors_high_distraction: 2,
    },
    behaviorSignals: {},
    recentTrends: {},
    currentHypotheses: [],
    lastEvaluatedAt: null,
    version: 2,
    ...overrides,
  };
}

function makePlan(): Plan {
  return {
    id: 'plan_1',
    dogId: 'dog_1',
    goal: 'leash_pulling',
    status: 'active',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    currentWeek: 1,
    currentStage: 'Stage 2',
    sessions: [
      {
        id: 'session_1',
        exerciseId: 'llw_s1',
        weekNumber: 1,
        dayNumber: 1,
        title: 'Session 1',
        durationMinutes: 8,
        isCompleted: false,
        skillId: 'llw-attn-1',
        environment: 'indoors_low_distraction',
        sessionKind: 'core',
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

function makeSession(overrides: Partial<SessionLogInput> = {}): SessionLogInput {
  return {
    id: `session_log_${Math.random().toString(36).slice(2)}`,
    dog_id: 'dog_1',
    plan_id: 'plan_1',
    session_id: 'session_1',
    exercise_id: 'llw_s1',
    protocol_id: 'llw_s1',
    difficulty: 'easy',
    duration_seconds: 8 * 60,
    notes: 'Calm and engaged indoors.',
    session_status: 'completed',
    success_score: 5,
    step_results: [{ stepOrder: 1, completed: true, durationSeconds: 240, repCount: 8 }],
    completed_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeWalk(overrides: Partial<WalkLogInput> = {}): WalkLogInput {
  return {
    id: `walk_log_${Math.random().toString(36).slice(2)}`,
    dog_id: 'dog_1',
    quality: 2,
    duration_minutes: 20,
    notes: 'Normal walk.',
    logged_at: new Date().toISOString(),
    ...overrides,
  };
}

test('easy-success streak increases confidence', () => {
  const plan = makePlan();
  const sessions = [
    makeSession({ completed_at: '2026-03-10T10:00:00.000Z' }),
    makeSession({ completed_at: '2026-03-11T10:00:00.000Z' }),
    makeSession({ completed_at: '2026-03-12T10:00:00.000Z' }),
  ];

  const signals = aggregateRecentSignals({ sessions, walks: [], plan });
  const next = computeUpdatedLearningState(makeState(), signals);

  assert.ok(next.confidenceScore > 3);
});

test('repeated hard distraction sessions increase distraction sensitivity', () => {
  const plan = makePlan();
  const sessions = [
    makeSession({
      completed_at: '2026-03-10T10:00:00.000Z',
      difficulty: 'hard',
      success_score: 1,
      environment_tag: 'outdoors_moderate_distraction',
      notes: 'Very distracted on the sidewalk.',
    }),
    makeSession({
      completed_at: '2026-03-11T10:00:00.000Z',
      difficulty: 'hard',
      success_score: 2,
      environment_tag: 'outdoors_moderate_distraction',
      notes: 'Still distracted outside near people.',
    }),
  ];

  const signals = aggregateRecentSignals({ sessions, walks: [], plan });
  const next = computeUpdatedLearningState(makeState(), signals);

  assert.ok(next.distractionSensitivity > 3);
});

test('abandonment and long sessions increase fatigue risk', () => {
  const plan = makePlan();
  const sessions = [
    makeSession({
      completed_at: '2026-03-10T10:00:00.000Z',
      duration_seconds: 18 * 60,
      difficulty: 'hard',
      success_score: 2,
      notes: 'Too long and dog got tired.',
    }),
    makeSession({
      completed_at: '2026-03-11T10:00:00.000Z',
      duration_seconds: 15 * 60,
      session_status: 'abandoned',
      success_score: 1,
      notes: 'Stopped early. Dog was tired and checked out.',
    }),
  ];

  const signals = aggregateRecentSignals({ sessions, walks: [], plan });
  const next = computeUpdatedLearningState(makeState(), signals);

  assert.ok(next.fatigueRiskScore > 3);
});

test('rebuildLearningStateForDog logic matches incremental recompute within tolerance', () => {
  const plan = makePlan();
  const sessions = [
    makeSession({ completed_at: '2026-03-10T10:00:00.000Z' }),
    makeSession({
      completed_at: '2026-03-11T10:00:00.000Z',
      difficulty: 'hard',
      success_score: 2,
      environment_tag: 'outdoors_moderate_distraction',
      notes: 'Distracted outside.',
    }),
    makeSession({
      completed_at: '2026-03-12T10:00:00.000Z',
      session_status: 'abandoned',
      duration_seconds: 15 * 60,
      notes: 'Too long and abandoned.',
    }),
  ];
  const walks = [
    makeWalk({ logged_at: '2026-03-10T18:00:00.000Z', quality: 3, notes: 'Smooth walk.' }),
    makeWalk({ logged_at: '2026-03-11T18:00:00.000Z', quality: 1, notes: 'Pulled a lot outside.' }),
  ];

  const baseline = makeState();
  const rebuilt = recomputeLearningStateFromHistory(baseline, sessions, walks, plan);

  const timeline = [
    ...sessions.map((session) => session.completed_at ?? ''),
    ...walks.map((walk) => walk.logged_at ?? ''),
  ].sort();

  let incremental = makeState();
  for (const timestamp of timeline) {
    const window = trimSignalsForWindow(sessions, walks, timestamp);
    const signals = aggregateRecentSignals({ sessions: window.sessions, walks: window.walks, plan });
    incremental = {
      ...incremental,
      ...computeUpdatedLearningState(incremental, signals),
    };
  }

  assert.ok(Math.abs(rebuilt.confidenceScore - incremental.confidenceScore) <= 1);
  assert.ok(Math.abs(rebuilt.distractionSensitivity - incremental.distractionSensitivity) <= 1);
  assert.ok(Math.abs(rebuilt.fatigueRiskScore - incremental.fatigueRiskScore) <= 1);
});

test('coach context summary includes learning state patterns', () => {
  const state = makeState({
    confidenceScore: 4,
    distractionSensitivity: 4,
    fatigueRiskScore: 4,
    recentTrends: {
      notableEnvironmentDeltas: {
        indoors_low_distraction: 0.8,
        outdoors_moderate_distraction: -0.9,
      },
      warnings: ['Recent sessions may be running a bit long for current stamina.'],
    },
    currentHypotheses: [
      {
        code: 'environment_gap',
        summary: 'Learns quickly indoors but loses focus when the environment gets busier.',
        evidence: [],
        confidence: 'high',
      },
    ],
  });

  const summary = buildLearningStateCoachSummary('Max', state);

  assert.match(summary.summary, /Learning state for Max/i);
  assert.equal(summary.topHypotheses.length, 1);
  assert.ok(summary.environmentDeltas.length >= 1);
});
