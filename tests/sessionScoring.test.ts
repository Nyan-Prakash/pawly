import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ABANDON_MIN_TRAINING_SECONDS,
  computeStreakUpdate,
  formatDuration,
  isSetupStep,
  localDateKey,
  outcomeToDifficulty,
  outcomeToPlanRating,
  outcomeToSuccessScore,
  shouldLogAbandonedSession,
  summarizeStepOutcomes,
} from '../lib/sessionScoring.ts';

test('outcome scores: met=5, partial=3, not_met=2; struggles knock a met session to 4', () => {
  assert.equal(outcomeToSuccessScore('met'), 5);
  assert.equal(outcomeToSuccessScore('met', [{ outcome: 'success' }]), 5);
  assert.equal(outcomeToSuccessScore('met', [{ outcome: 'struggled' }]), 4);
  assert.equal(outcomeToSuccessScore('met', [{ outcome: 'skipped' }]), 4);
  assert.equal(outcomeToSuccessScore('partial', [{ outcome: 'struggled' }]), 3);
  assert.equal(outcomeToSuccessScore('not_met'), 2);
});

test('plan rating and log score are the same number', () => {
  for (const o of ['met', 'partial', 'not_met'] as const) {
    assert.equal(outcomeToPlanRating(o), outcomeToSuccessScore(o));
  }
});

test('difficulty is derived from outcome for the DB check constraint', () => {
  assert.equal(outcomeToDifficulty('met'), 'easy');
  assert.equal(outcomeToDifficulty('partial'), 'okay');
  assert.equal(outcomeToDifficulty('not_met'), 'hard');
});

test('setup steps have neither timer nor reps', () => {
  assert.equal(isSetupStep({ durationSeconds: null, reps: null }), true);
  assert.equal(isSetupStep({ durationSeconds: 60, reps: null }), false);
  assert.equal(isSetupStep({ durationSeconds: null, reps: 10 }), false);
});

test('summarizeStepOutcomes counts each bucket', () => {
  const summary = summarizeStepOutcomes([
    { outcome: 'success' },
    { outcome: 'success' },
    { outcome: 'struggled' },
    { outcome: 'skipped' },
  ]);
  assert.deepEqual(summary, { success: 2, struggled: 1, skipped: 1, total: 4 });
});

test('leaving from the intro never logs an abandoned session', () => {
  assert.equal(shouldLogAbandonedSession({ state: 'INTRO', stepResultCount: 0, secondsTraining: null }), false);
  assert.equal(shouldLogAbandonedSession({ state: 'INTRO', stepResultCount: 0, secondsTraining: 600 }), false);
  assert.equal(shouldLogAbandonedSession({ state: 'LOADING', stepResultCount: 0, secondsTraining: 0 }), false);
});

test('bailing on the first step only counts after a real attempt', () => {
  assert.equal(
    shouldLogAbandonedSession({ state: 'STEP_ACTIVE', stepResultCount: 0, secondsTraining: 10 }),
    false,
  );
  assert.equal(
    shouldLogAbandonedSession({
      state: 'STEP_ACTIVE',
      stepResultCount: 0,
      secondsTraining: ABANDON_MIN_TRAINING_SECONDS,
    }),
    true,
  );
  assert.equal(shouldLogAbandonedSession({ state: 'STEP_ACTIVE', stepResultCount: 1, secondsTraining: 0 }), true);
  assert.equal(shouldLogAbandonedSession({ state: 'SESSION_REVIEW', stepResultCount: 4, secondsTraining: 300 }), true);
});

test('localDateKey uses the local calendar date, not UTC', () => {
  // 23:30 local on Jan 1 — the UTC date may already be Jan 2 in western zones.
  const d = new Date(2026, 0, 1, 23, 30);
  assert.equal(localDateKey(d), '2026-01-01');
  assert.equal(localDateKey(new Date(2026, 8, 7, 0, 5)), '2026-09-07');
});

test('streak: already trained today → no write', () => {
  const today = new Date(2026, 8, 7, 21, 0);
  const result = computeStreakUpdate(
    { current_streak: 3, longest_streak: 5, last_session_date: '2026-09-07' },
    today,
  );
  assert.equal(result, null);
});

test('streak: consecutive day increments and updates longest', () => {
  const today = new Date(2026, 8, 7, 21, 0);
  const result = computeStreakUpdate(
    { current_streak: 5, longest_streak: 5, last_session_date: '2026-09-06' },
    today,
  );
  assert.deepEqual(result, { current_streak: 6, longest_streak: 6, last_session_date: '2026-09-07' });
});

test('streak: gap resets to 1 but keeps longest', () => {
  const today = new Date(2026, 8, 7, 9, 0);
  const result = computeStreakUpdate(
    { current_streak: 5, longest_streak: 9, last_session_date: '2026-09-01' },
    today,
  );
  assert.deepEqual(result, { current_streak: 1, longest_streak: 9, last_session_date: '2026-09-07' });
});

test('streak: month boundary counts as consecutive', () => {
  const today = new Date(2026, 9, 1, 8, 0); // Oct 1
  const result = computeStreakUpdate(
    { current_streak: 2, longest_streak: 2, last_session_date: '2026-09-30' },
    today,
  );
  assert.equal(result?.current_streak, 3);
});

test('formatDuration', () => {
  assert.equal(formatDuration(45), '45 sec');
  assert.equal(formatDuration(60), '1 min');
  assert.equal(formatDuration(125), '2 min 5 sec');
  assert.equal(formatDuration(-3), '0 sec');
});
