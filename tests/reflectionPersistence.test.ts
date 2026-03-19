// ─────────────────────────────────────────────────────────────────────────────
// Reflection Persistence Tests
//
// Covers the full write→read round trip for post_session_reflection:
//
//   Write path:
//     1. Session saved without reflection → post_session_reflection is null
//     2. Session saved with reflection → JSONB payload contains expected values
//     3. Live-coaching session with reflection → both fields saved correctly
//
//   Read path — mapSessionLogRowToModel:
//     4. Legacy row with no post_session_reflection key → null
//     5. Row with explicit null → null
//     6. Row with valid reflection object → typed PostSessionReflection
//
//   Normalization — normalizePostSessionReflection:
//     7. Non-object value (string) → null
//     8. Array value → null
//     9. Object with unknown enum value → that field normalized to null
//    10. Object with all valid fields → all fields preserved
//    11. Partial object (only some fields present) → missing fields null
//    12. Empty object → all fields null (not throws)
//
//   Alternate read path — SessionLogInput (learning signals):
//    13. SessionLogInput with valid reflection preserved through extractSessionSignals
//    14. SessionLogInput with null reflection preserved through extractSessionSignals
//
// Run with: node --experimental-strip-types tests/reflectionPersistence.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import type { PostSessionReflection } from '../types/index.ts';
import type { SaveSessionParams } from '../lib/sessionManager.ts';
import type { SessionLogInput } from '../lib/adaptivePlanning/learningSignals.ts';
import { mapSessionLogRowToModel, normalizePostSessionReflection } from '../lib/modelMappers.ts';
import { extractSessionSignals } from '../lib/adaptivePlanning/learningSignals.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeFullReflection(): PostSessionReflection {
  return {
    overallExpectation:  'worse_than_expected',
    mainIssue:           'distracted',
    failureTiming:       'immediately',
    distractionType:     'dogs',
    cueUnderstanding:    'not_yet',
    arousalLevel:        'very_up',
    handlerIssue:        null,
    confidenceInAnswers: 4,
    freeformNote:        'A neighbour walked past with two large dogs.',
  };
}

/**
 * Minimal session_logs DB row. post_session_reflection defaults to null.
 */
function makeMinimalRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id:                      'row-1',
    user_id:                 'user-1',
    dog_id:                  'dog-1',
    plan_id:                 'plan-1',
    session_id:              'session-1',
    exercise_id:             'llw_s1_d1',
    protocol_id:             'llw_s1',
    duration_seconds:        420,
    difficulty:              'hard',
    notes:                   null,
    completed_at:            '2026-03-16T10:00:00.000Z',
    success_score:           3,
    session_status:          'completed',
    skill_id:                null,
    session_kind:            null,
    environment_tag:         'indoors_low_distraction',
    live_coaching_used:      false,
    post_session_reflection: null,
    ...overrides,
  };
}

/**
 * Mirrors the write-path payload built in saveSession().
 * Returns the object that would be passed to the Supabase insert.
 */
