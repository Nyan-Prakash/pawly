import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { mapDogRowToDog, mapPlanRowToPlan } from '@/lib/modelMappers';
import { fetchDogLearningState } from '@/lib/adaptivePlanning/repositories';
import type { Dog, DogLearningState, Plan, BehaviorGoal } from '@/types';

interface DogStore {
  dog: Dog | null;
  /**
   * All active plans for the current dog. Replaces the old singular `activePlan`.
   * Sorted by priority DESC, then created_at DESC so the primary/highest-priority
   * plan is always first.
   */
  activePlans: Plan[];
  /**
   * The plan id that should be treated as the "primary" course for UI emphasis.
   * Derived from is_primary on fetch; can be overridden locally via setPrimaryPlan().
   */
  primaryPlanId: string | null;
  behaviorGoals: BehaviorGoal[];
  dogLearningState: DogLearningState | null;
  isLoading: boolean;

  fetchDog: (userId: string) => Promise<void>;
  updateDog: (updates: Partial<Dog>) => Promise<void>;
  /** Fetches all active plans for the current dog. */
  fetchActivePlans: (dogId?: string) => Promise<void>;
  fetchDogLearningState: (dogId: string) => Promise<void>;
  setDog: (dog: Dog) => void;
  /** Set or clear the primary plan id locally (does not persist to DB). */
  setPrimaryPlan: (planId: string | null) => void;
  /** Returns the primary plan object, or the first active plan if no primary is set. */
  getPrimaryPlan: () => Plan | null;

  // ── Backward-compatibility shims ──────────────────────────────────────────
  /**
   * @deprecated Use activePlans[0] or getPrimaryPlan() instead.
   * Kept so screens that previously read dogStore.activePlan continue to work
   * while they are migrated to multi-plan APIs.
   */
  activePlan: Plan | null;
  /** @deprecated Use fetchActivePlans() instead. */
  fetchActivePlan: () => Promise<void>;
  /** @deprecated Use setPrimaryPlan() / getPrimaryPlan() instead. */
  setActivePlan: (plan: Plan) => void;
}

export const useDogStore = create<DogStore>((set, get) => ({
  dog: null,
  activePlans: [],
  primaryPlanId: null,
  // Shim: derived from activePlans in real-time via getter pattern below
  activePlan: null,
  behaviorGoals: [],
  dogLearningState: null,
  isLoading: false,

  setDog: (dog) => set({ dog }),

  // ── Compatibility shim: mirrors primary plan into activePlan ──────────────
  setActivePlan: (plan) => {
    const { activePlans } = get();
    const alreadyInList = activePlans.some((p) => p.id === plan.id);
    set({
      activePlan: plan,
      activePlans: alreadyInList ? activePlans : [plan, ...activePlans],
      primaryPlanId: plan.id,
    });
  },

  fetchDog: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        const dog = mapDogRowToDog(data);
        set({ dog });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateDog: async (updates: Partial<Dog>) => {
    const current = get().dog;
    if (!current) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.breed !== undefined) dbUpdates.breed = updates.breed;
    if (updates.ageMonths !== undefined) dbUpdates.age_months = updates.ageMonths;
    if (updates.sex !== undefined) dbUpdates.sex = updates.sex;
    if (updates.neutered !== undefined) dbUpdates.neutered = updates.neutered;
    if (updates.environmentType !== undefined) dbUpdates.environment_type = updates.environmentType;
    if (updates.equipment !== undefined) dbUpdates.equipment = updates.equipment;
    if (updates.availableDaysPerWeek !== undefined) dbUpdates.available_days_per_week = updates.availableDaysPerWeek;
    if (updates.availableMinutesPerDay !== undefined) dbUpdates.available_minutes_per_day = updates.availableMinutesPerDay;
    if (updates.preferredTrainingDays !== undefined) dbUpdates.preferred_training_days = updates.preferredTrainingDays;
    if (updates.preferredTrainingWindows !== undefined) dbUpdates.preferred_training_windows = updates.preferredTrainingWindows;
    if (updates.preferredTrainingTimes !== undefined) dbUpdates.preferred_training_times = updates.preferredTrainingTimes;
    if (updates.usualWalkTimes !== undefined) dbUpdates.usual_walk_times = updates.usualWalkTimes;
    if (updates.sessionStyle !== undefined) dbUpdates.session_style = updates.sessionStyle;
    if (updates.scheduleFlexibility !== undefined) dbUpdates.schedule_flexibility = updates.scheduleFlexibility;
    if (updates.scheduleIntensity !== undefined) dbUpdates.schedule_intensity = updates.scheduleIntensity;
    if (updates.blockedDays !== undefined) dbUpdates.blocked_days = updates.blockedDays;
    if (updates.blockedDates !== undefined) dbUpdates.blocked_dates = updates.blockedDates;
    if (updates.scheduleNotes !== undefined) dbUpdates.schedule_notes = updates.scheduleNotes;
    if (updates.scheduleVersion !== undefined) dbUpdates.schedule_version = updates.scheduleVersion;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;

    const { error } = await supabase.from('dogs').update(dbUpdates).eq('id', current.id);
    if (error) throw error;

    set({ dog: { ...current, ...updates } });
  },

  fetchDogLearningState: async (dogId: string) => {
    try {
      const state = await fetchDogLearningState(dogId);
      set({ dogLearningState: state });
    } catch {
      set({ dogLearningState: null });
    }
  },

  fetchActivePlans: async (dogId?: string) => {
    const resolvedDogId = dogId ?? get().dog?.id;
    if (!resolvedDogId) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('dog_id', resolvedDogId)
        .eq('status', 'active')
        // Higher priority first; then most recently created
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const plans = (data ?? []).map(mapPlanRowToPlan);

      // Derive primary: DB is_primary flag wins; fall back to first plan
      const primaryFromDB = plans.find((p) => p.isPrimary);
      const primaryPlanId = primaryFromDB?.id ?? plans[0]?.id ?? null;

      set({
        activePlans: plans,
        primaryPlanId,
        // Keep shim in sync
        activePlan: plans.find((p) => p.id === primaryPlanId) ?? plans[0] ?? null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Backward-compat: single-plan fetch delegates to fetchActivePlans ───────
  fetchActivePlan: async () => {
    await get().fetchActivePlans();
  },

  setPrimaryPlan: (planId) => {
    const { activePlans } = get();
    set({
      primaryPlanId: planId,
      activePlan: planId ? (activePlans.find((p) => p.id === planId) ?? null) : null,
    });
  },

  getPrimaryPlan: () => {
    const { activePlans, primaryPlanId } = get();
    if (primaryPlanId) {
      return activePlans.find((p) => p.id === primaryPlanId) ?? activePlans[0] ?? null;
    }
    return activePlans[0] ?? null;
  },
}));
