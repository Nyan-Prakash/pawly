import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { supabase } from '@/lib/supabase';
import { generatePlan } from '@/lib/planGenerator';
import type { Dog, Plan } from '@/types';

export interface OnboardingData {
  dogName: string;
  breed: string;
  ageMonths: number;
  sex: 'male' | 'female';
  neutered: boolean;
  primaryGoal: string;
  secondaryGoals: string[];
  severity: 'mild' | 'moderate' | 'severe';
  environmentType: 'apartment' | 'house_no_yard' | 'house_yard';
  hasKids: boolean;
  hasOtherPets: boolean;
  availableDaysPerWeek: number;
  availableMinutesPerDay: number;
  trainingExperience: 'none' | 'some' | 'experienced';
  equipment: string[];
  videoUri: string | null;
  videoUploadPath: string | null;
  videoContext: string;
  currentStep: number;
}

interface OnboardingStore extends OnboardingData {
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  submitOnboarding: (userId: string) => Promise<{ dogId: string; planId: string }>;
}

const defaults: OnboardingData = {
  dogName: '',
  breed: '',
  ageMonths: 18,
  sex: 'male',
  neutered: false,
  primaryGoal: '',
  secondaryGoals: [],
  severity: 'moderate',
  environmentType: 'house_yard',
  hasKids: false,
  hasOtherPets: false,
  availableDaysPerWeek: 3,
  availableMinutesPerDay: 10,
  trainingExperience: 'none',
  equipment: [],
  videoUri: null,
  videoUploadPath: null,
  videoContext: '',
  currentStep: 1,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...defaults,

      setField: (key, value) => set({ [key]: value } as Partial<OnboardingData>),

      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),

      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

      reset: () => set(defaults),

      submitOnboarding: async (userId: string) => {
        const state = get();

        const lifecycleStage =
          state.ageMonths <= 6
            ? 'puppy'
            : state.ageMonths <= 18
            ? 'adolescent'
            : state.ageMonths <= 36
            ? 'adult'
            : 'senior';

        const { data: dogData, error: dogError } = await supabase
          .from('dogs')
          .insert({
            owner_id: userId,
            name: state.dogName,
            breed: state.breed,
            breed_group: '',
            age_months: state.ageMonths,
            sex: state.sex,
            neutered: state.neutered,
            environment_type: state.environmentType,
            behavior_goals: [state.primaryGoal, ...state.secondaryGoals],
            training_experience: state.trainingExperience,
            equipment: state.equipment,
            available_days_per_week: state.availableDaysPerWeek,
            available_minutes_per_day: state.availableMinutesPerDay,
            lifecycle_stage: lifecycleStage,
          })
          .select('id')
          .single();

        if (dogError || !dogData) throw dogError ?? new Error('Failed to create dog record');
        const dogId = dogData.id as string;

        await supabase.from('behavior_goals').insert({
          dog_id: dogId,
          goal: state.primaryGoal,
          is_primary: true,
          severity: state.severity,
          video_upload_path: state.videoUploadPath,
          video_context: state.videoContext,
        });

        for (const goal of state.secondaryGoals) {
          await supabase.from('behavior_goals').insert({
            dog_id: dogId,
            goal,
            is_primary: false,
            severity: 'mild',
          });
        }

        const dog: Dog = {
          id: dogId,
          ownerId: userId,
          name: state.dogName,
          breed: state.breed,
          breedGroup: '',
          ageMonths: state.ageMonths,
          sex: state.sex,
          neutered: state.neutered,
          environmentType: state.environmentType,
          behaviorGoals: [state.primaryGoal, ...state.secondaryGoals],
          trainingExperience: state.trainingExperience,
          equipment: state.equipment,
          availableDaysPerWeek: state.availableDaysPerWeek,
          availableMinutesPerDay: state.availableMinutesPerDay,
          lifecycleStage,
          createdAt: new Date().toISOString(),
        };

        const plan = generatePlan(dog);

        const { data: planData, error: planError } = await supabase
          .from('plans')
          .insert({
            dog_id: dogId,
            goal: plan.goal,
            status: plan.status,
            duration_weeks: plan.durationWeeks,
            sessions_per_week: plan.sessionsPerWeek,
            current_week: plan.currentWeek,
            current_stage: plan.currentStage,
            sessions: plan.sessions,
          })
          .select('id')
          .single();

        if (planError || !planData) throw planError ?? new Error('Failed to create plan record');
        const planId = planData.id as string;

        await supabase
          .from('user_profiles')
          .upsert({ id: userId, onboarding_completed_at: new Date().toISOString() });

        return { dogId, planId };
      },
    }),
    {
      name: 'pawly-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
