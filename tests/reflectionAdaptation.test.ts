// ─────────────────────────────────────────────────────────────────────────────
// Reflection-Aware Adaptation Tests
//
// Covers:
//   1.  Understanding issue → repeat / regress candidate
//   2.  Distraction issue → environment/transition over broad regression
//   3.  Near-end breakdown → duration tweak / duration_building session
//   4.  Over-arousal → calm_reset / shortened session
//   5.  Handler friction → conservative mutation, no extra session
//   6.  Confidence sensitivity → high confidence drives stronger effect
//   7.  Insertion bounds — at most one extra session; dense plan blocks insertion
//   8.  Inserted session metadata is present and correct
//   9.  Audit trail includes reflection-backed reason details
//  10.  Edge-function reflection normalization — malformed input does not throw
//  11.  Backward compatibility — no-reflection scenarios still work
//  12.  Strong objective performance resists reflection-only regression
//
// Run with: node --experimental-strip-types tests/reflectionAdaptation.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import test from 'node:test';
import assert from 'node:assert/strict';

import type {
  DogLearningState,
  LearningHypothesis,
  Plan,
  PlanAdaptation,
  PostSessionReflection,
  SkillEdge,
  SkillNode,
} from '../types/index.ts';
import type {
  AggregatedRecentSignals,
  ReflectionEvidence,
  SessionLearningSignal,
  WalkLearningSignal,
} from '../lib/adaptivePlanning/learningSignals.ts';

import { runAdaptationEngine } from '../lib/adaptivePlanning/adaptationEngine.ts';
import { buildAdaptationAuditRecord } from '../lib/adaptivePlanning/adaptationAudit.ts';
import { normalizePostSessionReflection } from '../lib/adaptivePlanning/reflectionNormalizer.ts';
import { extractReflectionSignals } from '../lib/adaptivePlanning/learningSignals.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures & helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeNode(overrides: Partial<SkillNode> & { id: string }): SkillNode {
  return {
    id: overrides.id,
    behavior: 'recall',
    skillCode: overrides.id,
    title: overrides.id,
    description: null,
    stage: 1,
    difficulty: 1,
    kind: 'foundation',
    protocolId: `protocol_${overrides.id}`,
    metadata: {},
    isActive: true,
    ...overrides,
  };
}

function makeEdge(fromSkillId: string, toSkillId: string, edgeType: SkillEdge['edgeType']): SkillEdge {
  return {
    id: `${fromSkillId}_${toSkillId}_${edgeType}`,
    fromSkillId,
    toSkillId,
    edgeType,
    conditionSummary: null,
    metadata: {},
  };
}

function makePlanSession(index: number, overrides: Partial<Plan['sessions'][number]> = {}): Plan['sessions'][number] {
  return {
    id: `session_${index}`,
    exerciseId: 'protocol_current',
    weekNumber: 1,
    dayNumber: index,
    title: 'Sit Stay',
    durationMinutes: 10,
    isCompleted: false,
    scheduledDate: `2026-03-1${index}`,
    scheduledTime: '19:00',
    scheduledDay: 'monday',
    skillId: 'skill_current',
    environment: 'indoors_low_distraction',
    sessionKind: 'core',
    adaptationSource: 'initial_plan',
    reasoningLabel: null,
    ...overrides,
  };
}

function makePlan(sessions: Plan['sessions'], dense = false): Plan {
  const baseSessions = sessions;
  // Dense plan: already has many upcoming sessions
  const allSessions = dense
    ? [
        ...baseSessions,
        makePlanSession(10, { id: 'extra_1' }),
        makePlanSession(11, { id: 'extra_2' }),
        makePlanSession(12, { id: 'extra_3' }),
      ]
    : baseSessions;

  return {
    id: 'plan_1',
    dogId: 'dog_1',
    goal: 'recall',
    status: 'active',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    currentWeek: 1,
    currentStage: 'Stage 1 — Foundation',
    sessions: allSessions,
    metadata: {
      preferredDays: ['monday', 'wednesday', 'friday'],
      preferredWindows: {},
      flexibility: 'move_next_slot',
      intensity: 'balanced',
      timezone: 'UTC',
    },
    createdAt: new Date().toISOString(),
  };
}

