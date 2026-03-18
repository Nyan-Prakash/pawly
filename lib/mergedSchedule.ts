/**
 * mergedSchedule.ts
 *
 * Pure, deterministic scheduling logic that merges sessions across multiple
 * active plans for a single dog. No side effects, no Supabase, no Zustand.
 * Designed to be the single source of truth for what the app should show the
 * user when they have more than one active training course.
 *
 * All per-plan session logic (getTodaySession, getUpcomingSessions,
 * getMissedScheduledSessions) is still per-plan — this module only handles
 * the cross-plan merge and recommendation layer.
 */

import { getMissedScheduledSessions, getTodaySession, getUpcomingSessions } from './scheduleEngine.ts';
import type { EnrichedPlanSession, Plan, PlanSession } from '../types/index.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MergedScheduleResult {
  /** The single session the app should surface as the primary CTA for today. */
  recommendedTodaySession: EnrichedPlanSession | null;
  /**
   * All sessions across active plans that are scheduled for today (not completed).
   * The recommended session is always first; the rest follow the tie-break order.
   */
  todaySessions: EnrichedPlanSession[];
  /**
   * All overdue (missed) sessions across active plans, oldest first.
   * These are sessions whose scheduledDate is before today and are not completed.
   */
  missedSessions: EnrichedPlanSession[];
  /**
   * Upcoming (future) sessions across active plans, earliest scheduled first.
   * Does NOT include today sessions. Capped at `limit` (default 10).
   */
  upcomingSessions: EnrichedPlanSession[];
}

