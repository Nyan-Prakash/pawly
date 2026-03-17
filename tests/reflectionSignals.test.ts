// ─────────────────────────────────────────────────────────────────────────────
// Reflection Signal Extraction & Aggregation Tests
//
// Covers:
//   1. No reflection → all-zero signals, backward-compatible session signal
//   2. Understanding issue signals (mainIssue / cueUnderstanding / failureTiming)
//   3. Distraction issue signals (mainIssue distracted / distractionType present)
//   4. Near-end duration breakdown signal
//   5. Over-excitement / arousal signals (very_up vs slightly_up)
//   6. Handler friction signals
//   7. Confidence weighting (higher confidence → proportionally larger signal)
//   8. Partial reflection (missing fields don't throw)
//   9. Aggregation across multiple sessions
//  10. Summary wording via buildLearningStateCoachSummary (reflection-grounded)
//
// Run with: node --experimental-strip-types tests/reflectionSignals.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';

import type { PostSessionReflection } from '../types/index.ts';
import type { SessionLogInput } from '../lib/adaptivePlanning/learningSignals.ts';
import {
  extractReflectionSignals,
  extractSessionSignals,
  aggregateRecentSignals,
  aggregateReflectionEvidence,
} from '../lib/adaptivePlanning/learningSignals.ts';
import { buildLearningStateCoachSummary } from '../lib/adaptivePlanning/learningStateSummary.ts';
import type { DogLearningState } from '../types/index.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeReflection(overrides: Partial<PostSessionReflection> = {}): PostSessionReflection {
  return {
    overallExpectation:  null,
    mainIssue:           null,
    failureTiming:       null,
    distractionType:     null,
    cueUnderstanding:    null,
    arousalLevel:        null,
    handlerIssue:        null,
    confidenceInAnswers: 5,   // maximum confidence unless overridden
    freeformNote:        null,
    ...overrides,
  };
}

function makeSessionLog(overrides: Partial<SessionLogInput> = {}): SessionLogInput {
  return {
    id:               'sess-1',
    dog_id:           'dog-1',
    difficulty:       'hard',
    session_status:   'completed',
    success_score:    2,
    duration_seconds: 420,
    completed_at:     '2026-03-16T10:00:00.000Z',
    ...overrides,
  };
}

