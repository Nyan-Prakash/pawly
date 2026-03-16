import { create } from 'zustand';

import { EXERCISE_TO_PROTOCOL, PROTOCOLS_BY_ID } from '@/constants/protocols';
import { captureEvent } from '@/lib/analytics';
import { mapPlanRowToPlan } from '@/lib/modelMappers';
import { fetchRecentAdaptations as fetchAdaptations } from '@/lib/adaptivePlanning/repositories';
import {
  getMissedScheduledSessions,
  getPlanCompletion,
  getTodaySession,
  getUpcomingSessions,
  rescheduleMissedSession,
} from '@/lib/scheduleEngine';
import { supabase } from '@/lib/supabase';
import type { Protocol } from '@/constants/protocols';
import type { Plan, PlanAdaptation, PlanSession, SessionScore } from '@/types';

interface PlanStore {
  activePlan: Plan | null;
  protocols: Record<string, Protocol>;
  todaySession: PlanSession | null;
  completionPercentage: number;
  recentAdaptations: PlanAdaptation[];
  isLoading: boolean;

  fetchActivePlan: (dogId: string) => Promise<void>;
  fetchProtocol: (exerciseId: string) => Promise<Protocol | null>;
  fetchRecentAdaptations: (planId: string) => Promise<void>;
  markSessionComplete: (sessionId: string, score: SessionScore) => Promise<void>;
  getTodaySession: () => PlanSession | null;
  getUpcomingSessions: (limit?: number) => PlanSession[];
  getMissedScheduledSessions: () => PlanSession[];
  rescheduleMissedSession: (sessionId: string) => Promise<void>;
  refreshPlan: () => Promise<void>;
  setActivePlan: (plan: Plan | null) => void;
}

function derivePlanState(plan: Plan | null) {
  return {
    activePlan: plan,
    todaySession: plan ? getTodaySession(plan) : null,
    completionPercentage: plan ? getPlanCompletion(plan) : 0,
  };
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  activePlan: null,
  protocols: PROTOCOLS_BY_ID,
  todaySession: null,
  completionPercentage: 0,
  recentAdaptations: [],
  isLoading: false,

  setActivePlan: (plan) => set(derivePlanState(plan)),

  fetchActivePlan: async (dogId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('dog_id', dogId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      const plan = data ? mapPlanRowToPlan(data) : null;
      set({
        ...derivePlanState(plan),
        recentAdaptations: plan ? await fetchAdaptations(plan.id).catch(() => []) : [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecentAdaptations: async (planId: string) => {
    try {
      const adaptations = await fetchAdaptations(planId);
      set({ recentAdaptations: adaptations });
    } catch {
      set({ recentAdaptations: [] });
    }
  },

  fetchProtocol: async (exerciseId: string): Promise<Protocol | null> => {
    const protocolId = EXERCISE_TO_PROTOCOL[exerciseId] ?? exerciseId;
    return PROTOCOLS_BY_ID[protocolId] ?? null;
  },

  markSessionComplete: async (sessionId: string, _score: SessionScore) => {
    const { activePlan } = get();
    if (!activePlan) return;

    const updatedSessions = activePlan.sessions.map((session) =>
      session.id === sessionId ? { ...session, isCompleted: true, isMissed: false } : session
    );
    const allDone = updatedSessions.every((session) => session.isCompleted);
    const newPlan: Plan = {
      ...activePlan,
      sessions: updatedSessions,
      status: allDone ? 'completed' : 'active',
    };

    const { error } = await supabase
      .from('plans')
      .update({
        sessions: updatedSessions,
        status: newPlan.status,
      })
      .eq('id', activePlan.id);

    if (error) throw error;
    set(derivePlanState(newPlan));
  },

  getTodaySession: () => {
    const { activePlan } = get();
    return activePlan ? getTodaySession(activePlan) : null;
  },

  getUpcomingSessions: (limit = 3) => {
    const { activePlan } = get();
    return activePlan ? getUpcomingSessions(activePlan, limit) : [];
  },

  getMissedScheduledSessions: () => {
    const { activePlan } = get();
    return activePlan ? getMissedScheduledSessions(activePlan) : [];
  },

  rescheduleMissedSession: async (sessionId: string) => {
    const { activePlan } = get();
    if (!activePlan) return;

    const nextPlan = rescheduleMissedSession(activePlan, sessionId);
    if (nextPlan === activePlan) return;

    const { error } = await supabase
      .from('plans')
      .update({ sessions: nextPlan.sessions })
      .eq('id', activePlan.id);

    if (error) throw error;
    captureEvent('scheduled_session_rescheduled', {
      planId: activePlan.id,
      sessionId,
      mode: activePlan.metadata?.flexibility ?? 'move_next_slot',
    });
    set(derivePlanState(nextPlan));
  },

  refreshPlan: async () => {
    const { activePlan } = get();
    if (!activePlan?.dogId) return;
    await get().fetchActivePlan(activePlan.dogId);
  },
}));
