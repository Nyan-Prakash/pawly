// ─────────────────────────────────────────────────────────────────────────────
// Post-Session Reflection UI Logic Tests
//
// Tests the pure logic extracted from PostSessionReflectionCard:
//   - getAnswerValue reads the correct field for each question ID
//   - applyReflectionAnswer updates the correct field without mutating
//   - areRequiredQuestionsAnswered blocks save until required fields filled
//   - makeEmptyReflection returns a blank object
//   - submit payload includes postSessionReflection when questions are shown
//   - fallback: submit payload includes null when no questions were generated
//
// These are pure logic tests — no React or native module imports.
// Run with: node --experimental-strip-types tests/postSessionReflectionUI.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAnswerValue,
  applyReflectionAnswer,
  areRequiredQuestionsAnswered,
  makeEmptyReflection,
} from '../lib/reflectionAnswerHelpers.ts';
import type { PostSessionReflection, ReflectionQuestionId } from '../types/index.ts';
import type { ReflectionQuestionConfig } from '../lib/adaptivePlanning/reflectionQuestionTypes.ts';
import { buildPostSessionReflectionQuestions } from '../lib/adaptivePlanning/reflectionQuestionEngine.ts';
import type { SaveSessionParams } from '../lib/sessionManager.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeFullAnswers(): PostSessionReflection {
  return {
    overallExpectation:  'worse_than_expected',
    mainIssue:           'distracted',
    failureTiming:       'immediately',
    distractionType:     'dogs',
    cueUnderstanding:    'not_yet',
    arousalLevel:        'very_up',
    handlerIssue:        null,
    confidenceInAnswers: 4,
    freeformNote:        null,
  };
}

function makeRequiredOnlyConfig(ids: ReflectionQuestionId[]): ReflectionQuestionConfig[] {
  return ids.map((id, i) => ({
    id,
    prompt: `Question ${i + 1}`,
    answerType: 'single_select' as const,
    options: [{ value: 'option_a', label: 'Option A' }],
    required: true,
    helperText: null,
  }));
}

