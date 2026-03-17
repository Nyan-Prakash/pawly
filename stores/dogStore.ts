import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { mapDogRowToDog, mapPlanRowToPlan } from '@/lib/modelMappers';
import { fetchDogLearningState } from '@/lib/adaptivePlanning/repositories';
import type { Dog, DogLearningState, Plan, BehaviorGoal } from '@/types';

interface DogStore {
  dog: Dog | null;
  activePlan: Plan | null;
  behaviorGoals: BehaviorGoal[];
  dogLearningState: DogLearningState | null;
  isLoading: boolean;
  fetchDog: (userId: string) => Promise<void>;
  updateDog: (updates: Partial<Dog>) => Promise<void>;
  fetchActivePlan: () => Promise<void>;
  fetchDogLearningState: (dogId: string) => Promise<void>;
  setDog: (dog: Dog) => void;
  setActivePlan: (plan: Plan) => void;
}

export const useDogStore = create<DogStore>((set, get) => ({
  dog: null,
  activePlan: null,
  behaviorGoals: [],
  dogLearningState: null,
  isLoading: false,

  setDog: (dog) => set({ dog }),

  setActivePlan: (plan) => set({ activePlan: plan }),

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

  fetchActivePlan: async () => {
    const dog = get().dog;
    if (!dog) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('dog_id', dog.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const plan = mapPlanRowToPlan(data);
        set({ activePlan: plan });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