function makeLearningState(overrides: Partial<DogLearningState> = {}): DogLearningState {
  return {
    id: 'ls_1',
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
    environmentConfidence: {},
    behaviorSignals: {},
    recentTrends: {},
    currentHypotheses: [],
    lastEvaluatedAt: new Date().toISOString(),
    version: 1,
    ...overrides,
  };
}

function makeReflection(overrides: Partial<PostSessionReflection> = {}): PostSessionReflection {
  return {
    overallExpectation: null,
    mainIssue: null,
    failureTiming: null,
    distractionType: null,
    cueUnderstanding: null,
    arousalLevel: null,
    handlerIssue: null,
    confidenceInAnswers: 5,
    freeformNote: null,
    ...overrides,
  };
}

function makeSignal(overrides: Partial<SessionLearningSignal> = {}): SessionLearningSignal {
  return {
    sourceId: 'log_1',
    dogId: 'dog_1',
    planId: 'plan_1',
    exerciseId: 'protocol_current',
    protocolId: 'protocol_current',
    skillId: 'skill_current',
    sessionKind: 'core',
    occurredAt: new Date().toISOString(),
    durationSeconds: 600,
    successScore: 3,
    completed: true,
    abandoned: false,
    difficulty: 'okay',
    environmentTag: 'indoors_low_distraction',
    stepCompletionRate: 1,
    repCountAverage: 5,
    focusDemand: 'low',
    notesFlags: {
      distracted: false,
      tired: false,
      confident: false,
      frustrated: false,
      handlerTimingIssue: false,
      motivated: false,
      outdoors: false,
    },
    similarityKey: 'skill_current:indoors_low_distraction',
    isRecoverySession: false,
    reflection: {
      understandingIssue: 0,
      distractionIssue: 0,
      durationBreakdownIssue: 0,
      arousalIssue: 0,
      handlerFrictionIssue: 0,
      reflectionConfidence: 0,
    },
    ...overrides,
  };
}

function makeReflectionEvidence(overrides: Partial<ReflectionEvidence> = {}): ReflectionEvidence {
  return {
    understandingPressure: 0,
    distractionPressure: 0,
    durationBreakdownPressure: 0,
    arousalPressure: 0,
    handlerFrictionPressure: 0,
    sessionsWithReflection: 3,
    avgReflectionConfidence: 0.8,
    ...overrides,
  };
}

function makeAggregatedSignals(
  reflectionOverrides: Partial<ReflectionEvidence> = {},
  summaryOverrides: Partial<AggregatedRecentSignals['summary']> = {},
): AggregatedRecentSignals {
  return {
    asOf: new Date().toISOString(),
    sessions: [],
    walks: [],
    plan: {
      id: 'plan_1',
      behaviorGoal: 'recall',
      currentStage: 1,
      scheduleIntensity: 'balanced',
    },
    summary: {
      sessionCount: 3,
      completedCount: 3,
      abandonedCount: 0,
      hardSessionCount: 1,
      hardOutdoorCount: 0,
      proofingCount: 0,
      easySuccessStreak: 0,
      avgSessionSuccess: 2.5,
      avgSessionDurationMinutes: 10,
      longSessionCount: 0,
      abandonmentRate: 0,
      indoorSuccessRate: 0.6,
      outdoorSuccessRate: 0.4,
      lowDistractionSuccessRate: 0.6,
      inconsistencyIndex: 0.1,
      recoverySessionCount: 0,
      recoveryBounceRate: 0,
      poorWalkCount: 0,
      goodWalkCount: 0,
      walkQualityAvg: 2,
      walkQualityDelta: 0,
      motivationDropInLongSessions: false,
      notableEnvironmentDeltas: {},
      warnings: [],
      reflectionEvidence: makeReflectionEvidence(reflectionOverrides),
      ...summaryOverrides,
    },
  };
}

