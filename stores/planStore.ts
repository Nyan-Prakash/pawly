import { create } from 'zustand';

import { EXERCISE_TO_PROTOCOL, PROTOCOLS_BY_ID } from '@/constants/protocols';
import { resolveSelectedCourseTheme } from '@/constants/courseColors';
import { captureEvent } from '@/lib/analytics';
import { mapDogRowToDog, mapPlanRowToPlan } from '@/lib/modelMappers';
import { fetchRecentAdaptations as fetchAdaptations } from '@/lib/adaptivePlanning/repositories';
import {
  buildWeeklySchedule,
  getMissedScheduledSessions,
  getPlanCompletion,
  getTodaySession,
  getUpcomingSessions,
  normalizeTrainingSchedulePrefs,
  rescheduleMissedSession,
} from '@/lib/scheduleEngine';
import {
  mergeActivePlanSchedules,
  flattenMergedSchedule,
  groupEnrichedSessionsByDate,
  getAllSessionsForCalendar,
} from '@/lib/mergedSchedule';
import { supabase } from '@/lib/supabase';
import type { Protocol } from '@/constants/protocols';
import type {
  EnrichedPlanSession,
  Plan,
  PlanAdaptation,
  PlanSession,
  PlanSummary,
  SessionScore,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Store interface
// ─────────────────────────────────────────────────────────────────────────────

interface PlanStore {
  // ── Multi-plan state ───────────────────────────────────────────────────────
  /** All active plans keyed by plan id. */
  plansById: Record<string, Plan>;
  /** Ordered list of active plan ids (priority DESC, created_at DESC). */
  activePlanIds: string[];
  /**
   * The plan id currently selected for deep-dive views (plan screen, session
   * screen). Falls back to the primary plan if null.
   */
  selectedPlanId: string | null;
  /**
   * All sessions scheduled for today across every active plan, sorted by the
   * canonical tie-break order (recommended session first).
   */
  todaySessions: EnrichedPlanSession[];
  /**
   * The single session surfaced in the Today CTA. Chosen by mergeActivePlanSchedules:
   *   1. Overdue sessions first (oldest overdue wins)
   *   2. Today's session from primary/highest-priority plan
   *   3. Nearest upcoming session if nothing due today
   */
  recommendedTodaySession: EnrichedPlanSession | null;
  /**
   * All overdue (missed) sessions across active plans, sorted oldest first.
   */
  missedSessions: EnrichedPlanSession[];

  protocols: Record<string, Protocol>;
  recentAdaptations: PlanAdaptation[];
  isLoading: boolean;

  // ── Multi-plan actions ─────────────────────────────────────────────────────
  /** Fetch all active plans for a dog, apply schedule if needed, derive merged state. */
  fetchActivePlans: (dogId: string) => Promise<void>;
  /** Re-fetch from DB. */
  refreshPlans: (dogId: string) => Promise<void>;
  setSelectedPlan: (planId: string | null) => void;
  getSelectedPlan: () => Plan | null;
  getPlanSessions: (planId: string) => PlanSession[];
  getRecommendedTodaySession: () => EnrichedPlanSession | null;
  /** All upcoming sessions across active plans, capped at limit. */
  getUpcomingSessionsAcrossPlans: (limit?: number) => EnrichedPlanSession[];
  /** All missed sessions across active plans. */
  getMissedSessionsAcrossPlans: () => EnrichedPlanSession[];
  /**
   * Sessions grouped by date for calendar views. Includes all enriched sessions
   * (missed + today + upcoming) across all active plans.
   */
  getGroupedSessionsForCalendar: () => Record<string, EnrichedPlanSession[]>;

  // ── Per-plan actions (take explicit planId) ────────────────────────────────
  fetchProtocol: (exerciseId: string) => Promise<Protocol | null>;
  fetchRecentAdaptations: (planId: string) => Promise<void>;
  markSessionComplete: (planId: string, sessionId: string, score: SessionScore) => Promise<void>;
  rescheduleMissedSession: (planId: string, sessionId: string) => Promise<void>;

  // ── Backward-compatibility shims ──────────────────────────────────────────
  /**
   * @deprecated Use plansById[selectedPlanId] or getSelectedPlan() instead.
   * Derived from selectedPlanId → primary → first active plan.
   */
  activePlan: Plan | null;
  /**
   * @deprecated Use recommendedTodaySession instead.
   * Now derives from merged schedule, not single-plan logic.
   */
  todaySession: PlanSession | null;
  /** @deprecated Completion % for the selected/primary plan only. */
  completionPercentage: number;
  /** @deprecated Use fetchActivePlans(). */
  fetchActivePlan: (dogId: string) => Promise<void>;
  /** @deprecated Use refreshPlans(dogId). */
  refreshPlan: () => Promise<void>;
  /** @deprecated Use setSelectedPlan(). */
  setActivePlan: (plan: Plan | null) => void;
  /** @deprecated Use getRecommendedTodaySession(). */
  getTodaySession: () => PlanSession | null;
  /**
   * @deprecated Use getUpcomingSessionsAcrossPlans().
   * Now returns merged upcoming sessions, not single-plan only.
   */
  getUpcomingSessions: (limit?: number) => PlanSession[];
  /**
   * @deprecated Use getMissedSessionsAcrossPlans().
   * Now returns merged missed sessions across all active plans.
   */
  getMissedScheduledSessions: () => PlanSession[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run mergeActivePlanSchedules over the current set of active plans and return
 * all fields needed for a store state update.
 */
function deriveMergedState(plansById: Record<string, Plan>, activePlanIds: string[]) {
  const activePlans = activePlanIds.map((id) => plansById[id]).filter((p): p is Plan => p != null);
  return mergeActivePlanSchedules(activePlans);
}

/**
 * Derive the activePlan shim value: selectedPlanId → primary → first active.
 */
function resolveActivePlan(
  plansById: Record<string, Plan>,
  activePlanIds: string[],
  selectedPlanId: string | null
): Plan | null {
  const resolvedId =
    selectedPlanId ??
    activePlanIds.find((id) => plansById[id]?.isPrimary) ??
    activePlanIds[0];
  return resolvedId ? (plansById[resolvedId] ?? null) : null;
}

/**
 * Derive all shim fields from merged + selected state.
 * The todaySession shim now comes from the merged recommendedTodaySession so
 * single-plan screens automatically benefit from multi-plan logic.
 */
function deriveShimState(
  plansById: Record<string, Plan>,
  activePlanIds: string[],
  selectedPlanId: string | null,
  merged: ReturnType<typeof mergeActivePlanSchedules>
): { activePlan: Plan | null; todaySession: PlanSession | null; completionPercentage: number } {
  const activePlan = resolveActivePlan(plansById, activePlanIds, selectedPlanId);
  // todaySession shim: use recommendedTodaySession (which now incorporates all
  // active plans) rather than a per-plan getTodaySession call. This means
  // single-plan screens automatically see the cross-plan recommended session.
  const todaySession: PlanSession | null = merged.recommendedTodaySession ?? null;
  const completionPercentage = activePlan ? getPlanCompletion(activePlan) : 0;
  return { activePlan, todaySession, completionPercentage };
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const usePlanStore = create<PlanStore>((set, get) => ({
  plansById: {},
  activePlanIds: [],
  selectedPlanId: null,
  todaySessions: [],
  missedSessions: [],
  recommendedTodaySession: null,
  protocols: PROTOCOLS_BY_ID,
  recentAdaptations: [],
  isLoading: false,
  // Shims
  activePlan: null,
  todaySession: null,
  completionPercentage: 0,

  // ── setSelectedPlan ────────────────────────────────────────────────────────

  setSelectedPlan: (planId) => {
    const { plansById, activePlanIds, recommendedTodaySession, missedSessions, todaySessions } = get();
    const merged = { recommendedTodaySession, todaySessions, missedSessions, upcomingSessions: [] };
    set({
      selectedPlanId: planId,
      ...deriveShimState(plansById, activePlanIds, planId, merged),
    });
  },

  getSelectedPlan: () => {
    const { plansById, activePlanIds, selectedPlanId } = get();
    return resolveActivePlan(plansById, activePlanIds, selectedPlanId);
  },

  getPlanSessions: (planId) => get().plansById[planId]?.sessions ?? [],

  getRecommendedTodaySession: () => get().recommendedTodaySession,

  getUpcomingSessionsAcrossPlans: (limit = 5) => {
    const { plansById, activePlanIds } = get();
    const activePlans = activePlanIds.map((id) => plansById[id]).filter((p): p is Plan => p != null);
    const { upcomingSessions } = mergeActivePlanSchedules(activePlans, { upcomingLimit: limit });
    return upcomingSessions;
  },

  getMissedSessionsAcrossPlans: () => get().missedSessions,

  getGroupedSessionsForCalendar: () => {
    const { plansById, activePlanIds } = get();
    const activePlans = activePlanIds.map((id) => plansById[id]).filter((p): p is Plan => p != null);
    return groupEnrichedSessionsByDate(getAllSessionsForCalendar(activePlans));
  },

  // ── fetchActivePlans ───────────────────────────────────────────────────────

  fetchActivePlans: async (dogId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('dog_id', dogId)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      let plans = (data ?? []).map(mapPlanRowToPlan);

      // Apply schedule engine to any plan whose sessions lack scheduledDate
      const needsSchedule = plans.filter(
        (p) => p.sessions.length > 0 && !p.sessions.some((s) => s.scheduledDate)
      );

      if (needsSchedule.length > 0) {
        const { data: dogData } = await supabase
          .from('dogs')
          .select('*')
          .eq('id', dogId)
          .single();

        if (dogData) {
          const dog = mapDogRowToDog(dogData);
          const prefs = normalizeTrainingSchedulePrefs(undefined, dog);

          plans = await Promise.all(
            plans.map(async (plan) => {
              if (plan.sessions.length === 0 || plan.sessions.some((s) => s.scheduledDate)) {
                return plan;
              }
              const scheduledSessions = buildWeeklySchedule({
                sessions: plan.sessions,
                sessionsPerWeek: plan.sessionsPerWeek,
                durationWeeks: plan.durationWeeks,
                availableDaysPerWeek: dog.availableDaysPerWeek,
                availableMinutesPerDay: dog.availableMinutesPerDay,
                prefs,
                goal: dog.behaviorGoals[0],
              });
              const updated = { ...plan, sessions: scheduledSessions };
              // Persist so future loads skip re-compute
              supabase
                .from('plans')
                .update({ sessions: scheduledSessions })
                .eq('id', plan.id)
                .then();
              return updated;
            })
          );
        }
      }

      const plansById: Record<string, Plan> = {};
      const activePlanIds: string[] = [];
      for (const plan of plans) {
        plansById[plan.id] = plan;
        activePlanIds.push(plan.id);
      }

      const { selectedPlanId } = get();
      const merged = deriveMergedState(plansById, activePlanIds);

      // Fetch adaptations for the primary/first plan (sufficient for existing UI)
      const primaryId = plans.find((p) => p.isPrimary)?.id ?? activePlanIds[0];
      const recentAdaptations = primaryId
        ? await fetchAdaptations(primaryId).catch(() => [])
        : [];

      set({
        plansById,
        activePlanIds,
        todaySessions: merged.todaySessions,
        missedSessions: merged.missedSessions,
        recommendedTodaySession: merged.recommendedTodaySession,
        recentAdaptations,
        ...deriveShimState(plansById, activePlanIds, selectedPlanId, merged),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshPlans: async (dogId: string) => {
    await get().fetchActivePlans(dogId);
  },

  // ── fetchRecentAdaptations ─────────────────────────────────────────────────

  fetchRecentAdaptations: async (planId: string) => {
    try {
      const adaptations = await fetchAdaptations(planId);
      set({ recentAdaptations: adaptations });
    } catch {
      set({ recentAdaptations: [] });
    }
  },

  // ── fetchProtocol ──────────────────────────────────────────────────────────

  fetchProtocol: async (exerciseId: string): Promise<Protocol | null> => {
    const protocolId = EXERCISE_TO_PROTOCOL[exerciseId] ?? exerciseId;
    return PROTOCOLS_BY_ID[protocolId] ?? null;
  },

  // ── markSessionComplete ────────────────────────────────────────────────────

  markSessionComplete: async (planId: string, sessionId: string, _score: SessionScore) => {
    const { plansById, activePlanIds, selectedPlanId } = get();
    const plan = plansById[planId];
    if (!plan) return;

    const updatedSessions = plan.sessions.map((session) =>
      session.id === sessionId ? { ...session, isCompleted: true, isMissed: false } : session
    );
    const allDone = updatedSessions.every((session) => session.isCompleted);
    const updatedPlan: Plan = {
      ...plan,
      sessions: updatedSessions,
      status: allDone ? 'completed' : 'active',
    };

    const { error } = await supabase
      .from('plans')
      .update({ sessions: updatedSessions, status: updatedPlan.status })
      .eq('id', planId);

    if (error) throw error;

    const nextPlansById = { ...plansById, [planId]: updatedPlan };
    const nextActivePlanIds = allDone
      ? activePlanIds.filter((id) => id !== planId)
      : activePlanIds;

    const merged = deriveMergedState(nextPlansById, nextActivePlanIds);

    set({
      plansById: nextPlansById,
      activePlanIds: nextActivePlanIds,
      todaySessions: merged.todaySessions,
      missedSessions: merged.missedSessions,
      recommendedTodaySession: merged.recommendedTodaySession,
      ...deriveShimState(nextPlansById, nextActivePlanIds, selectedPlanId, merged),
    });
  },

  // ── rescheduleMissedSession ────────────────────────────────────────────────

  rescheduleMissedSession: async (planId: string, sessionId: string) => {
    const { plansById, activePlanIds, selectedPlanId } = get();
    const plan = plansById[planId];
    if (!plan) return;

    const nextPlan = rescheduleMissedSession(plan, sessionId);
    if (nextPlan === plan) return;

    const { error } = await supabase
      .from('plans')
      .update({ sessions: nextPlan.sessions })
      .eq('id', planId);

    if (error) throw error;

    captureEvent('scheduled_session_rescheduled', {
      planId,
      sessionId,
      mode: plan.metadata?.flexibility ?? 'move_next_slot',
    });

    const nextPlansById = { ...plansById, [planId]: nextPlan };
    const merged = deriveMergedState(nextPlansById, activePlanIds);

    set({
      plansById: nextPlansById,
      todaySessions: merged.todaySessions,
      missedSessions: merged.missedSessions,
      recommendedTodaySession: merged.recommendedTodaySession,
      ...deriveShimState(nextPlansById, activePlanIds, selectedPlanId, merged),
    });
  },

  // ── Backward-compatibility shims ──────────────────────────────────────────

  /** @deprecated Use fetchActivePlans(). */
  fetchActivePlan: async (dogId: string) => {
    await get().fetchActivePlans(dogId);
  },

  /** @deprecated Use refreshPlans(dogId). */
  refreshPlan: async () => {
    const { activePlan } = get();
    if (!activePlan?.dogId) return;
    await get().fetchActivePlans(activePlan.dogId);
  },

  /** @deprecated Use setSelectedPlan(). */
  setActivePlan: (plan) => {
    if (!plan) {
      set({ selectedPlanId: null, activePlan: null, todaySession: null, completionPercentage: 0 });
      return;
    }
    const { plansById, activePlanIds } = get();
    const nextPlansById = { ...plansById, [plan.id]: plan };
    const nextActivePlanIds = activePlanIds.includes(plan.id)
      ? activePlanIds
      : [plan.id, ...activePlanIds];
    const merged = deriveMergedState(nextPlansById, nextActivePlanIds);
    set({
      plansById: nextPlansById,
      activePlanIds: nextActivePlanIds,
      selectedPlanId: plan.id,
      todaySessions: merged.todaySessions,
      missedSessions: merged.missedSessions,
      recommendedTodaySession: merged.recommendedTodaySession,
      ...deriveShimState(nextPlansById, nextActivePlanIds, plan.id, merged),
    });
  },

  /** @deprecated Use getRecommendedTodaySession(). */
  getTodaySession: () => get().todaySession,

  /**
   * @deprecated Use getUpcomingSessionsAcrossPlans().
   * Now returns merged upcoming sessions across all active plans (not single plan).
   */
  getUpcomingSessions: (limit = 3) => {
    return get().getUpcomingSessionsAcrossPlans(limit);
  },

  /**
   * @deprecated Use getMissedSessionsAcrossPlans().
   * Now returns merged missed sessions across all active plans.
   */
  getMissedScheduledSessions: () => {
    return get().getMissedSessionsAcrossPlans();
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Convenience selector: build PlanSummary[] for list UIs
// ─────────────────────────────────────────────────────────────────────────────

export function selectPlanSummaries(store: ReturnType<typeof usePlanStore.getState>): PlanSummary[] {
  const summaries: PlanSummary[] = [];
  for (const id of store.activePlanIds) {
    const plan = store.plansById[id];
    if (!plan) continue;
    summaries.push({
      id: plan.id,
      dogId: plan.dogId,
      goal: plan.goal,
      courseTitle: plan.courseTitle,
      status: plan.status,
      isPrimary: plan.isPrimary,
      priority: plan.priority,
      currentWeek: plan.currentWeek,
      durationWeeks: plan.durationWeeks,
      sessionsPerWeek: plan.sessionsPerWeek,
      completionPercentage: getPlanCompletion(plan),
      todaySession: getTodaySession(plan),
      createdAt: plan.createdAt,
    });
  }
  return summaries;
}

export function selectSelectedPlanTheme(store: ReturnType<typeof usePlanStore.getState>) {
  return resolveSelectedCourseTheme(store.plansById, store.activePlanIds, store.selectedPlanId);
}
