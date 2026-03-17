/**
 * tests/mergedSchedule.test.ts
 *
 * Unit tests for the mergeActivePlanSchedules function.
 * Uses node:test + node:assert (same pattern as the rest of the test suite).
 * Runs without any RN/Expo dependencies.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mergeActivePlanSchedules,
  groupEnrichedSessionsByDate,
  sessionTieBreak,
  toLocalDateKey,
  enrichSession,
} from '../lib/mergedSchedule.ts';
import type { Plan, PlanSession } from '../types/index.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const TODAY = '2026-03-17';
const YESTERDAY = '2026-03-16';
const DAY_BEFORE = '2026-03-15';
const TOMORROW = '2026-03-18';
const NEXT_WEEK = '2026-03-24';

function makeSession(overrides: Partial<PlanSession> & { id: string }): PlanSession {
  return {
    exerciseId: 'ex1',
    weekNumber: 1,
    dayNumber: 1,
    title: `Session ${overrides.id}`,
    durationMinutes: 10,
    isCompleted: false,
    ...overrides,
  };
}

function makePlan(overrides: {
  id: string;
  sessions: PlanSession[];
  isPrimary?: boolean;
  priority?: number;
  status?: Plan['status'];
}): Plan {
  return {
    dogId: 'dog1',
    goal: 'Leash Pulling',
    status: overrides.status ?? 'active',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    currentWeek: 1,
    currentStage: 'Stage 1',
    metadata: {},
    createdAt: '2026-01-01T00:00:00Z',
    courseTitle: null,
    priority: overrides.priority ?? 0,
    isPrimary: overrides.isPrimary ?? false,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests: single active plan — parity with single-plan behaviour
// ─────────────────────────────────────────────────────────────────────────────

test('single active plan: today session is recommended', () => {
  const session = makeSession({ id: 's1', scheduledDate: TODAY });
  const plan = makePlan({ id: 'p1', sessions: [session], isPrimary: true });

  const result = mergeActivePlanSchedules([plan], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession?.id, 's1');
  assert.equal(result.todaySessions.length, 1);
  assert.equal(result.missedSessions.length, 0);
  assert.equal(result.upcomingSessions.length, 0);
});

test('single active plan: upcoming session is recommended when nothing due today', () => {
  const session = makeSession({ id: 's1', scheduledDate: TOMORROW });
  const plan = makePlan({ id: 'p1', sessions: [session], isPrimary: true });

  const result = mergeActivePlanSchedules([plan], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession?.id, 's1');
  assert.equal(result.todaySessions.length, 0);
  assert.equal(result.upcomingSessions.length, 1);
});

test('single active plan: overdue session is recommended over nothing', () => {
  const session = makeSession({ id: 's1', scheduledDate: YESTERDAY });
  const plan = makePlan({ id: 'p1', sessions: [session], isPrimary: true });

  const result = mergeActivePlanSchedules([plan], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession?.id, 's1');
  assert.equal(result.missedSessions.length, 1);
  assert.equal(result.todaySessions.length, 0);
});

test('single active plan: null recommendation when plan has no sessions', () => {
  const plan = makePlan({ id: 'p1', sessions: [] });

  const result = mergeActivePlanSchedules([plan], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession, null);
  assert.equal(result.todaySessions.length, 0);
  assert.equal(result.missedSessions.length, 0);
  assert.equal(result.upcomingSessions.length, 0);
});

test('single active plan: completed sessions are not returned', () => {
  const completed = makeSession({ id: 's1', scheduledDate: TODAY, isCompleted: true });
  const upcoming = makeSession({ id: 's2', scheduledDate: TOMORROW });
  const plan = makePlan({ id: 'p1', sessions: [completed, upcoming], isPrimary: true });

  const result = mergeActivePlanSchedules([plan], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession?.id, 's2');
  assert.equal(result.todaySessions.length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: two active plans with sessions on different days
// ─────────────────────────────────────────────────────────────────────────────

test('two active plans: sessions on different days both appear in upcoming', () => {
  const s1 = makeSession({ id: 's1', scheduledDate: TOMORROW });
  const s2 = makeSession({ id: 's2', scheduledDate: NEXT_WEEK });
  const planA = makePlan({ id: 'pA', sessions: [s1], isPrimary: true });
  const planB = makePlan({ id: 'pB', sessions: [s2] });

  const result = mergeActivePlanSchedules([planA, planB], { todayKey: TODAY });

  // Recommended is nearest upcoming (s1 — tomorrow, primary)
  assert.equal(result.recommendedTodaySession?.id, 's1');
  // Both sessions appear in upcoming
  assert.equal(result.upcomingSessions.length, 2);
  assert.equal(result.upcomingSessions[0].id, 's1');
  assert.equal(result.upcomingSessions[1].id, 's2');
  // planId is preserved on enriched sessions
  assert.equal(result.upcomingSessions[0].planId, 'pA');
  assert.equal(result.upcomingSessions[1].planId, 'pB');
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: two active plans with sessions on the same day
// ─────────────────────────────────────────────────────────────────────────────

test('two plans today: primary plan session is recommended', () => {
  const s1 = makeSession({ id: 's1', scheduledDate: TODAY, scheduledTime: '19:00' });
  const s2 = makeSession({ id: 's2', scheduledDate: TODAY, scheduledTime: '08:00' });
  const primary = makePlan({ id: 'pA', sessions: [s1], isPrimary: true, priority: 0 });
  const secondary = makePlan({ id: 'pB', sessions: [s2], isPrimary: false, priority: 0 });

  const result = mergeActivePlanSchedules([primary, secondary], { todayKey: TODAY });

  // Primary plan wins even though s2 is scheduled earlier in the day
  assert.equal(result.recommendedTodaySession?.id, 's1');
  assert.equal(result.todaySessions.length, 2);
  // Recommended session is first
  assert.equal(result.todaySessions[0].id, 's1');
});

test('two plans today: higher priority wins when neither is primary', () => {
  const s1 = makeSession({ id: 's1', scheduledDate: TODAY, scheduledTime: '19:00' });
  const s2 = makeSession({ id: 's2', scheduledDate: TODAY, scheduledTime: '08:00' });
  const lowPriority = makePlan({ id: 'pA', sessions: [s1], isPrimary: false, priority: 1 });
  const highPriority = makePlan({ id: 'pB', sessions: [s2], isPrimary: false, priority: 2 });

  const result = mergeActivePlanSchedules([lowPriority, highPriority], { todayKey: TODAY });

  // Higher priority wins (pB, priority 2)
  assert.equal(result.recommendedTodaySession?.id, 's2');
  assert.equal(result.todaySessions[0].id, 's2');
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: overdue beats today
// ─────────────────────────────────────────────────────────────────────────────

test('overdue session from secondary plan beats today session from primary plan', () => {
  const todaySession = makeSession({ id: 'today', scheduledDate: TODAY });
  const overdueSession = makeSession({ id: 'overdue', scheduledDate: YESTERDAY });
  const primary = makePlan({ id: 'pA', sessions: [todaySession], isPrimary: true });
  const secondary = makePlan({ id: 'pB', sessions: [overdueSession], isPrimary: false });

  const result = mergeActivePlanSchedules([primary, secondary], { todayKey: TODAY });

  // Overdue wins regardless of primary status
  assert.equal(result.recommendedTodaySession?.id, 'overdue');
  assert.equal(result.missedSessions.length, 1);
  assert.equal(result.todaySessions.length, 1);
});

test('two overdue sessions: oldest overdue is recommended', () => {
  const older = makeSession({ id: 'older', scheduledDate: DAY_BEFORE });
  const newer = makeSession({ id: 'newer', scheduledDate: YESTERDAY });
  const planA = makePlan({ id: 'pA', sessions: [older], isPrimary: true });
  const planB = makePlan({ id: 'pB', sessions: [newer] });

  const result = mergeActivePlanSchedules([planA, planB], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession?.id, 'older');
  assert.equal(result.missedSessions[0].id, 'older');
  assert.equal(result.missedSessions[1].id, 'newer');
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: priority tie-breaking within same day
// ─────────────────────────────────────────────────────────────────────────────

test('priority breaks tie when primary status is equal and dates match', () => {
  const s1 = makeSession({ id: 's1', scheduledDate: TODAY, scheduledTime: '10:00' });
  const s2 = makeSession({ id: 's2', scheduledDate: TODAY, scheduledTime: '10:00' });
  const planLow = makePlan({ id: 'pA', sessions: [s1], isPrimary: false, priority: 1 });
  const planHigh = makePlan({ id: 'pB', sessions: [s2], isPrimary: false, priority: 5 });

  const result = mergeActivePlanSchedules([planLow, planHigh], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession?.id, 's2');
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: determinism
// ─────────────────────────────────────────────────────────────────────────────

test('deterministic: identical timestamps produce same result across multiple calls', () => {
  const s1 = makeSession({ id: 'aaa', scheduledDate: TODAY, scheduledTime: '10:00' });
  const s2 = makeSession({ id: 'bbb', scheduledDate: TODAY, scheduledTime: '10:00' });
  const planA = makePlan({ id: 'pX', sessions: [s1], isPrimary: false, priority: 0 });
  const planB = makePlan({ id: 'pY', sessions: [s2], isPrimary: false, priority: 0 });

  const result1 = mergeActivePlanSchedules([planA, planB], { todayKey: TODAY });
  const result2 = mergeActivePlanSchedules([planA, planB], { todayKey: TODAY });
  const result3 = mergeActivePlanSchedules([planB, planA], { todayKey: TODAY });

  // Same recommended regardless of plan input order
  assert.equal(result1.recommendedTodaySession?.id, result2.recommendedTodaySession?.id);
  assert.equal(result1.recommendedTodaySession?.id, result3.recommendedTodaySession?.id);
  // Session id 'aaa' < 'bbb' → 'aaa' wins stable tiebreak
  assert.equal(result1.recommendedTodaySession?.id, 'aaa');
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: paused/inactive plan is ignored
// ─────────────────────────────────────────────────────────────────────────────

test('paused plan is excluded from merge', () => {
  const activeSession = makeSession({ id: 'active', scheduledDate: TODAY });
  const pausedSession = makeSession({ id: 'paused_s', scheduledDate: TODAY });
  const active = makePlan({ id: 'pActive', sessions: [activeSession], isPrimary: true });
  const paused = makePlan({ id: 'pPaused', sessions: [pausedSession], status: 'paused' });

  const result = mergeActivePlanSchedules([active, paused], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession?.id, 'active');
  assert.equal(result.todaySessions.length, 1);
  // Paused plan's session must not appear anywhere
  const allIds = [
    ...result.todaySessions,
    ...result.missedSessions,
    ...result.upcomingSessions,
  ].map((s) => s.id);
  assert.ok(!allIds.includes('paused_s'));
});

test('completed plan is excluded from merge', () => {
  const activeSession = makeSession({ id: 'active', scheduledDate: TODAY });
  const completedPlanSession = makeSession({ id: 'completed_s', scheduledDate: TODAY });
  const active = makePlan({ id: 'pActive', sessions: [activeSession] });
  const completed = makePlan({ id: 'pCompleted', sessions: [completedPlanSession], status: 'completed' });

  const result = mergeActivePlanSchedules([active, completed], { todayKey: TODAY });

  assert.equal(result.todaySessions.length, 1);
  assert.equal(result.todaySessions[0].id, 'active');
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: no sessions due today
// ─────────────────────────────────────────────────────────────────────────────

test('no sessions due today: null recommendedTodaySession but upcoming sessions returned', () => {
  const s1 = makeSession({ id: 's1', scheduledDate: TOMORROW });
  const s2 = makeSession({ id: 's2', scheduledDate: NEXT_WEEK });
  const planA = makePlan({ id: 'pA', sessions: [s1], isPrimary: true });
  const planB = makePlan({ id: 'pB', sessions: [s2] });

  const result = mergeActivePlanSchedules([planA, planB], { todayKey: TODAY });

  // recommendedTodaySession still set to nearest upcoming (not null)
  assert.equal(result.recommendedTodaySession?.id, 's1');
  assert.equal(result.todaySessions.length, 0);
  assert.equal(result.upcomingSessions.length, 2);
});

test('truly null recommendation only when no active sessions exist at all', () => {
  const completed = makeSession({ id: 's1', scheduledDate: TODAY, isCompleted: true });
  const plan = makePlan({ id: 'p1', sessions: [completed] });

  const result = mergeActivePlanSchedules([plan], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession, null);
});

test('empty plans array returns null recommendation and empty lists', () => {
  const result = mergeActivePlanSchedules([], { todayKey: TODAY });

  assert.equal(result.recommendedTodaySession, null);
  assert.equal(result.todaySessions.length, 0);
  assert.equal(result.missedSessions.length, 0);
  assert.equal(result.upcomingSessions.length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: enriched session metadata
// ─────────────────────────────────────────────────────────────────────────────

test('enriched sessions carry planId, planGoal, planCourseTitle, isPrimaryPlan', () => {
  const session = makeSession({ id: 's1', scheduledDate: TODAY });
  const plan = makePlan({
    id: 'p1',
    sessions: [session],
    isPrimary: true,
  });
  // Mutate to add courseTitle (Plan interface allows null)
  (plan as any).courseTitle = 'Loose Leash Walking';

  const result = mergeActivePlanSchedules([plan], { todayKey: TODAY });
  const enriched = result.todaySessions[0];

  assert.ok(enriched);
  assert.equal(enriched.planId, 'p1');
  assert.equal(enriched.planGoal, 'Leash Pulling');
  assert.equal(enriched.planCourseTitle, 'Loose Leash Walking');
  assert.equal(enriched.isPrimaryPlan, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: upcoming limit
// ─────────────────────────────────────────────────────────────────────────────

test('upcomingLimit caps the returned upcoming sessions', () => {
  const sessions = Array.from({ length: 20 }, (_, i) =>
    makeSession({ id: `s${i}`, scheduledDate: `2026-04-${String(i + 1).padStart(2, '0')}` })
  );
  const plan = makePlan({ id: 'p1', sessions });

  const result = mergeActivePlanSchedules([plan], { todayKey: TODAY, upcomingLimit: 5 });

  assert.equal(result.upcomingSessions.length, 5);
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: groupEnrichedSessionsByDate
// ─────────────────────────────────────────────────────────────────────────────

test('groupEnrichedSessionsByDate groups by date and sorts by time', () => {
  const plan = makePlan({ id: 'p1', sessions: [] });
  const s1 = enrichSession(makeSession({ id: 's1', scheduledDate: TODAY, scheduledTime: '19:00' }), plan);
  const s2 = enrichSession(makeSession({ id: 's2', scheduledDate: TODAY, scheduledTime: '08:00' }), plan);
  const s3 = enrichSession(makeSession({ id: 's3', scheduledDate: TOMORROW, scheduledTime: '10:00' }), plan);

  const grouped = groupEnrichedSessionsByDate([s1, s2, s3]);

  assert.ok(grouped[TODAY]);
  assert.equal(grouped[TODAY].length, 2);
  // Earlier time first within same day
  assert.equal(grouped[TODAY][0].id, 's2');
  assert.equal(grouped[TODAY][1].id, 's1');
  assert.ok(grouped[TOMORROW]);
  assert.equal(grouped[TOMORROW].length, 1);
});

test('groupEnrichedSessionsByDate skips sessions without scheduledDate', () => {
  const plan = makePlan({ id: 'p1', sessions: [] });
  const undated = enrichSession(makeSession({ id: 'u1' }), plan);
  const dated = enrichSession(makeSession({ id: 'd1', scheduledDate: TODAY }), plan);

  const grouped = groupEnrichedSessionsByDate([undated, dated]);

  assert.equal(Object.keys(grouped).length, 1);
  assert.ok(grouped[TODAY]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: sessionTieBreak
// ─────────────────────────────────────────────────────────────────────────────

test('sessionTieBreak: primary beats non-primary', () => {
  const plan = makePlan({ id: 'p1', sessions: [] });
  const nonPrimary = enrichSession(makeSession({ id: 'np', scheduledDate: TODAY }), plan);
  const primaryPlan = makePlan({ id: 'p2', sessions: [], isPrimary: true });
  const primary = enrichSession(makeSession({ id: 'p', scheduledDate: TODAY }), primaryPlan);

  assert.ok(sessionTieBreak(primary, nonPrimary) < 0, 'primary should sort before non-primary');
  assert.ok(sessionTieBreak(nonPrimary, primary) > 0, 'non-primary should sort after primary');
});

test('sessionTieBreak: higher _planPriority wins when primary status equal', () => {
  const plan = makePlan({ id: 'p1', sessions: [] });
  const low = Object.assign(
    enrichSession(makeSession({ id: 'lo', scheduledDate: TODAY }), plan),
    { _planPriority: 1 }
  );
  const high = Object.assign(
    enrichSession(makeSession({ id: 'hi', scheduledDate: TODAY }), plan),
    { _planPriority: 5 }
  );

  assert.ok(sessionTieBreak(high, low) < 0);
  assert.ok(sessionTieBreak(low, high) > 0);
});

test('sessionTieBreak: stable id fallback when everything else is equal', () => {
  const plan = makePlan({ id: 'p1', sessions: [] });
  const aaa = enrichSession(makeSession({ id: 'aaa', scheduledDate: TODAY }), plan);
  const bbb = enrichSession(makeSession({ id: 'bbb', scheduledDate: TODAY }), plan);

  assert.ok(sessionTieBreak(aaa, bbb) < 0, '"aaa" < "bbb" alphabetically');
  assert.ok(sessionTieBreak(bbb, aaa) > 0);
  assert.equal(sessionTieBreak(aaa, aaa), 0);
});
