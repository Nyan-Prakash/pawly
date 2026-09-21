import assert from 'node:assert/strict';
import test from 'node:test';

import { buildStreakReminderCopy, resolveStreakReminder } from '../lib/streakReminder.ts';

// Wednesday 23 Sep 2026, 10:00 local
const MORNING = new Date(2026, 8, 23, 10, 0, 0, 0);
const LATE_EVENING = new Date(2026, 8, 23, 21, 0, 0, 0);

test('trained yesterday with a streak: reminds this evening at 19:30', () => {
  const plan = resolveStreakReminder({ currentStreak: 4, lastSessionDate: '2026-09-22', now: MORNING });
  assert.ok(plan);
  assert.equal(plan.streakDays, 4);
  assert.deepEqual(
    [plan.fireAt.getFullYear(), plan.fireAt.getMonth(), plan.fireAt.getDate(), plan.fireAt.getHours(), plan.fireAt.getMinutes()],
    [2026, 8, 23, 19, 30]
  );
});

test('trained today: the reminder moves to tomorrow evening', () => {
  const plan = resolveStreakReminder({ currentStreak: 5, lastSessionDate: '2026-09-23', now: MORNING });
  assert.ok(plan);
  assert.equal(plan.streakDays, 5);
  assert.equal(plan.fireAt.getDate(), 24);
  assert.equal(plan.fireAt.getHours(), 19);
  assert.equal(plan.fireAt.getMinutes(), 30);
});

test('trained today after the reminder time still schedules tomorrow', () => {
  const plan = resolveStreakReminder({ currentStreak: 2, lastSessionDate: '2026-09-23', now: LATE_EVENING });
  assert.equal(plan?.fireAt.getDate(), 24);
});

test('not trained today and the reminder time has passed: nothing to schedule', () => {
  assert.equal(resolveStreakReminder({ currentStreak: 4, lastSessionDate: '2026-09-22', now: LATE_EVENING }), null);
});

test('a streak under two days is not worth a reminder', () => {
  assert.equal(resolveStreakReminder({ currentStreak: 1, lastSessionDate: '2026-09-22', now: MORNING }), null);
  assert.equal(resolveStreakReminder({ currentStreak: 1, lastSessionDate: '2026-09-23', now: MORNING }), null);
  assert.equal(resolveStreakReminder({ currentStreak: 0, lastSessionDate: null, now: MORNING }), null);
});

test('a streak that already lapsed gets no reminder, whatever the stored count says', () => {
  assert.equal(resolveStreakReminder({ currentStreak: 9, lastSessionDate: '2026-09-20', now: MORNING }), null);
});

test('month boundaries: yesterday and tomorrow cross months correctly', () => {
  const firstOfMonth = new Date(2026, 9, 1, 8, 0, 0, 0);
  const tonight = resolveStreakReminder({ currentStreak: 3, lastSessionDate: '2026-09-30', now: firstOfMonth });
  assert.equal(tonight?.fireAt.getDate(), 1);

  const lastOfMonth = new Date(2026, 8, 30, 8, 0, 0, 0);
  const tomorrow = resolveStreakReminder({ currentStreak: 3, lastSessionDate: '2026-09-30', now: lastOfMonth });
  assert.equal(tomorrow?.fireAt.getMonth(), 9);
  assert.equal(tomorrow?.fireAt.getDate(), 1);
});

test('a custom reminder time is honoured', () => {
  const plan = resolveStreakReminder({
    currentStreak: 3,
    lastSessionDate: '2026-09-22',
    now: MORNING,
    reminderTime: '20:15',
  });
  assert.equal(plan?.fireAt.getHours(), 20);
  assert.equal(plan?.fireAt.getMinutes(), 15);
});

test('copy names the dog and the streak, with no exclamation marks', () => {
  const copy = buildStreakReminderCopy('Biscuit', 6);
  assert.equal(copy.title, "Keep Biscuit's streak going");
  assert.equal(copy.body, '6 days in a row. A five-minute session tonight keeps it.');
  assert.ok(!`${copy.title}${copy.body}`.includes('!'));
});
