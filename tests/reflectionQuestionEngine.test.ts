// ─────────────────────────────────────────────────────────────────────────────
// Reflection Question Engine Tests
//
// Verifies that buildPostSessionReflectionQuestions returns the correct
// question set for each scenario described in the product spec.
//
// Run with: node --experimental-strip-types tests/reflectionQuestionEngine.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPostSessionReflectionQuestions } from '../lib/adaptivePlanning/reflectionQuestionEngine.ts';
import type {
  ReflectionQuestionEngineInput,
  RecentSessionSummary,
  ReflectionLearningStateSnapshot,
} from '../lib/adaptivePlanning/reflectionQuestionTypes.ts';
import type { ReflectionQuestionId } from '../types/index.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function ids(questions: { id: ReflectionQuestionId }[]): ReflectionQuestionId[] {
  return questions.map((q) => q.id);
}

function makeSession(overrides: Partial<RecentSessionSummary> = {}): RecentSessionSummary {
  return {
    status: 'completed',
    difficulty: 'okay',
    successScore: 4,
    environmentTag: 'indoors_low_distraction',
    sessionKind: 'core',
    skillId: 'settle_s1',
    ...overrides,
  };
}

const NEUTRAL_STATE: ReflectionLearningStateSnapshot = {
  distractionSensitivity: 3,
  handlerConsistencyScore: 3,
  confidenceScore: 3,
  inconsistencyIndex: 0.1,
};

