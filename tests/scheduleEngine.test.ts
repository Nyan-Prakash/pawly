import assert from 'node:assert/strict';
import test from 'node:test';

import {
  chooseDurationForSession,
  chooseTimeForDay,
  chooseTrainingDays,
  getTodaySession,
  rescheduleMissedSession,
} from '../lib/scheduleEngine.ts';
import type { Plan, PlanSession, TrainingSchedulePrefs } from '../types/index.ts';

function makePrefs(overrides: Partial<TrainingSchedulePrefs> = {}): TrainingSchedulePrefs {
  return {
    preferredTrainingDays: ['tuesday', 'thursday', 'saturday'],
    preferredTrainingWindows: {
      tuesday: ['evening'],
      thursday: ['evening'],
      saturday: ['morning'],
    },
    preferredTrainingTimes: {},
    usualWalkTimes: [],
    sessionStyle: 'balanced',
    scheduleFlexibility: 'move_next_slot',
    scheduleIntensity: 'balanced',
    blockedDays: [],
    blockedDates: [],
    timezone: 'America/New_York',
    ...overrides,
  };
}

function makeSessions(count = 6): PlanSession[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `session_${index + 1}`,
    exerciseId: `exercise_${index + 1}`,
    weekNumber: Math.floor(index / 3) + 1,
    dayNumber: (index % 3) + 1,
    title: `Session ${index + 1}`,
    durationMinutes: 10,
    isCompleted: false,
  }));
}

test('prefers Tue/Thu/Sat for a 3x weekly plan', () => {
  const prefs = makePrefs();
  const trainingDays = chooseTrainingDays({
    sessionsPerWeek: 3,
    availableDaysPerWeek: 3,
    prefs,
  });

  assert.deepEqual(trainingDays, ['tuesday', 'thursday', 'saturday']);
});

test('uses window defaults when exact times are not set', () => {
  const prefs = makePrefs({
    preferredTrainingWindows: {
      tuesday: ['evening'],
    },
  });

  assert.equal(chooseTimeForDay('tuesday', prefs), '19:00');
});

test('blocked days are excluded from selected training days', () => {
  const prefs = makePrefs({
    blockedDays: ['tuesday', 'thursday'],
  });

  const trainingDays = chooseTrainingDays({
    sessionsPerWeek: 3,
    availableDaysPerWeek: 3,
    prefs,
  });

  assert.equal(trainingDays.includes('tuesday'), false);
  assert.equal(trainingDays.includes('thursday'), false);
});

test('gentle schedules produce wider spacing than aggressive ones', () => {
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const gentle = chooseTrainingDays({
    sessionsPerWeek: 4,
    availableDaysPerWeek: 4,
    prefs: makePrefs({
      preferredTrainingDays: [...allDays],
      scheduleIntensity: 'gentle',
    }),
  });
  const aggressive = chooseTrainingDays({
    sessionsPerWeek: 4,
    availableDaysPerWeek: 4,
    prefs: makePrefs({
      preferredTrainingDays: [...allDays],
      scheduleIntensity: 'aggressive',
    }),
  });

  assert.notDeepEqual(gentle, aggressive);
});

test('micro sessions are shorter than focused sessions', () => {
  const micro = chooseDurationForSession({
    sessionStyle: 'micro',
    scheduleIntensity: 'balanced',
    availableMinutesPerDay: 20,
    scheduledDay: 'tuesday',
    sequenceIndex: 0,
  });
  const focused = chooseDurationForSession({
    sessionStyle: 'focused',
    scheduleIntensity: 'balanced',
    availableMinutesPerDay: 20,
    scheduledDay: 'saturday',
    sequenceIndex: 0,
  });

  assert.ok(micro < focused);
});

test('missed sessions can move to the next slot', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateKey = yesterday.toISOString().split('T')[0]!;

  const plan: Plan = {
    id: 'plan_1',
    dogId: 'dog_1',
    goal: 'Leash Pulling',
    status: 'active',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    currentWeek: 1,
    currentStage: 'Stage 1',
    metadata: {
      preferredDays: ['tuesday', 'thursday', 'saturday'],
      flexibility: 'move_next_slot',
      intensity: 'balanced',
      timezone: 'America/New_York',
    },
    sessions: [
      {
        ...makeSessions(1)[0]!,
        scheduledDate: dateKey,
        scheduledDay: 'thursday',
        scheduledTime: '19:00',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const updated = rescheduleMissedSession(plan, 'session_1', makePrefs());
  assert.notEqual(updated.sessions[0]?.scheduledDate, dateKey);
  assert.equal(updated.sessions[0]?.autoRescheduledFrom, dateKey);
});

test('older plans without schedule metadata still return the next incomplete session', () => {
  const sessions = makeSessions(3);
  sessions[0]!.isCompleted = true;

  const plan: Plan = {
    id: 'plan_legacy',
    dogId: 'dog_1',
    goal: 'Settling',
    status: 'active',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    currentWeek: 1,
    currentStage: 'Stage 1',
    sessions,
    createdAt: new Date().toISOString(),
  };

  assert.equal(getTodaySession(plan)?.id, 'session_2');
});

test('outdoor goals bias session timing to walk times when possible', () => {
  const prefs = makePrefs({
    preferredTrainingWindows: {
      tuesday: ['evening'],
    },
    usualWalkTimes: ['18:30'],
  });

  assert.equal(chooseTimeForDay('tuesday', prefs, undefined, 'Leash Pulling'), '18:30');
});
