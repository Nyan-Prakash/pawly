import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validatePlannerOutput, parsePlannerJSON } from '../lib/adaptivePlanning/planValidation.ts';
import { buildSkillGraph } from '../lib/adaptivePlanning/skillGraph.ts';
import type { SkillNode, SkillEdge, AIPlannerOutput } from '../types';

// ─── Test Fixtures ──────────────────────────────────────────────────────────

function makeNode(overrides: Partial<SkillNode> & { id: string }): SkillNode {
  return {
    behavior: 'recall',
    skillCode: overrides.id,
    title: overrides.id,
    description: null,
    stage: 1,
    difficulty: 1,
    kind: 'foundation',
    protocolId: `proto_${overrides.id}`,
    metadata: {},
    isActive: true,
    ...overrides,
  };
}

function makeEdge(from: string, to: string, edgeType: SkillEdge['edgeType'] = 'advance'): SkillEdge {
  return {
    id: `${from}_${to}`,
    fromSkillId: from,
    toSkillId: to,
    edgeType,
    conditionSummary: null,
    metadata: {},
  };
}

const testNodes: SkillNode[] = [
  makeNode({ id: 'skill_a', stage: 1, difficulty: 1, kind: 'foundation' }),
  makeNode({ id: 'skill_b', stage: 1, difficulty: 2, kind: 'foundation' }),
  makeNode({ id: 'skill_c', stage: 2, difficulty: 3, kind: 'core' }),
  makeNode({ id: 'skill_d', stage: 3, difficulty: 4, kind: 'proofing', protocolId: null }),
  makeNode({ id: 'skill_recovery', stage: 1, difficulty: 1, kind: 'recovery' }),
];

const testEdges: SkillEdge[] = [
  makeEdge('skill_a', 'skill_b', 'advance'),
  makeEdge('skill_b', 'skill_c', 'advance'),
  makeEdge('skill_c', 'skill_d', 'advance'),
  makeEdge('skill_a', 'skill_c', 'prerequisite'),
];

const testGraph = buildSkillGraph(testNodes, testEdges);

