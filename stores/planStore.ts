import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { getTodaySession, getPlanCompletion } from '@/lib/scheduleEngine';
import { PROTOCOLS_BY_ID, EXERCISE_TO_PROTOCOL } from '@/constants/protocols';
import type { Protocol } from '@/constants/protocols';
import type { Plan, PlanSession, SessionScore } from '@/types';

interface PlanStore {
  activePlan: Plan | null;
  protocols: Record<string, Protocol>;
  todaySession: PlanSession | null;
  completionPercentage: number;
  isLoading: boolean;

  fetchActivePlan: (dogId: string) => Promise<void>;
  fetchProtocol: (exerciseId: string) => Promise<Protocol | null>;
  markSessionComplete: (sessionId: string, score: SessionScore) => Promise<void>;
  getTodaySession: () => PlanSession | null;
  refreshPlan: () => Promise<void>;
  setActivePlan: (plan: Plan | null) => void;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  activePlan: null,
  protocols: PROTOCOLS_BY_ID,
  todaySession: null,
  completionPercentage: 0,
  isLoading: false,

  setActivePlan: (plan) => {
    const todaySession = plan ? getTodaySession(plan) : null;
    const completionPercentage = plan ? getPlanCompletion(plan) : 0;
    set({ activePlan: plan, todaySession, completionPercentage });
  },

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

      if (data) {
        const plan: Plan = {
          id: data.id,
          dogId: data.dog_id,
          goal: data.goal,
          status: data.status,
          durationWeeks: data.duration_weeks,
          sessionsPerWeek: data.sessions_per_week,
          currentWeek: data.current_week,
          currentStage: data.current_stage,
          sessions: data.sessions ?? [],
          createdAt: data.created_at,
        };

        const todaySession = getTodaySession(plan);
        const completionPercentage = getPlanCompletion(plan);
        set({ activePlan: plan, todaySession, completionPercentage });
      } else {
        set({ activePlan: null, todaySession: null, completionPercentage: 0 });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProtocol: async (exerciseId: string): Promise<Protocol | null> => {
    const protocolId = EXERCISE_TO_PROTOCOL[exerciseId];
    if (!protocolId) return null;
    return PROTOCOLS_BY_ID[protocolId] ?? null;
  },

  markSessionComplete: async (sessionId: string, score: SessionScore) => {
    const { activePlan } = get();
    if (!activePlan) return;

    const updatedSessions: PlanSession[] = activePlan.sessions.map((s) =>
      s.id === sessionId ? { ...s, isCompleted: true } : s
    );

    const allDone = updatedSessions.every((s) => s.isCompleted);
    const newStatus = allDone ? 'completed' : 'active';

    const { error } = await supabase
      .from('plans')
      .update({
        sessions: updatedSessions,
        status: newStatus,
      })
      .eq('id', activePlan.id);

    if (error) throw error;

    const updatedPlan: Plan = {
      ...activePlan,
      sessions: updatedSessions,
      status: newStatus,
    };

    const todaySession = getTodaySession(updatedPlan);
    const completionPercentage = getPlanCompletion(updatedPlan);
    set({ activePlan: updatedPlan, todaySession, completionPercentage });
  },

  getTodaySession: (): PlanSession | null => {
    const { activePlan } = get();
    if (!activePlan) return null;
    return getTodaySession(activePlan);
  },

  refreshPlan: async () => {
    const { activePlan } = get();
    if (!activePlan?.dogId) return;
    await get().fetchActivePlan(activePlan.dogId);
  },
}));