function makeDefaultLearningState(): DogLearningState {
  return {
    id: 'ls-1',
    dogId: 'dog-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-03-16T00:00:00.000Z',
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
    lastEvaluatedAt: null,
    version: 2,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. No reflection — backward compatibility
// ─────────────────────────────────────────────────────────────────────────────

test('no reflection: extractReflectionSignals returns all-zero signals', () => {
  const signals = extractReflectionSignals(null);
  assert.equal(signals.understandingIssue,    0);
  assert.equal(signals.distractionIssue,      0);
  assert.equal(signals.durationBreakdownIssue, 0);
  assert.equal(signals.arousalIssue,          0);
  assert.equal(signals.handlerFrictionIssue,  0);
  assert.equal(signals.reflectionConfidence,  0);
});

test('no reflection: extractReflectionSignals(undefined) returns all-zero signals', () => {
  const signals = extractReflectionSignals(undefined);
  assert.equal(signals.reflectionConfidence, 0);
  assert.equal(signals.understandingIssue, 0);
});

test('no reflection: extractSessionSignals populates reflection with all zeros', () => {
  const log = makeSessionLog({ post_session_reflection: null });
  const signal = extractSessionSignals(log);
  assert.equal(signal.reflection.understandingIssue,   0);
  assert.equal(signal.reflection.distractionIssue,     0);
  assert.equal(signal.reflection.arousalIssue,         0);
  assert.equal(signal.reflection.handlerFrictionIssue, 0);
  assert.equal(signal.reflection.reflectionConfidence, 0);
});

test('no reflection: existing session-signal fields are unaffected', () => {
  const log = makeSessionLog({ post_session_reflection: null, difficulty: 'hard', success_score: 2 });
  const signal = extractSessionSignals(log);
  assert.equal(signal.difficulty, 'hard');
  assert.equal(signal.successScore, 2);
  assert.equal(signal.completed, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Understanding issue
// ─────────────────────────────────────────────────────────────────────────────

test('understanding: mainIssue did_not_understand raises understandingIssue at full base', () => {
  const r = makeReflection({ mainIssue: 'did_not_understand', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  // base = 1.0, confidence = 1.0 → 1.0
  assert.equal(s.understandingIssue, 1.0);
});

test('understanding: cueUnderstanding not_yet raises understandingIssue at full base', () => {
  const r = makeReflection({ cueUnderstanding: 'not_yet', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.understandingIssue, 1.0);
});

test('understanding: failureTiming immediately + cueUnderstanding not yes → partial signal', () => {
  const r = makeReflection({ failureTiming: 'immediately', cueUnderstanding: null, confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  // base = 0.6, confidence = 1.0
  assert.ok(s.understandingIssue > 0 && s.understandingIssue < 1, `Expected (0,1), got ${s.understandingIssue}`);
  assert.equal(s.understandingIssue, 0.6);
});

test('understanding: failureTiming immediately + cueUnderstanding yes → no understanding signal', () => {
  const r = makeReflection({ failureTiming: 'immediately', cueUnderstanding: 'yes', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.understandingIssue, 0);
});

test('understanding: no understanding cues → understandingIssue is 0', () => {
  const r = makeReflection({ mainIssue: 'no_major_issue', cueUnderstanding: 'yes', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.understandingIssue, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Distraction issue
// ─────────────────────────────────────────────────────────────────────────────

test('distraction: mainIssue distracted raises distractionIssue at full base', () => {
  const r = makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.distractionIssue, 1.0);
});

test('distraction: distractionType present (without mainIssue=distracted) raises partial signal', () => {
  const r = makeReflection({ distractionType: 'dogs', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.distractionIssue, 0.7);
});

test('distraction: no distraction cues → distractionIssue is 0', () => {
  const r = makeReflection({ mainIssue: 'no_major_issue', distractionType: null, confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.distractionIssue, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Duration breakdown issue
// ─────────────────────────────────────────────────────────────────────────────

test('duration: failureTiming near_end raises durationBreakdownIssue at full base', () => {
  const r = makeReflection({ failureTiming: 'near_end', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.durationBreakdownIssue, 1.0);
});

test('duration: broke_position with non-immediate failure → partial signal', () => {
  const r = makeReflection({ mainIssue: 'broke_position', failureTiming: 'midway', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.durationBreakdownIssue, 0.6);
});

test('duration: broke_position with immediately → no duration signal (early failure, not late)', () => {
  const r = makeReflection({ mainIssue: 'broke_position', failureTiming: 'immediately', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.durationBreakdownIssue, 0);
});

test('duration: no duration cues → durationBreakdownIssue is 0', () => {
  const r = makeReflection({ failureTiming: 'immediately', mainIssue: 'distracted', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.durationBreakdownIssue, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Arousal issue — very_up > slightly_up
// ─────────────────────────────────────────────────────────────────────────────

test('arousal: mainIssue over_excited raises arousalIssue at full base', () => {
  const r = makeReflection({ mainIssue: 'over_excited', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.arousalIssue, 1.0);
});

test('arousal: arousalLevel very_up raises arousalIssue at full base', () => {
  const r = makeReflection({ arousalLevel: 'very_up', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.arousalIssue, 1.0);
});

test('arousal: slightly_up produces weaker signal than very_up', () => {
  const veryUp    = extractReflectionSignals(makeReflection({ arousalLevel: 'very_up',    confidenceInAnswers: 5 }));
  const slightlyUp = extractReflectionSignals(makeReflection({ arousalLevel: 'slightly_up', confidenceInAnswers: 5 }));
  assert.ok(
    slightlyUp.arousalIssue < veryUp.arousalIssue,
    `slightly_up (${slightlyUp.arousalIssue}) should be < very_up (${veryUp.arousalIssue})`,
  );
  assert.ok(slightlyUp.arousalIssue > 0, 'slightly_up should still produce a non-zero signal');
});

test('arousal: calm arousalLevel → arousalIssue is 0', () => {
  const r = makeReflection({ arousalLevel: 'calm', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.arousalIssue, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Handler friction
// ─────────────────────────────────────────────────────────────────────────────

test('handler: mainIssue handler_inconsistent raises handlerFrictionIssue at full base', () => {
  const r = makeReflection({ mainIssue: 'handler_inconsistent', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.handlerFrictionIssue, 1.0);
});

test('handler: handlerIssue set (not via mainIssue) raises partial signal', () => {
  const r = makeReflection({ handlerIssue: 'timing_rewards', confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.handlerFrictionIssue, 0.7);
});

test('handler: no handler cues → handlerFrictionIssue is 0', () => {
  const r = makeReflection({ mainIssue: 'no_major_issue', handlerIssue: null, confidenceInAnswers: 5 });
  const s = extractReflectionSignals(r);
  assert.equal(s.handlerFrictionIssue, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Confidence weighting
// ─────────────────────────────────────────────────────────────────────────────

test('confidence weighting: same reflection at confidence 5 > confidence 3 > confidence 1', () => {
  const base = { mainIssue: 'distracted' as const };
  const high   = extractReflectionSignals(makeReflection({ ...base, confidenceInAnswers: 5 }));
  const medium = extractReflectionSignals(makeReflection({ ...base, confidenceInAnswers: 3 }));
  const low    = extractReflectionSignals(makeReflection({ ...base, confidenceInAnswers: 1 }));

  assert.ok(high.distractionIssue > medium.distractionIssue, `high > medium: ${high.distractionIssue} vs ${medium.distractionIssue}`);
  assert.ok(medium.distractionIssue > low.distractionIssue,  `medium > low: ${medium.distractionIssue} vs ${low.distractionIssue}`);
  assert.ok(low.distractionIssue > 0,                        `low > 0: ${low.distractionIssue}`);
});

test('confidence weighting: reflectionConfidence follows normalized confidence value', () => {
  const s5 = extractReflectionSignals(makeReflection({ confidenceInAnswers: 5 }));
  const s3 = extractReflectionSignals(makeReflection({ confidenceInAnswers: 3 }));
  const s1 = extractReflectionSignals(makeReflection({ confidenceInAnswers: 1 }));
  assert.equal(s5.reflectionConfidence, 1.0);
  assert.equal(s3.reflectionConfidence, 0.6);
  assert.equal(s1.reflectionConfidence, 0.2);
});

test('confidence weighting: absent confidenceInAnswers uses moderate default', () => {
  const r = makeReflection({ mainIssue: 'distracted', confidenceInAnswers: null });
  const s = extractReflectionSignals(r);
  // Default confidence = 0.5, base = 1.0 → weighted = 0.5
  assert.equal(s.reflectionConfidence, 0.5);
  assert.equal(s.distractionIssue, 0.5);
});

test('confidence weighting: high confidence is proportionally larger than moderate default', () => {
  const highConf = extractReflectionSignals(makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 5 }));
  const noConf   = extractReflectionSignals(makeReflection({ mainIssue: 'distracted', confidenceInAnswers: null }));
  assert.ok(highConf.distractionIssue > noConf.distractionIssue);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Partial reflection (some fields null)
// ─────────────────────────────────────────────────────────────────────────────

test('partial reflection: empty reflection does not throw and returns all-zero signals', () => {
  const r: PostSessionReflection = {
    overallExpectation: null,
    mainIssue: null,
    failureTiming: null,
    distractionType: null,
    cueUnderstanding: null,
    arousalLevel: null,
    handlerIssue: null,
    confidenceInAnswers: 5,
    freeformNote: null,
  };
  let signals: ReturnType<typeof extractReflectionSignals> | null = null;
  assert.doesNotThrow(() => { signals = extractReflectionSignals(r); });
  assert.equal(signals!.understandingIssue,   0);
  assert.equal(signals!.distractionIssue,     0);
  assert.equal(signals!.durationBreakdownIssue, 0);
  assert.equal(signals!.arousalIssue,         0);
  assert.equal(signals!.handlerFrictionIssue, 0);
  // reflectionConfidence is non-zero because confidenceInAnswers = 5
  assert.equal(signals!.reflectionConfidence, 1.0);
});

test('partial reflection: reflection with only overallExpectation does not raise issue signals', () => {
  const r = makeReflection({ overallExpectation: 'worse_than_expected' });
  const s = extractReflectionSignals(r);
  assert.equal(s.understandingIssue, 0);
  assert.equal(s.distractionIssue, 0);
  assert.equal(s.arousalIssue, 0);
});

test('partial reflection: session with partial reflection still produces complete SessionLearningSignal', () => {
  const log = makeSessionLog({
    post_session_reflection: makeReflection({ mainIssue: 'distracted' }),
  });
  const signal = extractSessionSignals(log);
  assert.ok(signal.reflection !== null && signal.reflection !== undefined);
  assert.ok(signal.reflection.distractionIssue > 0);
  // Core fields still present
  assert.equal(signal.difficulty, 'hard');
  assert.equal(signal.completed, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Aggregation — multiple sessions
// ─────────────────────────────────────────────────────────────────────────────

test('aggregation: sessions without reflection contribute zero pressure', () => {
  const logs: SessionLogInput[] = [
    makeSessionLog({ id: 'a', post_session_reflection: null }),
    makeSessionLog({ id: 'b', post_session_reflection: null }),
    makeSessionLog({ id: 'c', post_session_reflection: null }),
  ];
  const result = aggregateRecentSignals({ sessions: logs, walks: [], plan: null });
  const ref = result.summary.reflectionEvidence;
  assert.equal(ref.sessionsWithReflection, 0);
  assert.equal(ref.understandingPressure, 0);
  assert.equal(ref.distractionPressure, 0);
  assert.equal(ref.avgReflectionConfidence, null);
});

test('aggregation: distraction in 2/3 sessions → notable distractionPressure', () => {
  const logs: SessionLogInput[] = [
    makeSessionLog({ id: 'a', post_session_reflection: makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 5 }) }),
    makeSessionLog({ id: 'b', post_session_reflection: makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 5 }) }),
    makeSessionLog({ id: 'c', post_session_reflection: makeReflection({ mainIssue: 'no_major_issue', confidenceInAnswers: 5 }) }),
  ];
  const result = aggregateRecentSignals({ sessions: logs, walks: [], plan: null });
  const ref = result.summary.reflectionEvidence;
  assert.equal(ref.sessionsWithReflection, 3);
  assert.ok(ref.distractionPressure > 0.5, `Expected > 0.5, got ${ref.distractionPressure}`);
  assert.equal(ref.understandingPressure, 0);
});

test('aggregation: mixed issues accumulate in respective pressure fields', () => {
  const logs: SessionLogInput[] = [
    makeSessionLog({ id: 'a', post_session_reflection: makeReflection({ mainIssue: 'did_not_understand', confidenceInAnswers: 5 }) }),
    makeSessionLog({ id: 'b', post_session_reflection: makeReflection({ mainIssue: 'handler_inconsistent', confidenceInAnswers: 5 }) }),
    makeSessionLog({ id: 'c', post_session_reflection: makeReflection({ arousalLevel: 'very_up', confidenceInAnswers: 5 }) }),
  ];
  const result = aggregateRecentSignals({ sessions: logs, walks: [], plan: null });
  const ref = result.summary.reflectionEvidence;
  assert.ok(ref.understandingPressure > 0,    `understandingPressure should be > 0`);
  assert.ok(ref.handlerFrictionPressure > 0,  `handlerFrictionPressure should be > 0`);
  assert.ok(ref.arousalPressure > 0,          `arousalPressure should be > 0`);
  assert.equal(ref.sessionsWithReflection, 3);
});

test('aggregation: high-confidence sessions dominate over low-confidence in weighted average', () => {
  const signals = [
    extractSessionSignals(makeSessionLog({ id: 'a', post_session_reflection: makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 5 }) })),
    extractSessionSignals(makeSessionLog({ id: 'b', post_session_reflection: makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 5 }) })),
    extractSessionSignals(makeSessionLog({ id: 'c', post_session_reflection: makeReflection({ mainIssue: 'distracted', confidenceInAnswers: 1 }) })),
  ];
  const ref = aggregateReflectionEvidence(signals);
  // Weighted by confidence: high-conf sessions dominate
  // Two high-conf (1.0 * 1.0 each) + one low-conf (1.0 * 0.2) / total weight
  // Weighted avg = (1.0*1.0 + 1.0*1.0 + 1.0*0.2) / (1.0 + 1.0 + 0.2) = 2.2/2.2 = 1.0
  assert.ok(ref.distractionPressure > 0.9, `Expected close to 1.0, got ${ref.distractionPressure}`);
});

test('aggregation: sessionsWithReflection correctly counts only sessions with reflection data', () => {
  const logs: SessionLogInput[] = [
    makeSessionLog({ id: 'a', post_session_reflection: makeReflection({ confidenceInAnswers: 5 }) }),
    makeSessionLog({ id: 'b', post_session_reflection: null }),
    makeSessionLog({ id: 'c', post_session_reflection: makeReflection({ confidenceInAnswers: 3 }) }),
  ];
  const result = aggregateRecentSignals({ sessions: logs, walks: [], plan: null });
  assert.equal(result.summary.reflectionEvidence.sessionsWithReflection, 2);
});

test('aggregation: avgReflectionConfidence is mean of non-zero values', () => {
  const logs: SessionLogInput[] = [
    makeSessionLog({ id: 'a', post_session_reflection: makeReflection({ confidenceInAnswers: 5 }) }),  // 1.0
    makeSessionLog({ id: 'b', post_session_reflection: makeReflection({ confidenceInAnswers: 1 }) }),  // 0.2
    makeSessionLog({ id: 'c', post_session_reflection: null }),  // excluded
  ];
  const result = aggregateRecentSignals({ sessions: logs, walks: [], plan: null });
  const ref = result.summary.reflectionEvidence;
  // avg of [1.0, 0.2] = 0.6
  assert.ok(ref.avgReflectionConfidence !== null);
  assert.ok(Math.abs(ref.avgReflectionConfidence! - 0.6) < 0.01, `Expected ~0.6, got ${ref.avgReflectionConfidence}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Summary wording — grounded and non-crashing
// ─────────────────────────────────────────────────────────────────────────────

test('summary: buildLearningStateCoachSummary works without reflectionEvidence (backward compat)', () => {
  const state = makeDefaultLearningState();
  let result: ReturnType<typeof buildLearningStateCoachSummary> | null = null;
  assert.doesNotThrow(() => {
    result = buildLearningStateCoachSummary('Buddy', state);
  });
  assert.ok(result !== null);
  assert.ok(result!.summary.length > 0);
  assert.deepEqual(result!.reflectionObservations, []);
});

test('summary: buildLearningStateCoachSummary with null state does not crash', () => {
  let result: ReturnType<typeof buildLearningStateCoachSummary> | null = null;
  assert.doesNotThrow(() => {
    result = buildLearningStateCoachSummary('Buddy', null);
  });
  assert.ok(result !== null);
  assert.deepEqual(result!.reflectionObservations, []);
});

test('summary: reflection observations appear when evidence is strong enough (>= 2 sessions, >= 0.4 pressure)', () => {
  const state = makeDefaultLearningState();
  const reflectionEvidence = {
    understandingPressure:    0.8,
    distractionPressure:      0.5,
    durationBreakdownPressure: 0.1,
    arousalPressure:          0.0,
    handlerFrictionPressure:  0.0,
    sessionsWithReflection:   3,
    avgReflectionConfidence:  0.8,
  };
  const result = buildLearningStateCoachSummary('Max', state, reflectionEvidence);

  assert.ok(result.reflectionObservations.length >= 2, `Expected >= 2 observations, got ${result.reflectionObservations.length}`);
  // Understanding observation should mention the cue
  assert.ok(
    result.reflectionObservations.some((obs) => obs.toLowerCase().includes('understand')),
    `Expected understanding observation in: ${result.reflectionObservations}`,
  );
  // Distraction observation
  assert.ok(
    result.reflectionObservations.some((obs) => obs.toLowerCase().includes('distraction')),
    `Expected distraction observation in: ${result.reflectionObservations}`,
  );
  // Wording uses conservative language
  assert.ok(
    result.reflectionObservations.every((obs) =>
      obs.includes('suggests') || obs.includes('appears') || obs.includes('may'),
    ),
    `All observations should use conservative language: ${result.reflectionObservations}`,
  );
  // Summary contains the observations
  assert.ok(
    result.summary.includes('Handler observations'),
    `Summary should include handler observations block: ${result.summary}`,
  );
});

test('summary: no reflection observations when sessionsWithReflection < 2', () => {
  const state = makeDefaultLearningState();
  const reflectionEvidence = {
    understandingPressure:    0.9,   // high pressure but only 1 session
    distractionPressure:      0.9,
    durationBreakdownPressure: 0.9,
    arousalPressure:          0.9,
    handlerFrictionPressure:  0.9,
    sessionsWithReflection:   1,     // below threshold
    avgReflectionConfidence:  1.0,
  };
  const result = buildLearningStateCoachSummary('Max', state, reflectionEvidence);
  assert.deepEqual(result.reflectionObservations, []);
});

test('summary: low-pressure reflectionEvidence does not produce observations', () => {
  const state = makeDefaultLearningState();
  const reflectionEvidence = {
    understandingPressure:    0.1,   // below 0.4 threshold
    distractionPressure:      0.2,
    durationBreakdownPressure: 0.0,
    arousalPressure:          0.3,
    handlerFrictionPressure:  0.1,
    sessionsWithReflection:   4,
    avgReflectionConfidence:  0.6,
  };
  const result = buildLearningStateCoachSummary('Max', state, reflectionEvidence);
  assert.deepEqual(result.reflectionObservations, []);
});
