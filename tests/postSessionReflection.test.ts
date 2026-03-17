// ─────────────────────────────────────────────────────────────────────────────
// Post-Session Reflection Tests
//
// Covers the domain model for PostSessionReflection:
//   - Type shape: all fields accept typed values and null
//   - Partial reflection: only some answers filled (handler exited early)
//   - SaveSessionParams accepts postSessionReflection
//   - mapSessionLogRowToModel parses valid JSONB correctly
//   - mapSessionLogRowToModel returns null for missing / malformed JSONB
//   - SessionLogInput carries post_session_reflection from DB row
//
// Run with: node --experimental-strip-types tests/postSessionReflection.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import type { PostSessionReflection } from '../types/index.ts';
import type { SaveSessionParams } from '../lib/sessionManager.ts';
import type { SessionLogInput } from '../lib/adaptivePlanning/learningSignals.ts';
import { mapSessionLogRowToModel } from '../lib/modelMappers.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeFullReflection(): PostSessionReflection {
  return {
    overallExpectation:   'worse_than_expected',
    mainIssue:            'distracted',
    failureTiming:        'immediately',
    distractionType:      'dogs',
    cueUnderstanding:     'not_yet',
    arousalLevel:         'very_up',
    handlerIssue:         null,
    confidenceInAnswers:  4,
    freeformNote:         'A neighbour walked by with two dogs right at the start.',
  };
}

function makeMinimalSessionLogRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id:                       'row-1',
    user_id:                  'user-1',
    dog_id:                   'dog-1',
    plan_id:                  'plan-1',
    session_id:               'session-1',
    exercise_id:              'llw_s1_d1',
    protocol_id:              'llw_s1',
    duration_seconds:         420,
    difficulty:               'hard',
    notes:                    'dog was distracted by other dogs',
    completed_at:             '2026-03-16T10:00:00.000Z',
    success_score:            2,
    session_status:           'completed',
    skill_id:                 null,
    session_kind:             null,
    environment_tag:          'outdoors_high_distraction',
    live_coaching_used:       false,
    post_session_reflection:  null,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Type shape
// ─────────────────────────────────────────────────────────────────────────────

test('PostSessionReflection: full reflection has correct field values', () => {
  const r = makeFullReflection();
  assert.equal(r.overallExpectation,   'worse_than_expected');
  assert.equal(r.mainIssue,            'distracted');
  assert.equal(r.failureTiming,        'immediately');
  assert.equal(r.distractionType,      'dogs');
  assert.equal(r.cueUnderstanding,     'not_yet');
  assert.equal(r.arousalLevel,         'very_up');
  assert.equal(r.handlerIssue,         null);
  assert.equal(r.confidenceInAnswers,  4);
  assert.equal(typeof r.freeformNote,  'string');
});

test('PostSessionReflection: all nullable fields accept null', () => {
  const r: PostSessionReflection = {
    overallExpectation:   null,
    mainIssue:            null,
    failureTiming:        null,
    distractionType:      null,
    cueUnderstanding:     null,
    arousalLevel:         null,
    handlerIssue:         null,
    confidenceInAnswers:  null,
    freeformNote:         null,
  };
  assert.equal(r.overallExpectation, null);
  assert.equal(r.confidenceInAnswers, null);
});

test('PostSessionReflection: confidenceInAnswers accepts 1–5', () => {
  const scores: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];
  for (const score of scores) {
    const r: PostSessionReflection = { ...makeFullReflection(), confidenceInAnswers: score };
    assert.equal(r.confidenceInAnswers, score);
  }
});

test('PostSessionReflection: no_major_issue is valid mainIssue', () => {
  const r: PostSessionReflection = { ...makeFullReflection(), mainIssue: 'no_major_issue' };
  assert.equal(r.mainIssue, 'no_major_issue');
});

// ─────────────────────────────────────────────────────────────────────────────
// SaveSessionParams accepts postSessionReflection
// ─────────────────────────────────────────────────────────────────────────────

test('SaveSessionParams: accepts postSessionReflection set to a full reflection', () => {
  const params: Partial<SaveSessionParams> = {
    postSessionReflection: makeFullReflection(),
  };
  assert.ok(params.postSessionReflection !== undefined);
  assert.equal(params.postSessionReflection?.mainIssue, 'distracted');
});

test('SaveSessionParams: accepts postSessionReflection set to null', () => {
  const params: Partial<SaveSessionParams> = {
    postSessionReflection: null,
  };
  assert.equal(params.postSessionReflection, null);
});

test('SaveSessionParams: postSessionReflection is optional (omit from params)', () => {
  // If the type is truly optional this must compile without the field.
  const params: Partial<SaveSessionParams> = {
    userId: 'u1',
    dogId:  'd1',
  };
  assert.equal(params.postSessionReflection, undefined);
});

// ─────────────────────────────────────────────────────────────────────────────
// mapSessionLogRowToModel — JSONB parsing
// ─────────────────────────────────────────────────────────────────────────────

test('mapSessionLogRowToModel: parses post_session_reflection from valid JSONB object', () => {
  const row = makeMinimalSessionLogRow({
    post_session_reflection: makeFullReflection(),
  });
  const model = mapSessionLogRowToModel(row);
  assert.ok(model.postSessionReflection !== null);
  assert.equal(model.postSessionReflection?.mainIssue, 'distracted');
  assert.equal(model.postSessionReflection?.arousalLevel, 'very_up');
});

test('mapSessionLogRowToModel: returns null postSessionReflection when column is null', () => {
  const row = makeMinimalSessionLogRow({ post_session_reflection: null });
  const model = mapSessionLogRowToModel(row);
  assert.equal(model.postSessionReflection, null);
});

test('mapSessionLogRowToModel: returns null postSessionReflection when column is absent (legacy row)', () => {
  const row = makeMinimalSessionLogRow();
  // Remove the key to simulate a legacy row that predates the column
  delete (row as Record<string, unknown>).post_session_reflection;
  const model = mapSessionLogRowToModel(row);
  assert.equal(model.postSessionReflection, null);
});

test('mapSessionLogRowToModel: returns null postSessionReflection when column is an array (malformed)', () => {
  const row = makeMinimalSessionLogRow({ post_session_reflection: [] });
  const model = mapSessionLogRowToModel(row);
  assert.equal(model.postSessionReflection, null);
});

test('mapSessionLogRowToModel: maps all core fields correctly', () => {
  const row = makeMinimalSessionLogRow();
  const model = mapSessionLogRowToModel(row);
  assert.equal(model.id,               'row-1');
  assert.equal(model.dogId,            'dog-1');
  assert.equal(model.difficulty,       'hard');
  assert.equal(model.sessionStatus,    'completed');
  assert.equal(model.liveCoachingUsed, false);
  assert.equal(model.environmentTag,   'outdoors_high_distraction');
  assert.equal(model.successScore,     2);
});

// ─────────────────────────────────────────────────────────────────────────────
// SessionLogInput carries post_session_reflection
// ─────────────────────────────────────────────────────────────────────────────

test('SessionLogInput: accepts post_session_reflection from a DB row shape', () => {
  const input: SessionLogInput = {
    id:                       'row-1',
    dog_id:                   'dog-1',
    difficulty:               'hard',
    post_session_reflection:  makeFullReflection(),
  };
  assert.equal(input.post_session_reflection?.mainIssue, 'distracted');
});

test('SessionLogInput: post_session_reflection is optional (absent from existing callers)', () => {
  const input: SessionLogInput = {
    id:        'row-2',
    dog_id:    'dog-2',
    difficulty: 'okay',
  };
  assert.equal(input.post_session_reflection, undefined);
});
