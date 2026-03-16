import test from 'node:test';
import assert from 'node:assert/strict';

import type { DogLearningState, Plan, PlanAdaptation, SkillEdge, SkillNode } from '../types/index.ts';
import { runAdaptationEngine } from '../lib/adaptivePlanning/adaptationEngine.ts';
import { buildAdaptationAuditRecord } from '../lib/adaptivePlanning/adaptationAudit.ts';
import { didUpcomingScheduleChange } from '../lib/planScheduleDiff.ts';
import type { AggregatedRecentSignals, SessionLearningSignal, WalkLearningSignal } from '../lib/adaptivePlanning/learningSignals.ts';

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
    title: 'Current Skill',
    durationMinutes: 10,
    isCompleted: false,
    scheduledDate: `2026-03-1${index}`,
    scheduledTime: '19:00',
    scheduledDay: 'monday',
    skillId: 'skill_current',
    environment: 'outdoors_low_distraction',
    sessionKind: 'core',
    adaptationSource: 'initial_plan',
    reasoningLabel: null,
    ...overrides,
  };
}

function makePlan(sessions: Plan['sessions']): Plan {
  return {
    id: 'plan_1',
    dogId: 'dog_1',
    goal: "Won't Come",
    status: 'active',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    currentWeek: 1,
    currentStage: 'Stage 2 — Core',
    sessions,
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

function makeSignal(overrides: Partial<SessionLearningSignal>): SessionLearningSignal {
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
    environmentTag: 'outdoors_low_distraction',
    stepCompletionRate: 1,
    repCountAverage: 5,
    focusDemand: 'moderate',
    notesFlags: {
      distracted: false,
      tired: false,
      confident: false,
      frustrated: false,
      handlerTimingIssue: false,
      motivated: false,
      outdoors: true,
    },
    similarityKey: 'skill_current:outdoors_low_distraction',
    isRecoverySession: false,
    ...overrides,
  };
}

function makeAggregatedSignals(overrides: Partial<AggregatedRecentSignals['summary']> = {}): AggregatedRecentSignals {
  return {
    asOf: new Date().toISOString(),
    sessions: [],
    walks: [],
    plan: {
      id: 'plan_1',
      behaviorGoal: 'recall',
      currentStage: 2,
      scheduleIntensity: 'balanced',
    },
    summary: {
      sessionCount: 3,
      completedCount: 3,
      abandonedCount: 0,
      hardSessionCount: 0,
      hardOutdoorCount: 0,
      proofingCount: 0,
      easySuccessStreak: 0,
      avgSessionSuccess: 3,
      avgSessionDurationMinutes: 10,
      longSessionCount: 0,
      abandonmentRate: 0,
      indoorSuccessRate: 1,
      outdoorSuccessRate: 0.3,
      lowDistractionSuccessRate: 0.4,
      inconsistencyIndex: 0,
      recoverySessionCount: 0,
      recoveryBounceRate: 0,
      poorWalkCount: 0,
      goodWalkCount: 0,
      walkQualityAvg: 2,
      walkQualityDelta: 0,
      motivationDropInLongSessions: false,
      notableEnvironmentDeltas: {},
      warnings: [],
      ...overrides,
    },
  };
}

function makeWalks(): WalkLearningSignal[] {
  return [];
}

function runEngine(params: {
  sessions: SessionLearningSignal[];
  summary?: Partial<AggregatedRecentSignals['summary']>;
  learningState?: Partial<DogLearningState>;
  adaptations?: PlanAdaptation[];
  plan?: Plan;
}) {
  const nodes = [
    makeNode({ id: 'skill_current', stage: 2, kind: 'core', title: 'Current Skill', protocolId: 'protocol_current' }),
    makeNode({ id: 'skill_advance', stage: 3, kind: 'core', title: 'Advance Skill', protocolId: 'protocol_advance' }),
    makeNode({ id: 'skill_regress', stage: 1, kind: 'foundation', title: 'Regress Skill', protocolId: 'protocol_regress' }),
    makeNode({ id: 'skill_detour', stage: 1, kind: 'foundation', title: 'Detour Skill', protocolId: 'protocol_detour' }),
  ];
  const edges = [
    makeEdge('skill_current', 'skill_advance', 'advance'),
    makeEdge('skill_current', 'skill_regress', 'regress'),
    makeEdge('skill_current', 'skill_detour', 'detour'),
  ];

  return runAdaptationEngine({
    plan:
      params.plan ??
      makePlan([
        makePlanSession(1),
        makePlanSession(2),
        makePlanSession(3),
        makePlanSession(4),
        makePlanSession(5),
        makePlanSession(6),
      ]),
    nodes,
    edges,
    learningState: makeLearningState(params.learningState),
    aggregatedSignals: makeAggregatedSignals(params.summary),
    recentSessions: params.sessions,
    recentWalks: makeWalks(),
    recentAdaptations: params.adaptations ?? [],
    now: '2026-03-14T12:00:00.000Z',
  });
}

test('two hard sessions cause a regress or detour', () => {
  const result = runEngine({
    sessions: [
      makeSignal({ difficulty: 'hard', successScore: 1 }),
      makeSignal({ sourceId: 'log_2', difficulty: 'hard', successScore: 2 }),
      makeSignal({ sourceId: 'log_3', difficulty: 'okay', successScore: 3 }),
    ],
    learningState: { distractionSensitivity: 4 },
  });

  assert.ok(result);
  assert.equal(result.applied, true);
  assert.ok(result.adaptationType === 'detour' || result.adaptationType === 'regress');
});

test('high success causes advance', () => {
  const result = runEngine({
    sessions: [
      makeSignal({ difficulty: 'easy', successScore: 5, environmentTag: 'indoors_low_distraction' }),
      makeSignal({ sourceId: 'log_2', difficulty: 'easy', successScore: 4, environmentTag: 'indoors_low_distraction' }),
      makeSignal({ sourceId: 'log_3', difficulty: 'easy', successScore: 4, environmentTag: 'indoors_low_distraction' }),
    ],
    summary: { avgSessionSuccess: 4.4, indoorSuccessRate: 1, outdoorSuccessRate: 0.9 },
  });

  assert.ok(result);
  assert.equal(result.adaptationType, 'advance');
  assert.equal(result.nextPlan.sessions[0]?.skillId, 'skill_advance');
});

test('outdoor failure causes environment adjustment instead of broad regression', () => {
  const result = runEngine({
    sessions: [
      makeSignal({ successScore: 1, difficulty: 'hard', environmentTag: 'outdoors_low_distraction' }),
      makeSignal({ sourceId: 'log_2', successScore: 2, difficulty: 'hard', environmentTag: 'outdoors_low_distraction' }),
      makeSignal({ sourceId: 'log_3', successScore: 5, difficulty: 'easy', environmentTag: 'indoors_low_distraction' }),
    ],
    summary: { indoorSuccessRate: 1, outdoorSuccessRate: 0.2, hardOutdoorCount: 2 },
  });

  assert.ok(result);
  assert.equal(result.adaptationType, 'environment_adjustment');
  assert.equal(result.nextPlan.sessions[0]?.environment, 'indoors_low_distraction');
});

test('only the next 3-5 sessions are eligible for mutation and completed sessions remain untouched', () => {
  const plan = makePlan([
    makePlanSession(1, { isCompleted: true, title: 'Completed Session', scheduledDate: '2026-03-10' }),
    makePlanSession(2),
    makePlanSession(3),
    makePlanSession(4),
    makePlanSession(5),
    makePlanSession(6),
  ]);

  const result = runEngine({
    plan,
    sessions: [
      makeSignal({ difficulty: 'hard', successScore: 1 }),
      makeSignal({ sourceId: 'log_2', difficulty: 'hard', successScore: 1 }),
      makeSignal({ sourceId: 'log_3', difficulty: 'okay', successScore: 2 }),
    ],
  });

  assert.ok(result);
  assert.equal(result.nextPlan.sessions[0]?.title, 'Completed Session');
  assert.ok(result.diff.changedSessionIds.length <= 5);
  assert.equal(result.nextPlan.sessions[5]?.title, 'Current Skill');
});

test('plan adaptation audit payload includes required fields', () => {
  const result = runEngine({
    sessions: [
      makeSignal({ difficulty: 'easy', successScore: 5, environmentTag: 'indoors_low_distraction' }),
      makeSignal({ sourceId: 'log_2', difficulty: 'easy', successScore: 4, environmentTag: 'indoors_low_distraction' }),
      makeSignal({ sourceId: 'log_3', difficulty: 'easy', successScore: 4, environmentTag: 'indoors_low_distraction' }),
    ],
    summary: { avgSessionSuccess: 4.4, indoorSuccessRate: 1, outdoorSuccessRate: 0.9 },
  });

  assert.ok(result);
  const audit = buildAdaptationAuditRecord({
    dogId: 'dog_1',
    plan: result.nextPlan,
    triggeredBySessionLogId: 'log_1',
    adaptationType: result.adaptationType,
    status: 'applied',
    reasonCode: result.reasonCode,
    reasonSummary: result.reasonSummary,
    evidence: result.evidence,
    diff: result.diff,
    latencyMs: 12,
  });

  assert.equal(audit.plan_id, 'plan_1');
  assert.equal(audit.triggered_by_session_log_id, 'log_1');
  assert.ok(audit.changed_session_ids.length > 0);
  assert.ok(audit.changed_fields.length > 0);
});

test('notification rescheduling detector triggers when dates change', () => {
  const basePlan = makePlan([makePlanSession(1), makePlanSession(2), makePlanSession(3)]);
  const shiftedPlan = makePlan([
    makePlanSession(1, { scheduledDate: '2026-03-15' }),
    makePlanSession(2),
    makePlanSession(3),
  ]);

  assert.equal(didUpcomingScheduleChange(basePlan, shiftedPlan), true);
  assert.equal(didUpcomingScheduleChange(basePlan, basePlan), false);
});
