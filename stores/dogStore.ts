import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import type { Dog, Plan, BehaviorGoal } from '@/types';

interface DogStore {
  dog: Dog | null;
  activePlan: Plan | null;
  behaviorGoals: BehaviorGoal[];
  isLoading: boolean;
  fetchDog: (userId: string) => Promise<void>;
  updateDog: (updates: Partial<Dog>) => Promise<void>;
  fetchActivePlan: () => Promise<void>;
  setDog: (dog: Dog) => void;
  setActivePlan: (plan: Plan) => void;
}

export const useDogStore = create<DogStore>((set, get) => ({
  dog: null,
  activePlan: null,
  behaviorGoals: [],
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
        const dog: Dog = {
          id: data.id,
          ownerId: data.owner_id,
          name: data.name,
          breed: data.breed,
          breedGroup: data.breed_group ?? '',
          ageMonths: data.age_months,
          sex: data.sex,
          neutered: data.neutered,
          environmentType: data.environment_type,
          behaviorGoals: data.behavior_goals ?? [],
          trainingExperience: data.training_experience,
          equipment: data.equipment ?? [],
          availableDaysPerWeek: data.available_days_per_week,
          availableMinutesPerDay: data.available_minutes_per_day,
          lifecycleStage: data.lifecycle_stage ?? '',
          createdAt: data.created_at,
        };
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

    const { error } = await supabase.from('dogs').update(dbUpdates).eq('id', current.id);
    if (error) throw error;

    set({ dog: { ...current, ...updates } });
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
        set({ activePlan: plan });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
