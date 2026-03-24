import assert from 'node:assert/strict';
import test from 'node:test';

import { getPostSessionCoachNudge } from '../lib/coach/getPostSessionCoachNudge.ts';
import { buildPostSessionCoachPrefill } from '../lib/coach/buildPostSessionCoachPrefill.ts';
import type { PostSessionReflection } from '../types/index.ts';

// ─────────────────────────────────────────────────────────────────────────────
// getPostSessionCoachNudge Tests
// ─────────────────────────────────────────────────────────────────────────────

test('getPostSessionCoachNudge: returns true for difficulty="hard"', () => {
  const result = getPostSessionCoachNudge({
    difficulty: 'hard',
    sessionStatus: 'completed',
    postSessionReflection: null,
  });
  assert.equal(result.shouldShow, true);
  assert.ok(result.reasons.includes('difficulty_hard'));
});

test('getPostSessionCoachNudge: returns true for sessionStatus="abandoned"', () => {
  const result = getPostSessionCoachNudge({
    difficulty: 'okay',
    sessionStatus: 'abandoned',
    postSessionReflection: null,
  });
  assert.equal(result.shouldShow, true);
  assert.ok(result.reasons.includes('session_abandoned'));
});

test('getPostSessionCoachNudge: returns true for overallExpectation="worse_than_expected"', () => {
  const result = getPostSessionCoachNudge({
    difficulty: 'okay',
    sessionStatus: 'completed',
    postSessionReflection: {
      overallExpectation: 'worse_than_expected',
      mainIssue: 'no_major_issue',
      failureTiming: null,
      distractionType: null,
      cueUnderstanding: null,
      arousalLevel: null,
      handlerIssue: null,
      confidenceInAnswers: null,
      freeformNote: null,
    },
  });
  assert.equal(result.shouldShow, true);
  assert.ok(result.reasons.includes('below_expectation'));
});

test('getPostSessionCoachNudge: returns true for meaningful mainIssue', () => {
  const result = getPostSessionCoachNudge({
    difficulty: 'okay',
    sessionStatus: 'completed',
    postSessionReflection: {
      overallExpectation: 'as_expected',
      mainIssue: 'distracted',
      failureTiming: null,
      distractionType: null,
      cueUnderstanding: null,
      arousalLevel: null,
      handlerIssue: null,
      confidenceInAnswers: null,
      freeformNote: null,
    },
  });
  assert.equal(result.shouldShow, true);
  assert.ok(result.reasons.includes('issue_distracted'));
});

test('getPostSessionCoachNudge: returns false for normal successful session', () => {
  const result = getPostSessionCoachNudge({
    difficulty: 'okay',
    sessionStatus: 'completed',
    postSessionReflection: {
      overallExpectation: 'as_expected',
      mainIssue: 'no_major_issue',
      failureTiming: null,
      distractionType: null,
      cueUnderstanding: null,
      arousalLevel: null,
      handlerIssue: null,
      confidenceInAnswers: null,
      freeformNote: null,
    },
  });
  assert.equal(result.shouldShow, false);
});

test('getPostSessionCoachNudge: suppresses nudge for difficulty "hard" if expectation was "better_than_expected"', () => {
  const result = getPostSessionCoachNudge({
    difficulty: 'hard',
    sessionStatus: 'completed',
    postSessionReflection: {
      overallExpectation: 'better_than_expected',
      mainIssue: 'no_major_issue',
      failureTiming: null,
      distractionType: null,
      cueUnderstanding: null,
      arousalLevel: null,
      handlerIssue: null,
      confidenceInAnswers: null,
      freeformNote: null,
    },
  });
  assert.equal(result.shouldShow, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// buildPostSessionCoachPrefill Tests
// ─────────────────────────────────────────────────────────────────────────────

test('buildPostSessionCoachPrefill: generates natural language message', () => {
  const message = buildPostSessionCoachPrefill({
    dogName: 'Buddy',
    protocolTitle: 'Recall Phase 1',
    difficulty: 'hard',
    sessionStatus: 'completed',
    postSessionReflection: {
      overallExpectation: 'worse_than_expected',
      mainIssue: 'distracted',
      failureTiming: null,
      distractionType: 'dogs',
      cueUnderstanding: 'not_yet',
      arousalLevel: 'very_up',
      handlerIssue: null,
      confidenceInAnswers: null,
      freeformNote: null,
    },
    notes: 'Buddy was really focused on the neighbors dog.',
  });

  assert.ok(message.includes('Buddy'));
  assert.ok(message.includes('Recall Phase 1'));
  assert.ok(message.includes('hard'));
  assert.ok(message.includes('was easily distracted'));
  assert.ok(message.includes('other dogs'));
  assert.ok(message.includes('Buddy was really focused on the neighbors dog.'));
  assert.ok(message.includes('Can you help me understand what likely went wrong'));
});

test('buildPostSessionCoachPrefill: handles abandoned session', () => {
  const message = buildPostSessionCoachPrefill({
    dogName: 'Buddy',
    protocolTitle: 'Sit',
    difficulty: null,
    sessionStatus: 'abandoned',
    postSessionReflection: null,
    notes: null,
  });

  assert.ok(message.includes('especially challenging, and I ended it early'));
});

test('buildPostSessionCoachPrefill: falls back gracefully when partial data is missing', () => {
  const message = buildPostSessionCoachPrefill({
    dogName: 'Buddy',
    protocolTitle: 'Sit',
    difficulty: 'okay',
    sessionStatus: 'completed',
    postSessionReflection: null,
    notes: null,
  });

  assert.ok(message.includes('Buddy'));
  assert.ok(message.includes('Sit'));
  assert.ok(message.includes('tougher than usual'));
  assert.ok(message.includes('Can you help me understand what likely went wrong'));
});