function makeOptionalConfig(id: ReflectionQuestionId): ReflectionQuestionConfig {
  return {
    id,
    prompt: 'Optional question',
    answerType: 'single_select' as const,
    options: [{ value: 'option_a', label: 'Option A' }],
    required: false,
    helperText: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getAnswerValue — field mapping
// ─────────────────────────────────────────────────────────────────────────────

test('getAnswerValue: reads overallExpectation correctly', () => {
  const answers = { ...makeEmptyReflection(), overallExpectation: 'as_expected' as const };
  assert.equal(getAnswerValue(answers, 'overallExpectation'), 'as_expected');
});

test('getAnswerValue: reads mainIssue correctly', () => {
  const answers = { ...makeEmptyReflection(), mainIssue: 'distracted' as const };
  assert.equal(getAnswerValue(answers, 'mainIssue'), 'distracted');
});

test('getAnswerValue: reads failureTiming correctly', () => {
  const answers = { ...makeEmptyReflection(), failureTiming: 'midway' as const };
  assert.equal(getAnswerValue(answers, 'failureTiming'), 'midway');
});

test('getAnswerValue: reads distractionType correctly', () => {
  const answers = { ...makeEmptyReflection(), distractionType: 'dogs' as const };
  assert.equal(getAnswerValue(answers, 'distractionType'), 'dogs');
});

test('getAnswerValue: reads cueUnderstanding correctly', () => {
  const answers = { ...makeEmptyReflection(), cueUnderstanding: 'not_yet' as const };
  assert.equal(getAnswerValue(answers, 'cueUnderstanding'), 'not_yet');
});

test('getAnswerValue: reads arousalLevel correctly', () => {
  const answers = { ...makeEmptyReflection(), arousalLevel: 'very_up' as const };
  assert.equal(getAnswerValue(answers, 'arousalLevel'), 'very_up');
});

test('getAnswerValue: reads handlerIssue correctly', () => {
  const answers = { ...makeEmptyReflection(), handlerIssue: 'timing_rewards' as const };
  assert.equal(getAnswerValue(answers, 'handlerIssue'), 'timing_rewards');
});

test('getAnswerValue: reads confidenceInAnswers correctly', () => {
  const answers = { ...makeEmptyReflection(), confidenceInAnswers: 3 as const };
  assert.equal(getAnswerValue(answers, 'confidenceInAnswers'), 3);
});

test('getAnswerValue: returns null for unanswered fields', () => {
  const answers = makeEmptyReflection();
  assert.equal(getAnswerValue(answers, 'overallExpectation'), null);
  assert.equal(getAnswerValue(answers, 'mainIssue'), null);
  assert.equal(getAnswerValue(answers, 'confidenceInAnswers'), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// applyReflectionAnswer — immutable field update
// ─────────────────────────────────────────────────────────────────────────────

test('applyReflectionAnswer: updates overallExpectation without mutating original', () => {
  const original = makeEmptyReflection();
  const updated = applyReflectionAnswer(original, 'overallExpectation', 'better_than_expected');
  assert.equal(updated.overallExpectation, 'better_than_expected');
  assert.equal(original.overallExpectation, null, 'original must not be mutated');
});

test('applyReflectionAnswer: updates mainIssue', () => {
  const updated = applyReflectionAnswer(makeEmptyReflection(), 'mainIssue', 'tired_done');
  assert.equal(updated.mainIssue, 'tired_done');
});

test('applyReflectionAnswer: updates failureTiming', () => {
  const updated = applyReflectionAnswer(makeEmptyReflection(), 'failureTiming', 'near_end');
  assert.equal(updated.failureTiming, 'near_end');
});

test('applyReflectionAnswer: updates distractionType', () => {
  const updated = applyReflectionAnswer(makeEmptyReflection(), 'distractionType', 'people');
  assert.equal(updated.distractionType, 'people');
});

test('applyReflectionAnswer: updates cueUnderstanding', () => {
  const updated = applyReflectionAnswer(makeEmptyReflection(), 'cueUnderstanding', 'yes');
  assert.equal(updated.cueUnderstanding, 'yes');
});

test('applyReflectionAnswer: updates arousalLevel', () => {
  const updated = applyReflectionAnswer(makeEmptyReflection(), 'arousalLevel', 'calm');
  assert.equal(updated.arousalLevel, 'calm');
});

test('applyReflectionAnswer: updates handlerIssue', () => {
  const updated = applyReflectionAnswer(makeEmptyReflection(), 'handlerIssue', 'cue_consistency');
  assert.equal(updated.handlerIssue, 'cue_consistency');
});

test('applyReflectionAnswer: updates confidenceInAnswers as number', () => {
  const updated = applyReflectionAnswer(makeEmptyReflection(), 'confidenceInAnswers', 5);
  assert.equal(updated.confidenceInAnswers, 5);
});

test('applyReflectionAnswer: preserves other fields when updating one', () => {
  const base: PostSessionReflection = {
    ...makeEmptyReflection(),
    mainIssue: 'distracted',
    arousalLevel: 'slightly_up',
  };
  const updated = applyReflectionAnswer(base, 'failureTiming', 'midway');
  assert.equal(updated.mainIssue, 'distracted', 'mainIssue should be unchanged');
  assert.equal(updated.arousalLevel, 'slightly_up', 'arousalLevel should be unchanged');
  assert.equal(updated.failureTiming, 'midway');
});

// ─────────────────────────────────────────────────────────────────────────────
// areRequiredQuestionsAnswered — save gate
// ─────────────────────────────────────────────────────────────────────────────

test('areRequiredQuestionsAnswered: returns true when no questions', () => {
  assert.equal(areRequiredQuestionsAnswered([], makeEmptyReflection()), true);
});

test('areRequiredQuestionsAnswered: returns false when required question unanswered', () => {
  const questions = makeRequiredOnlyConfig(['overallExpectation', 'mainIssue']);
  const answers = makeEmptyReflection(); // all null
  assert.equal(areRequiredQuestionsAnswered(questions, answers), false);
});

test('areRequiredQuestionsAnswered: returns false when only first required question answered', () => {
  const questions = makeRequiredOnlyConfig(['overallExpectation', 'mainIssue']);
  const answers = { ...makeEmptyReflection(), overallExpectation: 'as_expected' as const };
  assert.equal(areRequiredQuestionsAnswered(questions, answers), false);
});

test('areRequiredQuestionsAnswered: returns true when all required questions answered', () => {
  const questions = makeRequiredOnlyConfig(['overallExpectation', 'mainIssue']);
  const answers = {
    ...makeEmptyReflection(),
    overallExpectation: 'as_expected' as const,
    mainIssue: 'no_major_issue' as const,
  };
  assert.equal(areRequiredQuestionsAnswered(questions, answers), true);
});

test('areRequiredQuestionsAnswered: optional unanswered does not block save', () => {
  const required = makeRequiredOnlyConfig(['overallExpectation']);
  const optional = makeOptionalConfig('distractionType');
  const questions = [...required, optional];
  const answers = { ...makeEmptyReflection(), overallExpectation: 'as_expected' as const };
  // distractionType is null but optional — should still pass
  assert.equal(areRequiredQuestionsAnswered(questions, answers), true);
});

test('areRequiredQuestionsAnswered: real engine output — easy session with no recent history', () => {
  const questions = buildPostSessionReflectionQuestions({
    difficulty: 'easy',
    sessionStatus: 'completed',
    durationSeconds: 300,
    protocolId: 'settle_s1',
    skillId: 'settle_s1',
    environmentTag: 'indoors_low_distraction',
    recentSessions: [],
    learningState: null,
  });
  // Easy + no recent history → only overallExpectation (mainIssue skipped by clean-easy rule)
  assert.equal(questions.length, 1);
  assert.equal(questions[0].id, 'overallExpectation');

  // Not ready until overallExpectation answered
  const unanswered = makeEmptyReflection();
  assert.equal(areRequiredQuestionsAnswered(questions, unanswered), false);
  const answered = { ...unanswered, overallExpectation: 'as_expected' as const };
  assert.equal(areRequiredQuestionsAnswered(questions, answered), true);
});

// ─────────────────────────────────────────────────────────────────────────────
// makeEmptyReflection
// ─────────────────────────────────────────────────────────────────────────────

test('makeEmptyReflection: all fields are null', () => {
  const r = makeEmptyReflection();
  const allNull = Object.values(r).every((v) => v === null);
  assert.equal(allNull, true);
});

test('makeEmptyReflection: returns a new object each call', () => {
  const a = makeEmptyReflection();
  const b = makeEmptyReflection();
  assert.notEqual(a, b);
  a.mainIssue = 'distracted';
  assert.equal(b.mainIssue, null, 'second call should not be affected');
});

// ─────────────────────────────────────────────────────────────────────────────
// Submit payload — postSessionReflection field
// ─────────────────────────────────────────────────────────────────────────────

test('submit payload: includes postSessionReflection when questions were shown', () => {
  const questions = buildPostSessionReflectionQuestions({
    difficulty: 'hard',
    sessionStatus: 'completed',
    durationSeconds: 300,
    protocolId: 'settle_s1',
    skillId: 'settle_s1',
    environmentTag: 'indoors_low_distraction',
    recentSessions: [],
    learningState: null,
  });

  const answers = makeFullAnswers();

  // Mirrors the logic in handleSubmitSession
  const postSessionReflection: SaveSessionParams['postSessionReflection'] =
    questions.length > 0 ? answers : null;

  assert.ok(postSessionReflection !== null);
  assert.equal(postSessionReflection?.mainIssue, 'distracted');
  assert.equal(postSessionReflection?.overallExpectation, 'worse_than_expected');
});

test('submit payload: postSessionReflection is null when no questions were generated', () => {
  const questions: ReflectionQuestionConfig[] = []; // fallback: engine returned nothing

  const answers = makeEmptyReflection();
  const postSessionReflection: SaveSessionParams['postSessionReflection'] =
    questions.length > 0 ? answers : null;

  assert.equal(postSessionReflection, null);
});

test('submit payload: postSessionReflection is null when engine throws (simulated)', () => {
  // Simulates the catch block in the useEffect that sets questions to []
  let questions: ReflectionQuestionConfig[] = [];
  try {
    throw new Error('simulated engine failure');
  } catch {
    questions = [];
  }

  const postSessionReflection: SaveSessionParams['postSessionReflection'] =
    questions.length > 0 ? makeEmptyReflection() : null;

  assert.equal(postSessionReflection, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Required questions from real engine — hard session
// ─────────────────────────────────────────────────────────────────────────────

test('hard session: overallExpectation and mainIssue required; save blocked until both answered', () => {
  const questions = buildPostSessionReflectionQuestions({
    difficulty: 'hard',
    sessionStatus: 'completed',
    durationSeconds: 420,
    protocolId: 'settle_s1',
    skillId: 'settle_s1',
    environmentTag: 'indoors_low_distraction',
    recentSessions: [],
    learningState: null,
  });

  const requiredIds = questions.filter((q) => q.required).map((q) => q.id);
  assert.ok(requiredIds.includes('overallExpectation'), 'overallExpectation must be required');
  assert.ok(requiredIds.includes('mainIssue'), 'mainIssue must be required');

  // Answering only mainIssue is not enough — overallExpectation is also required
  const partialAnswers = { ...makeEmptyReflection(), mainIssue: 'broke_position' as const };
  assert.equal(areRequiredQuestionsAnswered(questions, partialAnswers), false);

  // Answering only overallExpectation is not enough — mainIssue also required
  const partialAlt = { ...makeEmptyReflection(), overallExpectation: 'worse_than_expected' as const };
  assert.equal(areRequiredQuestionsAnswered(questions, partialAlt), false);

  // Both answered → save unblocked
  const fullRequired = { ...partialAnswers, overallExpectation: 'worse_than_expected' as const };
  assert.equal(areRequiredQuestionsAnswered(questions, fullRequired), true);
});

test('abandoned session: includes failureTiming; confidenceInAnswers added when cap allows', () => {
  // Abandoned session with no other signals: overallExpectation + mainIssue +
  // failureTiming (Rule B) + cueUnderstanding (Rule D: failed early, <120s) = 4.
  // The 4-question cap then suppresses confidenceInAnswers — this is correct.
  const questions = buildPostSessionReflectionQuestions({
    difficulty: 'hard',
    sessionStatus: 'abandoned',
    durationSeconds: 60,
    protocolId: 'settle_s1',
    skillId: 'settle_s1',
    environmentTag: 'indoors_low_distraction',
    recentSessions: [],
    learningState: null,
  });

  const qIds = questions.map((q) => q.id);
  assert.ok(qIds.includes('failureTiming'), `Expected failureTiming in [${qIds}]`);
  // Total must be ≤ 4
  assert.ok(questions.length <= 4, `Expected ≤ 4 questions, got ${questions.length}`);

  // Confidence appears when the session is abandoned but NOT also triggering
  // an early-failure signal (e.g. longer session that was manually abandoned).
  const questionsLong = buildPostSessionReflectionQuestions({
    difficulty: 'hard',
    sessionStatus: 'abandoned',
    durationSeconds: 600, // 10 min — does NOT trigger failedEarly
    protocolId: 'settle_s1',
    skillId: 'unique_abc',  // no skill match in empty recentSessions
    environmentTag: 'indoors_low_distraction',
    recentSessions: [],
    learningState: null,
  });
  const longIds = questionsLong.map((q) => q.id);
  assert.ok(longIds.includes('failureTiming'), `Expected failureTiming in [${longIds}]`);
  assert.ok(longIds.includes('confidenceInAnswers'), `Expected confidenceInAnswers in [${longIds}]`);

  // Both overallExpectation and mainIssue are required; all others optional.
  const minAnswers = {
    ...makeEmptyReflection(),
    overallExpectation: 'worse_than_expected' as const,
    mainIssue: 'broke_position' as const,
  };
  assert.equal(areRequiredQuestionsAnswered(questions, minAnswers), true);
  assert.equal(areRequiredQuestionsAnswered(questionsLong, minAnswers), true);
});
