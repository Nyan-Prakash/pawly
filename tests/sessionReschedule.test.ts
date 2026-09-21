import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMoveDateOptions,
  moveSessionToDate,
  parseDateKey,
  skipSessionToNextTrainingDay,
} from '../lib/sessionReschedule.ts';
import type { Plan, PlanSession, Weekday } from '../types/index.ts';

// Monday 21 Sep 2026
const NOW = new Date(2026, 8, 21, 9, 0, 0, 0);

function makeSession(id: string, scheduledDate: string, scheduledDay: Weekday, overrides: Partial<PlanSession> = {}): PlanSession {
  return {
    id,
    exerciseId: `exercise_${id}`,
    weekNumber: 1,
    dayNumber: 1,
    title: `Session ${id}`,
    durationMinutes: 10,
    isCompleted: false,
    scheduledDate,
    scheduledDay,
    scheduledTime: '19:00',
    ...overrides,
  };
}

function makePlan(sessions: PlanSession[], preferredDays: Weekday[] = ['tuesday', 'thursday', 'saturday']): Plan {
  return {
    id: 'plan_1',
    dogId: 'dog_1',
    goal: 'Leash Pulling',
    status: 'active',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    currentWeek: 1,
    currentStage: 'Stage 1',
    sessions,
    metadata: { preferredDays },
    createdAt: NOW.toISOString(),
    courseTitle: null,
    priority: 0,
    isPrimary: true,
  };
}

function dates(plan: Plan): Record<string, string | undefined> {
  return Object.fromEntries(plan.sessions.map((session) => [session.id, session.scheduledDate]));
}

test('parseDateKey rejects malformed and impossible dates', () => {
  assert.equal(parseDateKey('2026-02-30'), null);
  assert.equal(parseDateKey('tomorrow'), null);
  assert.equal(parseDateKey('2026-09-21')?.getDate(), 21);
});

test('getMoveDateOptions offers seven days starting today', () => {
  const options = getMoveDateOptions({ scheduledDate: '2026-10-15' }, NOW);
  assert.equal(options.length, 7);
  assert.equal(options[0]?.dateKey, '2026-09-21');
  assert.equal(options[0]?.isToday, true);
  assert.equal(options[6]?.dateKey, '2026-09-27');
});

test('getMoveDateOptions leaves out the day the session is already on', () => {
  const options = getMoveDateOptions({ scheduledDate: '2026-09-22' }, NOW);
  assert.equal(options.length, 7);
  assert.ok(!options.some((option) => option.dateKey === '2026-09-22'));
  assert.equal(options[6]?.dateKey, '2026-09-28');
});

test('getMoveDateOptions crosses a month boundary', () => {
  const options = getMoveDateOptions({ scheduledDate: undefined }, new Date(2026, 8, 28, 9, 0, 0, 0));
  assert.deepEqual(options.map((option) => option.dateKey).slice(-4), [
    '2026-10-01',
    '2026-10-02',
    '2026-10-03',
    '2026-10-04',
  ]);
});

test('moveSessionToDate updates date and weekday, keeps the time, clears the missed flag', () => {
  const plan = makePlan([makeSession('a', '2026-09-17', 'thursday', { isMissed: true }), makeSession('b', '2026-09-22', 'tuesday')]);
  const moved = moveSessionToDate(plan, 'a', '2026-09-23');
  const session = moved.sessions[0]!;

  assert.equal(session.scheduledDate, '2026-09-23');
  assert.equal(session.scheduledDay, 'wednesday');
  assert.equal(session.scheduledTime, '19:00');
  assert.equal(session.isMissed, false);
  assert.equal(session.autoRescheduledFrom, undefined);
  assert.equal(moved.sessions[1], plan.sessions[1]);
  assert.equal(plan.sessions[0]!.scheduledDate, '2026-09-17');
});

test('moveSessionToDate is a no-op for completed sessions, unknown ids, bad dates and the same day', () => {
  const plan = makePlan([
    makeSession('a', '2026-09-22', 'tuesday'),
    makeSession('done', '2026-09-17', 'thursday', { isCompleted: true }),
  ]);
  assert.equal(moveSessionToDate(plan, 'done', '2026-09-23'), plan);
  assert.equal(moveSessionToDate(plan, 'missing', '2026-09-23'), plan);
  assert.equal(moveSessionToDate(plan, 'a', 'not-a-date'), plan);
  assert.equal(moveSessionToDate(plan, 'a', '2026-09-22'), plan);
});

test('skip shifts the session and everything after it back one slot, keeping the order', () => {
  const plan = makePlan([
    makeSession('a', '2026-09-22', 'tuesday'),
    makeSession('b', '2026-09-24', 'thursday'),
    makeSession('c', '2026-09-26', 'saturday', { scheduledTime: '09:00' }),
  ]);
  const skipped = skipSessionToNextTrainingDay(plan, 'a', NOW);

  assert.deepEqual(dates(skipped), { a: '2026-09-24', b: '2026-09-26', c: '2026-09-29' });
  assert.equal(skipped.sessions[0]!.scheduledDay, 'thursday');
  assert.equal(skipped.sessions[1]!.scheduledTime, '09:00');
  assert.equal(skipped.sessions[2]!.scheduledDay, 'tuesday');
  assert.equal(skipped.sessions[0]!.schedulingReason, 'skipped_by_owner');
});

test('skip with nothing after it moves the session to the next training day', () => {
  const plan = makePlan([makeSession('a', '2026-09-22', 'tuesday')]);
  assert.deepEqual(dates(skipSessionToNextTrainingDay(plan, 'a', NOW)), { a: '2026-09-24' });
});

test('skipping a missed session pushes from today, never into the past', () => {
  const plan = makePlan([
    makeSession('missed', '2026-09-17', 'thursday', { isMissed: true }),
    makeSession('also_missed', '2026-09-19', 'saturday'),
    makeSession('next', '2026-09-22', 'tuesday'),
  ]);
  const skipped = skipSessionToNextTrainingDay(plan, 'missed', NOW);

  assert.deepEqual(dates(skipped), {
    missed: '2026-09-22',
    also_missed: '2026-09-19',
    next: '2026-09-24',
  });
  assert.equal(skipped.sessions[0]!.isMissed, false);
});

test('skip leaves completed sessions and earlier sessions alone', () => {
  const plan = makePlan([
    makeSession('done', '2026-09-24', 'thursday', { isCompleted: true }),
    makeSession('a', '2026-09-22', 'tuesday'),
    makeSession('b', '2026-09-26', 'saturday'),
  ]);
  const skipped = skipSessionToNextTrainingDay(plan, 'a', NOW);
  assert.deepEqual(dates(skipped), { done: '2026-09-24', a: '2026-09-26', b: '2026-09-29' });
});

test('skip falls back to the weekdays in use when the plan has no metadata', () => {
  const plan = { ...makePlan([makeSession('a', '2026-09-23', 'wednesday')]), metadata: undefined };
  assert.deepEqual(dates(skipSessionToNextTrainingDay(plan, 'a', NOW)), { a: '2026-09-30' });
});

test('skip is a no-op for completed or undated sessions', () => {
  const plan = makePlan([
    makeSession('done', '2026-09-22', 'tuesday', { isCompleted: true }),
    makeSession('undated', '2026-09-24', 'thursday', { scheduledDate: undefined }),
  ]);
  assert.equal(skipSessionToNextTrainingDay(plan, 'done', NOW), plan);
  assert.equal(skipSessionToNextTrainingDay(plan, 'undated', NOW), plan);
});