function makeInput(overrides: Partial<ReflectionQuestionEngineInput> = {}): ReflectionQuestionEngineInput {
  return {
    difficulty: 'okay',
    sessionStatus: 'completed',
    durationSeconds: 420,
    protocolId: 'settle_s1',
    skillId: 'settle_s1',
    environmentTag: 'indoors_low_distraction',
    recentSessions: [],
    learningState: NEUTRAL_STATE,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 1 — Easy successful session
// ─────────────────────────────────────────────────────────────────────────────

test('easy successful session: returns only overallExpectation (no recent trouble)', () => {
  const input = makeInput({
    difficulty: 'easy',
    recentSessions: [
      makeSession({ difficulty: 'easy', successScore: 5 }),
      makeSession({ difficulty: 'easy', successScore: 5 }),
      makeSession({ difficulty: 'easy', successScore: 4 }),
    ],
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.deepEqual(result, ['overallExpectation']);
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 2 — Normal stable session
// ─────────────────────────────────────────────────────────────────────────────

test('normal stable session: returns [overallExpectation, mainIssue] in order', () => {
  const input = makeInput({
    difficulty: 'okay',
    recentSessions: [makeSession(), makeSession()],
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.equal(result[0], 'overallExpectation');
  assert.equal(result[1], 'mainIssue');
  // No dynamic follow-ups for a clean, stable, okay session
  assert.ok(!result.includes('failureTiming'));
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 3 — Hard session
// ─────────────────────────────────────────────────────────────────────────────

test('hard session: includes failureTiming', () => {
  const input = makeInput({ difficulty: 'hard' });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('failureTiming'), `Expected failureTiming in [${result}]`);
});

test('hard session: overallExpectation and mainIssue come before failureTiming', () => {
  const input = makeInput({ difficulty: 'hard' });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.indexOf('overallExpectation') < result.indexOf('failureTiming'));
  assert.ok(result.indexOf('mainIssue') < result.indexOf('failureTiming'));
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 4 — Abandoned session
// ─────────────────────────────────────────────────────────────────────────────

test('abandoned session: includes failureTiming', () => {
  const input = makeInput({ sessionStatus: 'abandoned', difficulty: 'hard' });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('failureTiming'));
});

test('abandoned session: includes confidenceInAnswers', () => {
  const input = makeInput({ sessionStatus: 'abandoned', difficulty: 'hard' });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('confidenceInAnswers'), `Expected confidenceInAnswers in [${result}]`);
});

test('abandoned session: confidenceInAnswers is last', () => {
  const input = makeInput({ sessionStatus: 'abandoned', difficulty: 'hard' });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.equal(result[result.length - 1], 'confidenceInAnswers');
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 5 — Distraction-pattern session
// ─────────────────────────────────────────────────────────────────────────────

test('elevated distractionSensitivity: includes distractionType', () => {
  const input = makeInput({
    difficulty: 'hard',
    learningState: { ...NEUTRAL_STATE, distractionSensitivity: 4 },
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('distractionType'), `Expected distractionType in [${result}]`);
});

test('multiple hard outdoor sessions: includes distractionType', () => {
  const input = makeInput({
    difficulty: 'hard',
    environmentTag: 'outdoors_high_distraction',
    recentSessions: [
      makeSession({ environmentTag: 'outdoors_high_distraction', successScore: 1 }),
      makeSession({ environmentTag: 'outdoors_high_distraction', successScore: 2 }),
    ],
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('distractionType'), `Expected distractionType in [${result}]`);
});

test('indoor-outdoor inconsistency: includes distractionType', () => {
  const input = makeInput({
    difficulty: 'okay',
    recentSessions: [
      makeSession({ environmentTag: 'indoors_low_distraction', successScore: 5 }),
      makeSession({ environmentTag: 'indoors_low_distraction', successScore: 5 }),
      makeSession({ environmentTag: 'outdoors_low_distraction', successScore: 2 }),
      makeSession({ environmentTag: 'outdoors_low_distraction', successScore: 2 }),
    ],
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('distractionType'), `Expected distractionType in [${result}]`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 6 — Repeated low-success / never-stabilized pattern
// ─────────────────────────────────────────────────────────────────────────────

test('repeated low-success on same skill: includes cueUnderstanding', () => {
  const input = makeInput({
    difficulty: 'hard',
    skillId: 'settle_s1',
    recentSessions: [
      makeSession({ skillId: 'settle_s1', successScore: 2 }),
      makeSession({ skillId: 'settle_s1', successScore: 1 }),
    ],
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('cueUnderstanding'), `Expected cueUnderstanding in [${result}]`);
});

test('failed early (very short + hard): includes cueUnderstanding', () => {
  const input = makeInput({
    difficulty: 'hard',
    durationSeconds: 80, // Under 2 minutes
    recentSessions: [],
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('cueUnderstanding'), `Expected cueUnderstanding in [${result}]`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 7 — Over-excitement pattern
// ─────────────────────────────────────────────────────────────────────────────

test('repeated abandoned/hard sessions: includes arousalLevel', () => {
  const input = makeInput({
    difficulty: 'hard',
    recentSessions: [
      makeSession({ status: 'abandoned', difficulty: 'hard' }),
      makeSession({ status: 'abandoned', difficulty: 'hard' }),
      makeSession({ difficulty: 'hard' }),
    ],
    // No distraction sensitivity, no skill match — should surface arousal
    learningState: { ...NEUTRAL_STATE, distractionSensitivity: 2 },
    skillId: 'unique_skill_xyz',
    protocolId: 'unique_skill_xyz',
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('arousalLevel'), `Expected arousalLevel in [${result}]`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 8 — Handler inconsistency pattern
// ─────────────────────────────────────────────────────────────────────────────

test('low handlerConsistencyScore: includes handlerIssue', () => {
  const input = makeInput({
    difficulty: 'hard',
    learningState: { ...NEUTRAL_STATE, handlerConsistencyScore: 2, distractionSensitivity: 2 },
    // No arousal pattern, no skill match
    recentSessions: [makeSession(), makeSession()],
    skillId: 'unique_handler_skill',
    protocolId: 'unique_handler_skill',
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('handlerIssue'), `Expected handlerIssue in [${result}]`);
});

test('high inconsistencyIndex: includes handlerIssue', () => {
  const input = makeInput({
    difficulty: 'hard',
    learningState: { ...NEUTRAL_STATE, handlerConsistencyScore: 3, inconsistencyIndex: 0.45, distractionSensitivity: 2 },
    recentSessions: [makeSession(), makeSession()],
    skillId: 'unique_inc_skill',
    protocolId: 'unique_inc_skill',
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('handlerIssue'), `Expected handlerIssue in [${result}]`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 9 — Ambiguous mixed-signal case
// ─────────────────────────────────────────────────────────────────────────────

test('mixed recent scores: includes confidenceInAnswers', () => {
  const input = makeInput({
    difficulty: 'okay',
    recentSessions: [
      makeSession({ successScore: 5 }),
      makeSession({ successScore: 1 }),
      makeSession({ successScore: 5 }),
      makeSession({ successScore: 2 }),
    ],
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.ok(result.includes('confidenceInAnswers'), `Expected confidenceInAnswers in [${result}]`);
});

test('mixed signals: confidenceInAnswers is last', () => {
  const input = makeInput({
    difficulty: 'okay',
    recentSessions: [
      makeSession({ successScore: 5 }),
      makeSession({ successScore: 1 }),
      makeSession({ successScore: 5 }),
      makeSession({ successScore: 2 }),
    ],
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  assert.equal(result[result.length - 1], 'confidenceInAnswers');
});

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 10 — Total question count stays bounded
// ─────────────────────────────────────────────────────────────────────────────

test('question count does not exceed 4 for a normal hard session', () => {
  const input = makeInput({
    difficulty: 'hard',
    recentSessions: [makeSession({ difficulty: 'hard' }), makeSession()],
  });
  const result = buildPostSessionReflectionQuestions(input);
  assert.ok(result.length <= 4, `Expected ≤ 4 questions, got ${result.length}: [${ids(result)}]`);
});

test('question count does not exceed 4 for worst-case scenario', () => {
  // Abandoned + elevated distraction + mixed signals + handler issues
  const input = makeInput({
    difficulty: 'hard',
    sessionStatus: 'abandoned',
    durationSeconds: 60,
    learningState: {
      distractionSensitivity: 5,
      handlerConsistencyScore: 1,
      confidenceScore: 2,
      inconsistencyIndex: 0.5,
    },
    recentSessions: [
      makeSession({ status: 'abandoned', successScore: 1 }),
      makeSession({ status: 'abandoned', successScore: 1 }),
      makeSession({ successScore: 4 }),
    ],
  });
  const result = buildPostSessionReflectionQuestions(input);
  assert.ok(result.length <= 4, `Expected ≤ 4 questions, got ${result.length}: [${ids(result)}]`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Ordering invariants
// ─────────────────────────────────────────────────────────────────────────────

test('overallExpectation is always first', () => {
  const inputs = [
    makeInput({ difficulty: 'easy' }),
    makeInput({ difficulty: 'hard' }),
    makeInput({ sessionStatus: 'abandoned' }),
  ];
  for (const input of inputs) {
    const result = ids(buildPostSessionReflectionQuestions(input));
    assert.equal(result[0], 'overallExpectation', `First question should be overallExpectation, got [${result}]`);
  }
});

test('confidenceInAnswers never appears before mainIssue when both present', () => {
  const input = makeInput({
    sessionStatus: 'abandoned',
    difficulty: 'hard',
  });
  const result = ids(buildPostSessionReflectionQuestions(input));
  const ciIdx = result.indexOf('confidenceInAnswers');
  const miIdx = result.indexOf('mainIssue');
  if (ciIdx !== -1 && miIdx !== -1) {
    assert.ok(miIdx < ciIdx, `mainIssue (${miIdx}) should come before confidenceInAnswers (${ciIdx})`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// No duplicate questions
// ─────────────────────────────────────────────────────────────────────────────

test('no duplicate question IDs in any output', () => {
  const inputs = [
    makeInput({ difficulty: 'easy' }),
    makeInput({ difficulty: 'hard', sessionStatus: 'abandoned' }),
    makeInput({
      difficulty: 'hard',
      learningState: { ...NEUTRAL_STATE, distractionSensitivity: 5, handlerConsistencyScore: 1 },
      recentSessions: [
        makeSession({ status: 'abandoned' }),
        makeSession({ successScore: 5 }),
        makeSession({ successScore: 1 }),
      ],
    }),
  ];
  for (const input of inputs) {
    const result = ids(buildPostSessionReflectionQuestions(input));
    const unique = new Set(result);
    assert.equal(unique.size, result.length, `Duplicate IDs in [${result}]`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Null / missing learningState is handled gracefully
// ─────────────────────────────────────────────────────────────────────────────

test('null learningState: still returns core questions without throwing', () => {
  const input = makeInput({ learningState: null, difficulty: 'okay' });
  const result = buildPostSessionReflectionQuestions(input);
  assert.ok(result.length >= 1);
  assert.equal(result[0].id, 'overallExpectation');
});

test('empty recentSessions: still returns core questions without throwing', () => {
  const input = makeInput({ recentSessions: [], difficulty: 'hard' });
  const result = buildPostSessionReflectionQuestions(input);
  assert.ok(result.length >= 2);
});

// ─────────────────────────────────────────────────────────────────────────────
// Catalog content sanity checks
// ─────────────────────────────────────────────────────────────────────────────

test('all single_select questions have at least 2 options', () => {
  const allInputs = [
    makeInput({ difficulty: 'hard', sessionStatus: 'abandoned' }),
  ];
  for (const input of allInputs) {
    const questions = buildPostSessionReflectionQuestions(input);
    for (const q of questions) {
      if (q.answerType === 'single_select') {
        assert.ok(
          q.options && q.options.length >= 2,
          `Question ${q.id} should have ≥ 2 options`,
        );
      }
    }
  }
});

test('scale question has scaleMin and scaleMax defined', () => {
  // Force confidenceInAnswers to appear
  const input = makeInput({ sessionStatus: 'abandoned' });
  const questions = buildPostSessionReflectionQuestions(input);
  const scaleQ = questions.find((q) => q.id === 'confidenceInAnswers');
  if (scaleQ) {
    assert.equal(scaleQ.answerType, 'scale');
    assert.ok(typeof scaleQ.scaleMin === 'number');
    assert.ok(typeof scaleQ.scaleMax === 'number');
    assert.ok((scaleQ.scaleMax ?? 0) > (scaleQ.scaleMin ?? 0));
  }
});