export interface MergeOptions {
  /**
   * Maximum number of upcoming sessions to return (default 10).
   * Does not affect today or missed session lists.
   */
  upcomingLimit?: number;
  /**
   * Injected "today" key for testing without mocking Date (YYYY-MM-DD).
   * Defaults to today's local date.
   */
  todayKey?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers (local, consistent with scheduleEngine's toDateKey)
// ─────────────────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session enrichment
// ─────────────────────────────────────────────────────────────────────────────

export function enrichSession(session: PlanSession, plan: Plan): EnrichedPlanSession {
  return {
    ...session,
    planId: plan.id,
    planGoal: plan.goal,
    planCourseTitle: plan.courseTitle,
    isPrimaryPlan: plan.isPrimary,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tie-break comparator
//
// Applied in recommendation choice AND list sorting. The full order is:
//
//   1. Overdue sessions sort before today sessions (oldest overdue first)
//   2. Primary plan first (isPrimary = true wins)
//   3. Higher plan priority value first (e.g. priority 2 > priority 1)
//   4. Earlier scheduledDate first
//   5. Earlier scheduledTime first (within same date)
//   6. Stable fallback: lexicographic sessionId then planId to prevent jitter
//
// The comparator intentionally has no knowledge of "today" — callers are
// responsible for deciding which bucket (overdue / today / upcoming) a session
// belongs to before invoking the sort.
// ─────────────────────────────────────────────────────────────────────────────

export function sessionTieBreak(
  a: EnrichedPlanSession & { _planPriority?: number },
  b: EnrichedPlanSession & { _planPriority?: number }
): number {
  // 2. Primary plan wins
  if (a.isPrimaryPlan !== b.isPrimaryPlan) {
    return a.isPrimaryPlan ? -1 : 1;
  }

  // 3. Higher plan priority wins (numbers: higher = better)
  const pa = a._planPriority ?? 0;
  const pb = b._planPriority ?? 0;
  if (pa !== pb) return pb - pa;

  // 4. Earlier date first
  const da = a.scheduledDate ?? '';
  const db = b.scheduledDate ?? '';
  if (da !== db) return da.localeCompare(db);

  // 5. Earlier time first
  const ta = a.scheduledTime ?? '';
  const tb = b.scheduledTime ?? '';
  if (ta !== tb) return ta.localeCompare(tb);

  // 6. Stable fallback
  const idCmp = a.id.localeCompare(b.id);
  if (idCmp !== 0) return idCmp;
  return a.planId.localeCompare(b.planId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Overdue vs today vs upcoming partition
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify a session relative to todayKey.
 *   - 'overdue'   : scheduledDate < todayKey (not completed)
 *   - 'today'     : scheduledDate === todayKey (not completed)
 *   - 'upcoming'  : scheduledDate > todayKey, or undated (not completed)
 */
function classifySession(session: PlanSession, todayKey: string): 'overdue' | 'today' | 'upcoming' {
  if (!session.scheduledDate) return 'upcoming';
  if (session.scheduledDate < todayKey) return 'overdue';
  if (session.scheduledDate === todayKey) return 'today';
  return 'upcoming';
}

// ─────────────────────────────────────────────────────────────────────────────
// mergeActivePlanSchedules
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merge sessions from all active plans for a dog into a single prioritized
 * schedule view.
 *
 * Pure function — safe to call from stores, selectors, tests, or server code.
 * Each plan must have status === 'active'; paused/completed plans are ignored.
 *
 * Recommendation algorithm:
 *   1. If any overdue sessions exist, the highest-priority overdue session is
 *      the recommendation (overdue takes precedence over on-time).
 *   2. Otherwise, the highest-priority today session is the recommendation.
 *   3. If no today or overdue sessions, the nearest upcoming session is the
 *      recommendation.
 *
 * "Highest priority" is determined by the tie-break order above.
 */
export function mergeActivePlanSchedules(
  plans: Plan[],
  options: MergeOptions = {}
): MergedScheduleResult {
  const todayKey = options.todayKey ?? toLocalDateKey(new Date());
  const upcomingLimit = options.upcomingLimit ?? 10;

  const missed: EnrichedPlanSession[] = [];
  const today: EnrichedPlanSession[] = [];
  const upcoming: EnrichedPlanSession[] = [];

  for (const plan of plans) {
    // Only merge active plans
    if (plan.status !== 'active') continue;

    // ── Overdue (missed) sessions ─────────────────────────────────────────
    const missedRaw = getMissedScheduledSessions(plan);
    for (const s of missedRaw) {
      missed.push(enrichSession(s, plan));
    }

    // ── Today's session ───────────────────────────────────────────────────
    // scheduleEngine.getTodaySession does exact date match and handles
    // unscheduled plans by returning the first incomplete session.
    const todaySession = getTodaySession(plan);
    if (todaySession) {
      today.push(enrichSession(todaySession, plan));
    }

    // ── Upcoming sessions ─────────────────────────────────────────────────
    // getUpcomingSessions already filters scheduledDate >= today and sorts
    // by date/time. We grab a generous slice; dedup vs today below.
    const upcomingRaw = getUpcomingSessions(plan, upcomingLimit);
    for (const s of upcomingRaw) {
      // Exclude today's session from the upcoming list to avoid duplication
      if (s.scheduledDate !== todayKey) {
        upcoming.push(enrichSession(s, plan));
      }
    }
  }

  // ── Sorting with plan metadata injected for tier-break ────────────────────
  // We need plan.priority in the comparator; attach it as a transient field.
  const planPriorityById: Record<string, number> = {};
  for (const plan of plans) {
    planPriorityById[plan.id] = plan.priority;
  }

  function withPriority(s: EnrichedPlanSession) {
    return Object.assign(s, { _planPriority: planPriorityById[s.planId] ?? 0 });
  }

  // Sort overdue: oldest first (scheduledDate ASC), then tie-break
  missed.sort((a, b) => {
    const da = a.scheduledDate ?? '';
    const db = b.scheduledDate ?? '';
    if (da !== db) return da.localeCompare(db); // oldest overdue first
    return sessionTieBreak(withPriority(a), withPriority(b));
  });

  // Sort today: full tie-break (primary/priority/time/id)
  today.sort((a, b) => sessionTieBreak(withPriority(a), withPriority(b)));

  // Sort upcoming: earliest date first, tie-break by priority within same date
  upcoming.sort((a, b) => {
    const da = a.scheduledDate ?? '';
    const db = b.scheduledDate ?? '';
    if (da !== db) return da.localeCompare(db);
    return sessionTieBreak(withPriority(a), withPriority(b));
  });

  // Deduplicate upcoming by session id (same session could appear via two paths)
  const seenUpcoming = new Set<string>();
  const uniqueUpcoming = upcoming.filter((s) => {
    if (seenUpcoming.has(s.id)) return false;
    seenUpcoming.add(s.id);
    return true;
  }).slice(0, upcomingLimit);

  // ── Choose recommendedTodaySession ─────────────────────────────────────────
  // Priority:
  //   1. Overdue sessions first (any overdue beats any on-time today session)
  //   2. Among today sessions (when no overdue)
  //   3. Among upcoming sessions (when nothing due at all)
  let recommendedTodaySession: EnrichedPlanSession | null = null;

  if (missed.length > 0) {
    // Rule 1: oldest overdue recommended (already sorted oldest first → [0])
    recommendedTodaySession = missed[0] ?? null;
  } else if (today.length > 0) {
    // Rule 2: highest-priority today session (already sorted → [0])
    recommendedTodaySession = today[0] ?? null;
  } else if (uniqueUpcoming.length > 0) {
    // Rule 3: nearest upcoming
    recommendedTodaySession = uniqueUpcoming[0] ?? null;
  }

  return {
    recommendedTodaySession,
    todaySessions: today,
    missedSessions: missed,
    upcomingSessions: uniqueUpcoming,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers for downstream consumers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Group enriched sessions by their scheduledDate key (YYYY-MM-DD).
 * Sessions without a scheduledDate are excluded.
 * Within each day, sessions are sorted by scheduledTime then stable id.
 * Suitable for calendar views that show multiple courses per day.
 */
export function groupEnrichedSessionsByDate(
  sessions: EnrichedPlanSession[]
): Record<string, EnrichedPlanSession[]> {
  const grouped: Record<string, EnrichedPlanSession[]> = {};

  for (const session of sessions) {
    if (!session.scheduledDate) continue;
    const bucket = (grouped[session.scheduledDate] ??= []);
    bucket.push(session);
  }

  for (const dateKey of Object.keys(grouped)) {
    grouped[dateKey].sort((a, b) => {
      const timeCmp = (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '');
      if (timeCmp !== 0) return timeCmp;
      return a.id.localeCompare(b.id);
    });
  }

  return grouped;
}

/**
 * Collect all enriched sessions from a merged schedule result into a single
 * flat array that includes missed, today, and upcoming sessions.
 * Useful when you need a complete session corpus for calendar rendering.
 */
export function flattenMergedSchedule(result: MergedScheduleResult): EnrichedPlanSession[] {
  return [...result.missedSessions, ...result.todaySessions, ...result.upcomingSessions];
}

/**
 * Collect ALL sessions from all active plans for calendar display.
 * Unlike mergeActivePlanSchedules, this does not apply any cap or filter —
 * every session with a scheduledDate is included regardless of whether it is
 * past, today, or future, and regardless of completion status.
 * This ensures the calendar shows the full schedule for every active plan.
 */
export function getAllSessionsForCalendar(plans: Plan[]): EnrichedPlanSession[] {
  const sessions: EnrichedPlanSession[] = [];
  for (const plan of plans) {
    if (plan.status !== 'active') continue;
    for (const session of plan.sessions) {
      if (!session.scheduledDate) continue;
      sessions.push(enrichSession(session, plan));
    }
  }
  return sessions;
}