function makeValidOutput(overrides?: Partial<AIPlannerOutput>): AIPlannerOutput {
  return {
    primaryGoal: 'recall',
    startingSkillId: 'skill_a',
    planHorizonWeeks: 2,
    sessionsPerWeek: 3,
    weeklyStructure: [
      {
        weekNumber: 1,
        focus: 'foundation',
        skillSequence: [
          { skillId: 'skill_a', sessionCount: 2, environment: 'indoors_low_distraction', sessionKind: 'core', reasoningLabel: 'Start with basics' },
          { skillId: 'skill_b', sessionCount: 1, environment: 'indoors_low_distraction', sessionKind: 'core', reasoningLabel: 'Build on attention' },
        ],
      },
      {
        weekNumber: 2,
        focus: 'building',
        skillSequence: [
          { skillId: 'skill_b', sessionCount: 1, environment: 'indoors_moderate_distraction', sessionKind: 'repeat', reasoningLabel: 'Reinforce' },
          { skillId: 'skill_c', sessionCount: 2, environment: 'outdoors_low_distraction', sessionKind: 'core', reasoningLabel: 'Progress to core' },
        ],
      },
    ],
    planningSummary: {
      whyThisStart: 'Foundation first',
      keyAssumptions: ['Dog has no prior training'],
      risksToWatch: ['Low motivation'],
    },
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('parsePlannerJSON', () => {
  it('parses valid JSON', () => {
    const { parsed, error } = parsePlannerJSON(JSON.stringify(makeValidOutput()));
    assert.strictEqual(error, null);
    assert.ok(parsed);
    assert.strictEqual(parsed!.primaryGoal, 'recall');
  });

  it('strips markdown fences', () => {
    const raw = '```json\n' + JSON.stringify(makeValidOutput()) + '\n```';
    const { parsed, error } = parsePlannerJSON(raw);
    assert.strictEqual(error, null);
    assert.ok(parsed);
  });

  it('returns error for invalid JSON', () => {
    const { parsed, error } = parsePlannerJSON('not json');
    assert.strictEqual(parsed, null);
    assert.ok(error?.includes('Invalid JSON'));
  });
});

describe('validatePlannerOutput', () => {
  it('accepts valid AI output', () => {
    const errors = validatePlannerOutput(makeValidOutput(), testGraph, 3, 4);
    assert.strictEqual(errors.length, 0);
  });

  it('rejects invented skillId', () => {
    const output = makeValidOutput();
    output.weeklyStructure[0].skillSequence[0].skillId = 'invented_skill';
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.message.includes('invented_skill')));
  });

  it('rejects missing prerequisite ordering', () => {
    // skill_c requires skill_a as prerequisite
    // Schedule skill_c before skill_a
    const output = makeValidOutput({
      weeklyStructure: [
        {
          weekNumber: 1,
          focus: 'wrong order',
          skillSequence: [
            { skillId: 'skill_c', sessionCount: 2, environment: 'indoors_low_distraction', sessionKind: 'core', reasoningLabel: 'Skipping prereq' },
            { skillId: 'skill_a', sessionCount: 1, environment: 'indoors_low_distraction', sessionKind: 'core', reasoningLabel: 'Too late' },
          ],
        },
        {
          weekNumber: 2,
          focus: 'building',
          skillSequence: [
            { skillId: 'skill_b', sessionCount: 3, environment: 'indoors_low_distraction', sessionKind: 'core', reasoningLabel: 'Fill' },
          ],
        },
      ],
    });
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.field === 'prerequisiteOrdering'));
  });

  it('rejects invalid session count', () => {
    const output = makeValidOutput();
    output.weeklyStructure[0].skillSequence[0].sessionCount = 10;
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.message.includes('sessionCount')));
  });

  it('rejects wrong total sessions per week', () => {
    const output = makeValidOutput();
    // Make week 1 have 4 sessions instead of 3
    output.weeklyStructure[0].skillSequence[0].sessionCount = 3;
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.message.includes('sessions, expected 3')));
  });

  it('rejects recovery nodes in initial plans', () => {
    const output = makeValidOutput();
    output.weeklyStructure[0].skillSequence[0].skillId = 'skill_recovery';
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.message.includes('recovery')));
  });

  it('rejects invalid environment', () => {
    const output = makeValidOutput();
    output.weeklyStructure[0].skillSequence[0].environment = 'moon_base' as any;
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.message.includes('Invalid environment')));
  });

  it('rejects invalid sessionKind', () => {
    const output = makeValidOutput();
    output.weeklyStructure[0].skillSequence[0].sessionKind = 'freestyle' as any;
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.message.includes('Invalid sessionKind')));
  });

  it('rejects planHorizonWeeks > max', () => {
    const output = makeValidOutput({ planHorizonWeeks: 8 });
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.field === 'planHorizonWeeks'));
  });

  it('rejects non-object input', () => {
    const errors = validatePlannerOutput(null, testGraph, 3, 4);
    assert.ok(errors.some((e) => e.message.includes('JSON object')));
  });

  it('accepts proofing nodes without protocolId', () => {
    const output = makeValidOutput();
    // skill_d is proofing with null protocolId — should be accepted
    output.weeklyStructure[1].skillSequence = [
      { skillId: 'skill_c', sessionCount: 1, environment: 'outdoors_low_distraction', sessionKind: 'core', reasoningLabel: 'Core work' },
      { skillId: 'skill_d', sessionCount: 2, environment: 'outdoors_moderate_distraction', sessionKind: 'proofing', reasoningLabel: 'Proofing' },
    ];
    const errors = validatePlannerOutput(output, testGraph, 3, 4);
    assert.strictEqual(errors.filter((e) => e.message.includes('no protocol')).length, 0);
  });
});

describe('rules-based fallback', () => {
  it('generatePlan produces a valid plan', () => {
    // Dynamic import to avoid module resolution issues in test
    const { generatePlan } = require('../lib/planGenerator');
    const dog = {
      id: 'test-dog',
      ownerId: 'test-owner',
      name: 'Buddy',
      breed: 'Labrador',
      breedGroup: '',
      ageMonths: 12,
      sex: 'male' as const,
      neutered: true,
      environmentType: 'house_yard' as const,
      behaviorGoals: ['Leash Pulling'],
      trainingExperience: 'none' as const,
      equipment: [],
      availableDaysPerWeek: 3,
      availableMinutesPerDay: 10,
      preferredTrainingDays: ['tuesday', 'thursday', 'saturday'] as any,
      preferredTrainingWindows: {},
      preferredTrainingTimes: {},
      usualWalkTimes: [],
      sessionStyle: 'balanced' as const,
      scheduleFlexibility: 'move_next_slot' as const,
      scheduleIntensity: 'balanced' as const,
      blockedDays: [],
      blockedDates: [],
      scheduleNotes: null,
      scheduleVersion: 1,
      timezone: 'UTC',
      lifecycleStage: 'adolescent',
      createdAt: new Date().toISOString(),
    };

    const plan = generatePlan(dog);
    assert.ok(plan.sessions.length > 0);
    assert.strictEqual(plan.durationWeeks, 4);
    assert.strictEqual(plan.sessionsPerWeek, 3);
    assert.strictEqual(plan.status, 'active');
  });
});