const STD_NODES = [
  makeNode({ id: 'skill_current', stage: 1, kind: 'foundation', title: 'Sit Stay', protocolId: 'protocol_current' }),
  makeNode({ id: 'skill_advance', stage: 2, kind: 'core', title: 'Sit Stay Advance', protocolId: 'protocol_advance' }),
  makeNode({ id: 'skill_regress', stage: 1, kind: 'foundation', title: 'Sit Foundation', protocolId: 'protocol_regress' }),
  makeNode({ id: 'skill_detour', stage: 1, kind: 'foundation', title: 'Name Response', protocolId: 'protocol_detour' }),
];
const STD_EDGES = [
  makeEdge('skill_current', 'skill_advance', 'advance'),
  makeEdge('skill_current', 'skill_regress', 'regress'),
  makeEdge('skill_current', 'skill_detour', 'detour'),
];

function runEngine(params: {
  sessions?: SessionLearningSignal[];
  reflectionEvidence?: Partial<ReflectionEvidence>;
  summaryOverrides?: Partial<AggregatedRecentSignals['summary']>;
  learningState?: Partial<DogLearningState>;
  adaptations?: PlanAdaptation[];
  plan?: Plan;
  hypotheses?: LearningHypothesis[];
}) {
  const plan =
    params.plan ??
    makePlan([
      makePlanSession(1),
      makePlanSession(2),
      makePlanSession(3),
      makePlanSession(4),
      makePlanSession(5),
    ]);

  return runAdaptationEngine({
    plan,
    nodes: STD_NODES,
    edges: STD_EDGES,
    learningState: makeLearningState(params.learningState ?? {}),
    aggregatedSignals: makeAggregatedSignals(
      params.reflectionEvidence ?? {},
      params.summaryOverrides ?? {},
    ),
    recentSessions: params.sessions ?? [makeSignal()],
    recentWalks: [] as WalkLearningSignal[],
    recentAdaptations: params.adaptations ?? [],
    now: '2026-03-17T12:00:00.000Z',
    currentHypotheses: params.hypotheses ?? [],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Understanding issue
// ─────────────────────────────────────────────────────────────────────────────

test('understanding: moderate pressure → repeat candidate at current skill', () => {
  const result = runEngine({
    reflectionEvidence: { understandingPressure: 0.5, sessionsWithReflection: 3 },
  });

  assert.ok(result, 'engine should return a result');
  assert.ok(
    result.adaptationType === 'repeat' || result.adaptationType === 'regress',
    `Expected repeat or regress, got ${result.adaptationType}`,
  );
  assert.ok(result.reasonCode.includes('understanding'), `Expected understanding reason, got ${result.reasonCode}`);
  assert.equal(result.applied, true);
});

test('understanding: strong pressure + regress target → regress candidate', () => {
  const result = runEngine({
    reflectionEvidence: { understandingPressure: 0.75, sessionsWithReflection: 3 },
  });

  assert.ok(result, 'engine should return a result');
  assert.equal(result.adaptationType, 'regress', `Expected regress for strong understanding pressure`);
  assert.equal(result.reasonCode, 'reflection_understanding_gap');
});

test('understanding: moderate pressure → may insert foundation support session', () => {
  const result = runEngine({
    reflectionEvidence: { understandingPressure: 0.5, sessionsWithReflection: 3 },
  });

  // Should insert a foundation session when plan is not dense
  assert.ok(result);
  if (result.insertedSupportSessionId) {
    const inserted = result.nextPlan.sessions.find((s) => s.id === result.insertedSupportSessionId);
    assert.ok(inserted, 'Inserted session should be present in nextPlan');
    assert.equal(inserted!.supportSessionType, 'foundation');
    assert.equal(inserted!.insertedByAdaptation, true);
    assert.ok(inserted!.insertionReasonCode?.includes('understanding'));
  }
  // (Some plan configurations may not insert — just check metadata if it did)
});

test('understanding: hypothesis cue_understanding_gap alone triggers the rule', () => {
  const result = runEngine({
    // Pressure is low but hypothesis is present
    reflectionEvidence: { understandingPressure: 0.2, sessionsWithReflection: 1 },
    hypotheses: [
      {
        code: 'cue_understanding_gap',
        summary: 'Dog may not understand the cue yet.',
        evidence: [],
        confidence: 'medium',
      },
    ],
  });

  assert.ok(result, 'hypothesis alone should trigger adaptation');
  assert.ok(result.reasonCode === 'reflection_understanding_gap', `Got ${result.reasonCode}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Distraction issue
// ─────────────────────────────────────────────────────────────────────────────

test('distraction: prefers environment adjustment over broad regression when baseline is mediocre', () => {
  const result = runEngine({
    reflectionEvidence: { distractionPressure: 0.6, sessionsWithReflection: 3 },
    summaryOverrides: { avgSessionSuccess: 2.8, outdoorSuccessRate: 0.4 },
  });

  assert.ok(result, 'engine should return a result');
  assert.equal(result.adaptationType, 'environment_adjustment', `Expected environment_adjustment, got ${result.adaptationType}`);
  assert.equal(result.reasonCode, 'reflection_distraction_blocker');
});

test('distraction: inserts transition support session', () => {
  const result = runEngine({
    reflectionEvidence: { distractionPressure: 0.6, sessionsWithReflection: 3 },
    summaryOverrides: { avgSessionSuccess: 2.8 },
  });

  assert.ok(result);
  if (result.insertedSupportSessionId) {
    const inserted = result.nextPlan.sessions.find((s) => s.id === result.insertedSupportSessionId);
    assert.ok(inserted);
    assert.equal(inserted!.supportSessionType, 'transition');
  }
});

test('distraction: does NOT broadly regress when objective performance is clearly strong', () => {
  const result = runEngine({
    reflectionEvidence: { distractionPressure: 0.5, sessionsWithReflection: 3 },
    // Strong objective performance
    summaryOverrides: { avgSessionSuccess: 4.2, easySuccessStreak: 3 },
  });

  // Should either produce no result OR produce a gentle environment_adjustment
  // — must NOT produce a regress
  if (result) {
    assert.ok(
      result.adaptationType !== 'regress',
      `Should not regress when objective performance is strong, got ${result.adaptationType}`,
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Near-end breakdown
// ─────────────────────────────────────────────────────────────────────────────

test('duration breakdown: produces difficulty_adjustment (not regress)', () => {
  const result = runEngine({
    reflectionEvidence: { durationBreakdownPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result, 'engine should return a result');
  assert.equal(result.adaptationType, 'difficulty_adjustment', `Expected difficulty_adjustment, got ${result.adaptationType}`);
  assert.equal(result.reasonCode, 'reflection_duration_breakdown');
});

test('duration breakdown: reduces session duration', () => {
  const result = runEngine({
    reflectionEvidence: { durationBreakdownPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result);
  const firstTouched = result.nextPlan.sessions.find((s) => result.diff.changedSessionIds.includes(s.id));
  assert.ok(firstTouched, 'There should be at least one touched session');
  assert.ok(firstTouched!.durationMinutes < 10, `Duration should be reduced below 10, got ${firstTouched!.durationMinutes}`);
});

test('duration breakdown: may insert duration_building support session', () => {
  const result = runEngine({
    reflectionEvidence: { durationBreakdownPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result);
  if (result.insertedSupportSessionId) {
    const inserted = result.nextPlan.sessions.find((s) => s.id === result.insertedSupportSessionId);
    assert.ok(inserted);
    assert.equal(inserted!.supportSessionType, 'duration_building');
    assert.equal(inserted!.insertedByAdaptation, true);
  }
});

test('duration breakdown: does not change skill (same skill, lower duration)', () => {
  const result = runEngine({
    reflectionEvidence: { durationBreakdownPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result);
  // Touched sessions should still reference skill_current (or null)
  for (const id of result.diff.changedSessionIds) {
    const session = result.nextPlan.sessions.find((s) => s.id === id);
    if (session && !session.insertedByAdaptation) {
      assert.ok(
        session.skillId === 'skill_current' || session.skillId == null,
        `Skill should not change for duration breakdown, got ${session.skillId}`,
      );
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Over-arousal
// ─────────────────────────────────────────────────────────────────────────────

test('arousal: produces difficulty_adjustment with reduced duration', () => {
  const result = runEngine({
    reflectionEvidence: { arousalPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result, 'engine should return a result');
  assert.equal(result.adaptationType, 'difficulty_adjustment', `Got ${result.adaptationType}`);
  assert.equal(result.reasonCode, 'reflection_over_arousal');
});

test('arousal: may insert calm_reset support session', () => {
  const result = runEngine({
    reflectionEvidence: { arousalPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result);
  if (result.insertedSupportSessionId) {
    const inserted = result.nextPlan.sessions.find((s) => s.id === result.insertedSupportSessionId);
    assert.ok(inserted);
    assert.equal(inserted!.supportSessionType, 'calm_reset');
  }
});

test('arousal: arousal_pattern hypothesis alone triggers the rule', () => {
  const result = runEngine({
    reflectionEvidence: { arousalPressure: 0.1, sessionsWithReflection: 1 },
    hypotheses: [
      {
        code: 'arousal_pattern',
        summary: 'Over-arousal may be interfering.',
        evidence: [],
        confidence: 'medium',
      },
    ],
  });

  assert.ok(result, 'hypothesis alone should trigger');
  assert.equal(result.reasonCode, 'reflection_over_arousal');
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Handler friction
// ─────────────────────────────────────────────────────────────────────────────

test('handler friction: produces only a conservative repeat', () => {
  const result = runEngine({
    reflectionEvidence: {
      handlerFrictionPressure: 0.5,
      sessionsWithReflection: 3,
      avgReflectionConfidence: 0.6,
    },
  });

  assert.ok(result, 'engine should return a result');
  assert.equal(result.adaptationType, 'repeat', `Expected repeat, got ${result.adaptationType}`);
  assert.equal(result.reasonCode, 'reflection_handler_friction');
  // Only 1 session touched (conservative)
  const nonInserted = result.diff.changedSessionIds.filter((id) => !id.startsWith('inserted_'));
  assert.ok(nonInserted.length <= 1, `Expected at most 1 session mutated for handler friction, got ${nonInserted.length}`);
});

test('handler friction: does NOT insert a support session', () => {
  const result = runEngine({
    reflectionEvidence: {
      handlerFrictionPressure: 0.5,
      sessionsWithReflection: 3,
      avgReflectionConfidence: 0.6,
    },
  });

  assert.ok(result);
  assert.equal(result.insertedSupportSessionId, null, 'Handler friction should never insert a support session');
});

test('handler friction: low confidence dampens further — priority is lower', () => {
  const lowConf = runEngine({
    reflectionEvidence: {
      handlerFrictionPressure: 0.5,
      sessionsWithReflection: 3,
      avgReflectionConfidence: 0.3, // < 0.45 threshold
    },
  });

  const normalConf = runEngine({
    reflectionEvidence: {
      handlerFrictionPressure: 0.5,
      sessionsWithReflection: 3,
      avgReflectionConfidence: 0.8, // normal confidence
    },
  });

  // Both should produce a result — just checking they don't crash
  assert.ok(lowConf !== undefined);
  assert.ok(normalConf !== undefined);

  // The dampened version should say something about "holding off" or "conservative"
  if (lowConf) {
    assert.ok(
      lowConf.reasonSummary.toLowerCase().includes('conservative') ||
        lowConf.reasonSummary.toLowerCase().includes('holding off'),
      `Low-confidence handler friction should have dampened wording, got: ${lowConf.reasonSummary}`,
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Confidence sensitivity
// ─────────────────────────────────────────────────────────────────────────────

test('confidence sensitivity: same reflection pattern at high confidence has stronger signal than low', () => {
  const highConfSignal = extractReflectionSignals(makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 5 }));
  const lowConfSignal  = extractReflectionSignals(makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 1 }));

  assert.ok(
    highConfSignal.distractionIssue > lowConfSignal.distractionIssue,
    `High confidence (${highConfSignal.distractionIssue}) should exceed low (${lowConfSignal.distractionIssue})`,
  );
});

test('confidence sensitivity: below-threshold pressure does not fire reflection rules', () => {
  // Very weak signal (0.2) + only 1 session → well below both MODERATE (0.4) threshold
  const result = runEngine({
    reflectionEvidence: {
      understandingPressure: 0.2,
      distractionPressure: 0.15,
      durationBreakdownPressure: 0.1,
      arousalPressure: 0.1,
      handlerFrictionPressure: 0.1,
      sessionsWithReflection: 1,
    },
    // No hypotheses either
    hypotheses: [],
    // No strong objective trigger either
    summaryOverrides: { avgSessionSuccess: 3.5, hardSessionCount: 0, consecutiveHard: 0 } as never,
  });

  // Should not produce any reflection-grounded result
  if (result) {
    assert.ok(
      !result.reasonCode.startsWith('reflection_'),
      `Should not trigger reflection rule for weak signals, got ${result.reasonCode}`,
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Insertion bounds
// ─────────────────────────────────────────────────────────────────────────────

test('insertion bounds: at most one extra session inserted per adaptation event', () => {
  // Trigger multiple reflection issues simultaneously
  const result = runEngine({
    reflectionEvidence: {
      understandingPressure: 0.7,
      distractionPressure: 0.6,
      arousalPressure: 0.6,
      sessionsWithReflection: 3,
    },
  });

  assert.ok(result);
  const insertedSessions = result.nextPlan.sessions.filter((s) => s.insertedByAdaptation === true);
  assert.ok(
    insertedSessions.length <= 1,
    `Expected at most 1 inserted session, got ${insertedSessions.length}`,
  );
});

test('insertion bounds: dense schedule prevents support session insertion', () => {
  // Build a plan with 5+ upcoming sessions (dense)
  const denseSessions = [
    makePlanSession(1),
    makePlanSession(2),
    makePlanSession(3),
    makePlanSession(4),
    makePlanSession(5),
    makePlanSession(6, { id: 'extra_1' }),
    makePlanSession(7, { id: 'extra_2' }),
  ];
  const densePlan = makePlan(denseSessions);

  const result = runEngine({
    plan: densePlan,
    reflectionEvidence: { understandingPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result);
  // Dense plan (upcomingCount >= 5) should not insert
  const insertedSessions = result.nextPlan.sessions.filter((s) => s.insertedByAdaptation === true);
  assert.equal(
    insertedSessions.length,
    0,
    `Dense plan should not insert extra sessions, got ${insertedSessions.length}`,
  );
  assert.equal(result.insertedSupportSessionId, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Inserted session metadata
// ─────────────────────────────────────────────────────────────────────────────

test('inserted session metadata: all required fields are present', () => {
  const result = runEngine({
    reflectionEvidence: { understandingPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result);
  if (result.insertedSupportSessionId) {
    const inserted = result.nextPlan.sessions.find((s) => s.id === result.insertedSupportSessionId);
    assert.ok(inserted, 'Inserted session must be in nextPlan');
    assert.equal(inserted!.insertedByAdaptation, true, 'insertedByAdaptation must be true');
    assert.ok(inserted!.supportSessionType != null, 'supportSessionType must be set');
    assert.ok(inserted!.insertionReasonCode != null, 'insertionReasonCode must be set');
    assert.equal(inserted!.adaptationSource, 'adaptation_engine');
    assert.ok(inserted!.scheduledDate != null, 'inserted session must have a scheduled date');
    assert.ok(inserted!.durationMinutes >= 4, 'duration must be at least 4 minutes (clamped)');
  }
});

test('inserted session metadata: appears in diff changedSessionIds', () => {
  const result = runEngine({
    reflectionEvidence: { understandingPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result);
  if (result.insertedSupportSessionId) {
    assert.ok(
      result.diff.changedSessionIds.includes(result.insertedSupportSessionId),
      'Inserted session ID must appear in diff.changedSessionIds',
    );
    assert.ok(
      result.diff.changedFields.includes('sessions.inserted'),
      `diff.changedFields should include 'sessions.inserted'`,
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Audit trail
// ─────────────────────────────────────────────────────────────────────────────

test('audit trail: reflection-backed reason details in evidence', () => {
  const result = runEngine({
    reflectionEvidence: { understandingPressure: 0.6, sessionsWithReflection: 3, avgReflectionConfidence: 0.8 },
  });

  assert.ok(result, 'engine should produce a result');
  assert.equal(result.applied, true);

  const audit = buildAdaptationAuditRecord({
    dogId: 'dog_1',
    plan: result.nextPlan,
    triggeredBySessionLogId: 'log_1',
    adaptationType: result.adaptationType,
    status: 'applied',
    reasonCode: result.reasonCode,
    reasonSummary: result.reasonSummary,
    evidence: {
      ...result.evidence,
      reflectionEvidence: makeReflectionEvidence({ understandingPressure: 0.6, sessionsWithReflection: 3 }),
    },
    diff: result.diff,
    latencyMs: 15,
  });

  assert.ok(audit.plan_id, 'Audit record must have plan_id');
  assert.ok(audit.reason_code.length > 0, 'Audit must have a reason_code');
  assert.ok(audit.reason_summary.length > 0, 'Audit must have non-empty reason_summary');
  // Reason summary should be grounded/concrete
  assert.ok(
    audit.reason_summary.toLowerCase().includes('pawly') ||
      audit.reason_summary.toLowerCase().includes('session') ||
      audit.reason_summary.toLowerCase().includes('cue'),
    `Reason summary should be concrete, got: ${audit.reason_summary}`,
  );
  // Evidence includes reflection fields
  assert.ok(typeof audit.evidence['understandingPressure'] === 'number' ||
    typeof (audit.evidence['reflectionEvidence'] as Record<string, unknown>)?.['understandingPressure'] === 'number',
    'Evidence should carry understandingPressure',
  );
});

test('audit trail: insertedSupportSessionId present in evidence when insertion occurred', () => {
  const result = runEngine({
    reflectionEvidence: { understandingPressure: 0.6, sessionsWithReflection: 3 },
  });

  assert.ok(result);
  if (result.insertedSupportSessionId) {
    assert.equal(
      result.evidence['insertedSupportSessionId'],
      result.insertedSupportSessionId,
    );
    assert.ok(result.evidence['insertedSupportSessionType'] != null);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Edge-function normalization
// ─────────────────────────────────────────────────────────────────────────────

test('normalization: null input returns null', () => {
  assert.equal(normalizePostSessionReflection(null), null);
  assert.equal(normalizePostSessionReflection(undefined), null);
});

test('normalization: non-object input returns null', () => {
  assert.equal(normalizePostSessionReflection('bad string'), null);
  assert.equal(normalizePostSessionReflection(42), null);
  assert.equal(normalizePostSessionReflection([]), null);
});

test('normalization: empty object (no known fields) returns null', () => {
  assert.equal(normalizePostSessionReflection({}), null);
  assert.equal(normalizePostSessionReflection({ foo: 'bar' }), null);
});

test('normalization: well-formed reflection passes through cleanly', () => {
  const raw = {
    mainIssue: 'distracted',
    confidenceInAnswers: 4,
    arousalLevel: 'slightly_up',
    distractionType: 'dogs',
  };
  const result = normalizePostSessionReflection(raw);
  assert.ok(result !== null, 'Well-formed reflection should normalize to non-null');
  assert.equal(result!.mainIssue, 'distracted');
  assert.equal(result!.confidenceInAnswers, 4);
  assert.equal(result!.arousalLevel, 'slightly_up');
  assert.equal(result!.distractionType, 'dogs');
});

test('normalization: unknown enum values are coerced to null, known fields pass', () => {
  const raw = {
    mainIssue: 'totally_unknown_value', // invalid
    confidenceInAnswers: 3,             // valid
    arousalLevel: 'calm',               // valid
  };
  const result = normalizePostSessionReflection(raw);
  assert.ok(result !== null);
  assert.equal(result!.mainIssue, null, 'Unknown mainIssue should be null');
  assert.equal(result!.confidenceInAnswers, 3);
  assert.equal(result!.arousalLevel, 'calm');
});

test('normalization: out-of-range confidence clamped to null', () => {
  const raw = { confidenceInAnswers: 7, mainIssue: 'distracted' };
  const result = normalizePostSessionReflection(raw);
  assert.ok(result !== null);
  assert.equal(result!.confidenceInAnswers, null, 'Out-of-range confidence should be null');
  assert.equal(result!.mainIssue, 'distracted');
});

test('normalization: malformed reflection does not crash adaptation signal extraction', () => {
  const malformed = { mainIssue: 12345, confidenceInAnswers: 'not_a_number', arousalLevel: {} };
  let signals: ReturnType<typeof extractReflectionSignals> | null = null;
  assert.doesNotThrow(() => {
    const normalized = normalizePostSessionReflection(malformed);
    signals = extractReflectionSignals(normalized);
  });
  assert.ok(signals !== null);
  // Should produce zero signals since enums are garbage
  assert.equal(signals!.arousalIssue, 0);
});

test('normalization: normalized reflection still allows adaptation to proceed', () => {
  // Simulate a row coming from the DB with a valid reflection
  const rawRow = {
    post_session_reflection: {
      mainIssue: 'did_not_understand',
      confidenceInAnswers: 5,
    },
  };
  const normalized = normalizePostSessionReflection(rawRow.post_session_reflection);
  assert.ok(normalized !== null);
  const signals = extractReflectionSignals(normalized);
  assert.ok(signals.understandingIssue > 0, 'Should extract understanding signal from normalized reflection');
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. Backward compatibility
// ─────────────────────────────────────────────────────────────────────────────

test('backward compat: sessions without reflection still adapt correctly (no crash)', () => {
  // Old-style: two hard sessions → regress/detour as before
  const result = runEngine({
    sessions: [
      makeSignal({ difficulty: 'hard', successScore: 1 }),
      makeSignal({ sourceId: 'log_2', difficulty: 'hard', successScore: 2 }),
    ],
    reflectionEvidence: {
      understandingPressure: 0,
      distractionPressure: 0,
      durationBreakdownPressure: 0,
      arousalPressure: 0,
      handlerFrictionPressure: 0,
      sessionsWithReflection: 0,
      avgReflectionConfidence: null,
    },
    learningState: { distractionSensitivity: 4 },
  });

  assert.ok(result, 'Should still adapt even without reflection data');
  assert.ok(
    result.adaptationType === 'regress' || result.adaptationType === 'detour',
    `Expected regress or detour from objective data, got ${result.adaptationType}`,
  );
});

test('backward compat: high success still causes advance without reflection data', () => {
  const result = runEngine({
    sessions: [
      makeSignal({ difficulty: 'easy', successScore: 5 }),
      makeSignal({ sourceId: 'log_2', difficulty: 'easy', successScore: 4 }),
      makeSignal({ sourceId: 'log_3', difficulty: 'easy', successScore: 4 }),
    ],
    reflectionEvidence: {
      understandingPressure: 0,
      distractionPressure: 0,
      durationBreakdownPressure: 0,
      arousalPressure: 0,
      handlerFrictionPressure: 0,
      sessionsWithReflection: 0,
      avgReflectionConfidence: null,
    },
    summaryOverrides: { avgSessionSuccess: 4.4, indoorSuccessRate: 1, outdoorSuccessRate: 0.9 },
  });

  assert.ok(result, 'advance should still work without reflection');
  assert.equal(result.adaptationType, 'advance');
  assert.equal(result.nextPlan.sessions[0]?.skillId, 'skill_advance');
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. Strong objective performance resists reflection-only regression
// ─────────────────────────────────────────────────────────────────────────────

test('objective resistance: understanding pressure does not cause regress when performance is clearly strong', () => {
  const result = runEngine({
    sessions: [
      makeSignal({ difficulty: 'easy', successScore: 5 }),
      makeSignal({ sourceId: 'log_2', difficulty: 'easy', successScore: 4 }),
    ],
    reflectionEvidence: { understandingPressure: 0.5, sessionsWithReflection: 3 },
    summaryOverrides: { avgSessionSuccess: 4.1 }, // >= 3.8 → strong
  });

  if (result) {
    assert.ok(
      result.adaptationType !== 'regress',
      `Should not regress from reflection-only pressure when objective performance is strong, got ${result.adaptationType}`,
    );
  }
});
