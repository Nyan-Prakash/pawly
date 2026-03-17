import test from 'node:test';
import assert from 'node:assert';
import { getMonthGrid, toDateKey, groupSessionsByDate, getDayStatus } from '../lib/calendarSessions.ts';
import type { PlanSession } from '../types/index.ts';

test('toDateKey formats date correctly', () => {
  const date = new Date(2023, 9, 15); // Oct 15, 2023
  assert.strictEqual(toDateKey(date), '2023-10-15');
});

test('getMonthGrid returns 6 weeks of days', () => {
  const grid = getMonthGrid(2023, 9); // Oct 2023
  assert.strictEqual(grid.length, 6);
  assert.strictEqual(grid[0].length, 7);

  // Oct 1, 2023 was a Sunday. So the grid should start on Oct 1.
  assert.strictEqual(grid[0][0].dateKey, '2023-10-01');
});

test('groupSessionsByDate groups sessions correctly', () => {
  const sessions: PlanSession[] = [
    { id: '1', title: 'Session 1', scheduledDate: '2023-10-15', scheduledTime: '10:00', isCompleted: false, weekNumber: 1, dayNumber: 1, durationMinutes: 10, exerciseId: 'ex1' },
    { id: '2', title: 'Session 2', scheduledDate: '2023-10-15', scheduledTime: '09:00', isCompleted: true, weekNumber: 1, dayNumber: 1, durationMinutes: 10, exerciseId: 'ex2' },
    { id: '3', title: 'Session 3', scheduledDate: '2023-10-16', scheduledTime: '11:00', isCompleted: false, weekNumber: 1, dayNumber: 2, durationMinutes: 10, exerciseId: 'ex3' },
  ];

  const grouped = groupSessionsByDate(sessions);

  assert.ok(grouped['2023-10-15']);
  assert.strictEqual(grouped['2023-10-15'].length, 2);
  // Should be sorted by time
  assert.strictEqual(grouped['2023-10-15'][0].id, '2');
  assert.strictEqual(grouped['2023-10-15'][1].id, '1');

  assert.ok(grouped['2023-10-16']);
  assert.strictEqual(grouped['2023-10-16'].length, 1);
});

test('getDayStatus calculates status correctly', () => {
  const grouped = {
    '2023-10-15': [
      { id: '1', isCompleted: true } as PlanSession,
      { id: '2', isCompleted: true } as PlanSession,
    ],
    '2023-10-16': [
      { id: '3', isCompleted: false } as PlanSession,
    ],
    '2023-10-17': [
      { id: '4', isCompleted: true } as PlanSession,
      { id: '5', isCompleted: false } as PlanSession,
    ],
  };

  const status15 = getDayStatus('2023-10-15', grouped);
  assert.strictEqual(status15.hasSessions, true);
  assert.strictEqual(status15.allCompleted, true);
  assert.strictEqual(status15.hasUpcoming, false);

  const status16 = getDayStatus('2023-10-16', grouped);
  assert.strictEqual(status16.hasSessions, true);
  assert.strictEqual(status16.allCompleted, false);
  assert.strictEqual(status16.hasUpcoming, true);

  const status17 = getDayStatus('2023-10-17', grouped);
  assert.strictEqual(status17.hasSessions, true);
  assert.strictEqual(status17.allCompleted, false);
  assert.strictEqual(status17.hasUpcoming, true);

  const status18 = getDayStatus('2023-10-18', grouped);
  assert.strictEqual(status18.hasSessions, false);
});