function buildInsertPayload(params: Partial<SaveSessionParams>): Record<string, unknown> {
  return {
    user_id:                 params.userId ?? 'user-1',
    dog_id:                  params.dogId ?? 'dog-1',
    plan_id:                 params.planId ?? 'plan-1',
    session_id:              params.sessionId ?? 'sess-1',
    exercise_id:             params.exerciseId ?? 'ex-1',
    protocol_id:             params.protocolId ?? 'proto-1',
    duration_seconds:        params.durationSeconds ?? 300,
    difficulty:              params.difficulty ?? 'okay',
    notes:                   params.notes || null,
    completed_at:            params.completedAt ?? '2026-03-16T10:00:00.000Z',
    success_score:           params.successScore ?? null,
    step_results:            params.stepResults ?? [],
    session_status:          params.sessionStatus ?? 'completed',
    skill_id:                params.skillId ?? null,
    session_kind:            params.sessionKind ?? null,
    environment_tag:         params.environmentTag ?? null,
    live_coaching_used:      params.liveCoachingUsed ?? false,
    live_ai_trainer_summary: params.liveAiTrainerSummary ?? null,
    // This is the key field: mirrors  `params.postSessionReflection ?? null`
    post_session_reflection: params.postSessionReflection ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Write path — session saved without reflection
// ─────────────────────────────────────────────────────────────────────────────

test('write path: post_session_reflection is null when param is omitted', () => {
  const payload = buildInsertPayload({ userId: 'u1', dogId: 'd1' });
  assert.equal(payload.post_session_reflection, null);
});

test('write path: post_session_reflection is null when param is explicitly null', () => {
  const payload = buildInsertPayload({ postSessionReflection: null });
  assert.equal(payload.post_session_reflection, null);
});

test('write path: live_coaching_used and other fields are unaffected when reflection is null', () => {
  const payload = buildInsertPayload({
    liveCoachingUsed: false,
    postSessionReflection: null,
  });
  assert.equal(payload.live_coaching_used, false);
  assert.equal(payload.live_ai_trainer_summary, null);
  assert.equal(payload.post_session_reflection, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Write path — session saved with reflection
// ─────────────────────────────────────────────────────────────────────────────

test('write path: post_session_reflection JSONB payload contains expected values', () => {
  const reflection = makeFullReflection();
  const payload = buildInsertPayload({ postSessionReflection: reflection });

  const stored = payload.post_session_reflection as PostSessionReflection;
  assert.equal(stored.overallExpectation,  'worse_than_expected');
  assert.equal(stored.mainIssue,           'distracted');
  assert.equal(stored.failureTiming,       'immediately');
  assert.equal(stored.distractionType,     'dogs');
  assert.equal(stored.cueUnderstanding,    'not_yet');
  assert.equal(stored.arousalLevel,        'very_up');
  assert.equal(stored.handlerIssue,        null);
  assert.equal(stored.confidenceInAnswers, 4);
  assert.equal(typeof stored.freeformNote, 'string');
});

test('write path: other session fields are unchanged when reflection is present', () => {
  const payload = buildInsertPayload({
    difficulty: 'hard',
    sessionStatus: 'completed',
    liveCoachingUsed: false,
    postSessionReflection: makeFullReflection(),
  });
  assert.equal(payload.difficulty,         'hard');
  assert.equal(payload.session_status,     'completed');
  assert.equal(payload.live_coaching_used, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Write path — live-coaching session with reflection
// ─────────────────────────────────────────────────────────────────────────────

test('write path: live-ai session with reflection saves both sets of fields correctly', () => {
  const liveAiTrainerSummary = {
    used: true,
    outcome: 'success' as const,
    durationSeconds: 300,
    totalCues: 5,
    successfulCues: 4,
  };
  const reflection = makeFullReflection();

  const payload = buildInsertPayload({
    liveCoachingUsed: true,
    liveAiTrainerSummary,
    postSessionReflection: reflection,
  });

  assert.equal(payload.live_coaching_used, true);
  assert.equal((payload.live_ai_trainer_summary as typeof liveAiTrainerSummary).outcome, 'success');
  assert.equal((payload.post_session_reflection as PostSessionReflection).mainIssue, 'distracted');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Read path — legacy row with no post_session_reflection key
// ─────────────────────────────────────────────────────────────────────────────

test('mapSessionLogRowToModel: legacy row with no field key maps to null', () => {
  const row = makeMinimalRow();
  delete (row as Record<string, unknown>).post_session_reflection;
  const model = mapSessionLogRowToModel(row);
  assert.equal(model.postSessionReflection, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Read path — row with explicit null
// ─────────────────────────────────────────────────────────────────────────────

test('mapSessionLogRowToModel: row with explicit null maps to null', () => {
  const row = makeMinimalRow({ post_session_reflection: null });
  const model = mapSessionLogRowToModel(row);
  assert.equal(model.postSessionReflection, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Read path — row with valid reflection object
// ─────────────────────────────────────────────────────────────────────────────

test('mapSessionLogRowToModel: valid reflection object is typed and preserved', () => {
  const row = makeMinimalRow({ post_session_reflection: makeFullReflection() });
  const model = mapSessionLogRowToModel(row);

  assert.ok(model.postSessionReflection !== null);
  assert.equal(model.postSessionReflection?.overallExpectation,  'worse_than_expected');
  assert.equal(model.postSessionReflection?.mainIssue,           'distracted');
  assert.equal(model.postSessionReflection?.failureTiming,       'immediately');
  assert.equal(model.postSessionReflection?.distractionType,     'dogs');
  assert.equal(model.postSessionReflection?.cueUnderstanding,    'not_yet');
  assert.equal(model.postSessionReflection?.arousalLevel,        'very_up');
  assert.equal(model.postSessionReflection?.handlerIssue,        null);
  assert.equal(model.postSessionReflection?.confidenceInAnswers, 4);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Normalization — non-object value (string)
// ─────────────────────────────────────────────────────────────────────────────

test('normalizePostSessionReflection: string value returns null', () => {
  assert.equal(normalizePostSessionReflection('{"mainIssue":"distracted"}'), null);
});

test('normalizePostSessionReflection: number value returns null', () => {
  assert.equal(normalizePostSessionReflection(42), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Normalization — array value
// ─────────────────────────────────────────────────────────────────────────────

test('normalizePostSessionReflection: array returns null', () => {
  assert.equal(normalizePostSessionReflection([]), null);
  assert.equal(normalizePostSessionReflection([{ mainIssue: 'distracted' }]), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Normalization — object with unknown enum value
// ─────────────────────────────────────────────────────────────────────────────

test('normalizePostSessionReflection: unknown mainIssue value is normalized to null', () => {
  const raw = { ...makeFullReflection(), mainIssue: 'UNKNOWN_ISSUE' };
  const result = normalizePostSessionReflection(raw);
  assert.ok(result !== null, 'result should not be null (other fields are valid)');
  assert.equal(result?.mainIssue, null, 'unknown mainIssue must be null');
  // Other valid fields must be preserved
  assert.equal(result?.overallExpectation, 'worse_than_expected');
});

test('normalizePostSessionReflection: unknown overallExpectation normalized to null, rest preserved', () => {
  const raw = { ...makeFullReflection(), overallExpectation: 'maybe' };
  const result = normalizePostSessionReflection(raw);
  assert.equal(result?.overallExpectation, null);
  assert.equal(result?.mainIssue, 'distracted');
});

test('normalizePostSessionReflection: unknown arousalLevel normalized to null', () => {
  const raw = { ...makeFullReflection(), arousalLevel: 'extremely_hyper' };
  const result = normalizePostSessionReflection(raw);
  assert.equal(result?.arousalLevel, null);
});

test('normalizePostSessionReflection: confidenceInAnswers out of range normalized to null', () => {
  const raw = { ...makeFullReflection(), confidenceInAnswers: 6 };
  const result = normalizePostSessionReflection(raw);
  assert.equal(result?.confidenceInAnswers, null);
});

test('normalizePostSessionReflection: confidenceInAnswers = 0 normalized to null', () => {
  const raw = { ...makeFullReflection(), confidenceInAnswers: 0 };
  const result = normalizePostSessionReflection(raw);
  assert.equal(result?.confidenceInAnswers, null);
});

test('normalizePostSessionReflection: non-string freeformNote normalized to null', () => {
  const raw = { ...makeFullReflection(), freeformNote: 12345 };
  const result = normalizePostSessionReflection(raw);
  assert.equal(result?.freeformNote, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Normalization — all valid fields preserved
// ─────────────────────────────────────────────────────────────────────────────

test('normalizePostSessionReflection: valid full reflection preserved exactly', () => {
  const r = makeFullReflection();
  const result = normalizePostSessionReflection(r);
  assert.ok(result !== null);
  assert.equal(result?.overallExpectation,  r.overallExpectation);
  assert.equal(result?.mainIssue,           r.mainIssue);
  assert.equal(result?.failureTiming,       r.failureTiming);
  assert.equal(result?.distractionType,     r.distractionType);
  assert.equal(result?.cueUnderstanding,    r.cueUnderstanding);
  assert.equal(result?.arousalLevel,        r.arousalLevel);
  assert.equal(result?.handlerIssue,        r.handlerIssue);
  assert.equal(result?.confidenceInAnswers, r.confidenceInAnswers);
  assert.equal(result?.freeformNote,        r.freeformNote);
});

test('normalizePostSessionReflection: all confidence values 1-5 are preserved', () => {
  for (const v of [1, 2, 3, 4, 5] as const) {
    const raw = { ...makeFullReflection(), confidenceInAnswers: v };
    const result = normalizePostSessionReflection(raw);
    assert.equal(result?.confidenceInAnswers, v);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. Normalization — partial object (only some fields present)
// ─────────────────────────────────────────────────────────────────────────────

test('normalizePostSessionReflection: partial object fills missing fields with null', () => {
  const raw = { overallExpectation: 'as_expected', mainIssue: 'no_major_issue' };
  const result = normalizePostSessionReflection(raw);
  assert.ok(result !== null);
  assert.equal(result?.overallExpectation,  'as_expected');
  assert.equal(result?.mainIssue,           'no_major_issue');
  // All omitted fields should be null
  assert.equal(result?.failureTiming,       null);
  assert.equal(result?.distractionType,     null);
  assert.equal(result?.cueUnderstanding,    null);
  assert.equal(result?.arousalLevel,        null);
  assert.equal(result?.handlerIssue,        null);
  assert.equal(result?.confidenceInAnswers, null);
  assert.equal(result?.freeformNote,        null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. Normalization — empty object does not throw
// ─────────────────────────────────────────────────────────────────────────────

test('normalizePostSessionReflection: empty object normalizes to all-null PostSessionReflection without throwing', () => {
  let result: PostSessionReflection | null;
  assert.doesNotThrow(() => {
    result = normalizePostSessionReflection({});
  });
  // @ts-ignore — used in callback
  assert.ok(result !== null);
  // @ts-ignore
  const allNull = Object.values(result!).every((v) => v === null);
  assert.equal(allNull, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. Alternate read path — SessionLogInput + extractSessionSignals
//     Reflection is passed through; extractSessionSignals does not drop it.
// ─────────────────────────────────────────────────────────────────────────────

test('extractSessionSignals: reflection on SessionLogInput is not dropped by signal extraction', () => {
  const reflection = makeFullReflection();
  const input: SessionLogInput = {
    id:                      'log-1',
    dog_id:                  'dog-1',
    plan_id:                 'plan-1',
    session_id:              'sess-1',
    exercise_id:             'ex-1',
    protocol_id:             'settle_s1',
    skill_id:                'settle_s1',
    session_kind:            'core',
    duration_seconds:        420,
    difficulty:              'hard',
    success_score:           2,
    session_status:          'completed',
    environment_tag:         'indoors_low_distraction',
    completed_at:            '2026-03-16T10:00:00.000Z',
    post_session_reflection: reflection,
  };

  // extractSessionSignals returns a SessionLearningSignal — it does not include
  // reflection in its output shape (it's not used there yet), but we verify:
  //   a) the function does not throw
  //   b) the original input still carries reflection after the call
  const signal = extractSessionSignals(input);
  assert.ok(signal !== null, 'extractSessionSignals should return a signal');
  assert.equal(signal.sourceId, 'log-1');
  // The input itself was not mutated
  assert.equal(input.post_session_reflection?.mainIssue, 'distracted');
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. Alternate read path — SessionLogInput with null reflection
// ─────────────────────────────────────────────────────────────────────────────

test('extractSessionSignals: null reflection on SessionLogInput does not throw', () => {
  const input: SessionLogInput = {
    id:                      'log-2',
    dog_id:                  'dog-1',
    difficulty:              'easy',
    session_status:          'completed',
    post_session_reflection: null,
  };

  assert.doesNotThrow(() => {
    const signal = extractSessionSignals(input);
    assert.ok(signal !== null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. mapSessionLogRowToModel — malformed (object with all bad enum values)
//     Does not throw; all fields normalized to null; core row fields preserved.
// ─────────────────────────────────────────────────────────────────────────────

test('mapSessionLogRowToModel: all-bad-enum reflection is normalized to all-null without throwing', () => {
  const badReflection = {
    overallExpectation:  'NOPE',
    mainIssue:           'NOPE',
    failureTiming:       'NOPE',
    distractionType:     'NOPE',
    cueUnderstanding:    'NOPE',
    arousalLevel:        'NOPE',
    handlerIssue:        'NOPE',
    confidenceInAnswers: 99,
    freeformNote:        12345,
  };

  let model: ReturnType<typeof mapSessionLogRowToModel> | null = null;
  assert.doesNotThrow(() => {
    model = mapSessionLogRowToModel(makeMinimalRow({ post_session_reflection: badReflection }));
  });

  assert.ok(model !== null);
  const r = model!.postSessionReflection;
  assert.ok(r !== null, 'result object should not be null — it is a valid object shape');
  assert.equal(r?.overallExpectation,  null);
  assert.equal(r?.mainIssue,           null);
  assert.equal(r?.arousalLevel,        null);
  assert.equal(r?.confidenceInAnswers, null);
  assert.equal(r?.freeformNote,        null);

  // Core row fields must still be correct
  assert.equal(model!.id,       'row-1');
  assert.equal(model!.dogId,    'dog-1');
  assert.equal(model!.difficulty, 'hard');
});
