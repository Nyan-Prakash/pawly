import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { captureEvent } from '@/lib/analytics';
import { getGoalColor } from '@/constants/courseColors';
import { generatePlan } from '@/lib/planGenerator';
import { generateAdaptivePlanWithOptions } from '@/lib/adaptivePlanning/initialPlanner';
import { isAdaptivePlanningEnabled } from '@/lib/adaptivePlanning/featureFlags';
import {
  buildScheduleSummary,
  normalizeTrainingSchedulePrefs,
} from '@/lib/scheduleEngine';
import { supabase, createUserRecord } from '@/lib/supabase';
import type {
  Dog,
  Plan,
  ScheduleFlexibility,
  ScheduleIntensity,
  SessionStyle,
  TimeWindow,
  Weekday,
} from '@/types';

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
  preferredTrainingDays: Weekday[];
  preferredTrainingWindows: Partial<Record<Weekday, TimeWindow[]>>;
  preferredTrainingTimes: Partial<Record<Weekday, string[]>>;
  usualWalkTimes: string[];
  sessionStyle: SessionStyle;
  scheduleFlexibility: ScheduleFlexibility;
  scheduleIntensity: ScheduleIntensity;
  blockedDays: Weekday[];
  blockedDates: string[];
  scheduleNotes: string;
  timezone: string;
  trainingExperience: 'none' | 'some' | 'experienced';
  equipment: string[];
  videoUri: string | null;
  videoUploadPath: string | null;
  videoContext: string;
  currentStep: number;
}

interface OnboardingStore extends OnboardingData {
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  setScheduleDay: (day: Weekday, enabled: boolean) => void;
  togglePreferredDay: (day: Weekday) => void;
  toggleTrainingWindow: (day: Weekday, window: TimeWindow) => void;
  setExactTimeForDay: (day: Weekday, time: string) => void;
  removeExactTimeForDay: (day: Weekday) => void;
  setWalkTime: (index: number, time: string) => void;
  removeWalkTime: (index: number) => void;
  buildScheduleSummary: () => string;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  submitOnboarding: (
    userId: string,
    options?: { accessToken?: string | null }
  ) => Promise<{ dogId: string; planId: string; plan: Plan; dog: Dog }>;
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
  preferredTrainingDays: ['tuesday', 'thursday', 'saturday'],
  preferredTrainingWindows: {
    tuesday: ['evening'],
    thursday: ['evening'],
    saturday: ['morning'],
  },
  preferredTrainingTimes: {},
  usualWalkTimes: [],
  sessionStyle: 'balanced',
  scheduleFlexibility: 'move_next_slot',
  scheduleIntensity: 'balanced',
  blockedDays: [],
  blockedDates: [],
  scheduleNotes: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  trainingExperience: 'none',
  equipment: [],
  videoUri: null,
  videoUploadPath: null,
  videoContext: '',
  currentStep: 1,
};

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function buildDogFromState(state: OnboardingData, userId: string, dogId: string, lifecycleStage: string): Dog {
  return {
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
    preferredTrainingDays: state.preferredTrainingDays,
    preferredTrainingWindows: state.preferredTrainingWindows,
    preferredTrainingTimes: state.preferredTrainingTimes,
    usualWalkTimes: state.usualWalkTimes,
    sessionStyle: state.sessionStyle,
    scheduleFlexibility: state.scheduleFlexibility,
    scheduleIntensity: state.scheduleIntensity,
    blockedDays: state.blockedDays,
    blockedDates: state.blockedDates,
    scheduleNotes: state.scheduleNotes || null,
    scheduleVersion: 1,
    timezone: state.timezone,
    lifecycleStage,
    createdAt: new Date().toISOString(),
  };
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...defaults,

      setField: (key, value) => set({ [key]: value } as Partial<OnboardingData>),

      setScheduleDay: (day, enabled) =>
        set((state) => ({
          preferredTrainingDays: enabled
            ? unique([...state.preferredTrainingDays, day])
            : state.preferredTrainingDays.filter((item) => item !== day),
        })),

      togglePreferredDay: (day) =>
        set((state) => ({
          preferredTrainingDays: state.preferredTrainingDays.includes(day)
            ? state.preferredTrainingDays.filter((item) => item !== day)
            : unique([...state.preferredTrainingDays, day]),
        })),

      toggleTrainingWindow: (day, window) =>
        set((state) => {
          const current = state.preferredTrainingWindows[day] ?? [];
          const next = current.includes(window)
            ? current.filter((item) => item !== window)
            : [...current, window];

          return {
            preferredTrainingWindows: {
              ...state.preferredTrainingWindows,
              [day]: next,
            },
          };
        }),

      setExactTimeForDay: (day, time) =>
        set((state) => ({
          preferredTrainingTimes: {
            ...state.preferredTrainingTimes,
            [day]: [time],
          },
        })),

      removeExactTimeForDay: (day) =>
        set((state) => {
          const next = { ...state.preferredTrainingTimes };
          delete next[day];
          return { preferredTrainingTimes: next };
        }),

      setWalkTime: (index, time) =>
        set((state) => {
          const next = [...state.usualWalkTimes];
          next[index] = time;
          return { usualWalkTimes: unique(next.filter(Boolean)).slice(0, 2) };
        }),

      removeWalkTime: (index) =>
        set((state) => ({
          usualWalkTimes: state.usualWalkTimes.filter((_, itemIndex) => itemIndex !== index),
        })),

      buildScheduleSummary: () => {
        const state = get();
        return buildScheduleSummary({
          sessionsPerWeek: state.availableDaysPerWeek,
          prefs: normalizeTrainingSchedulePrefs({
            preferredTrainingDays: state.preferredTrainingDays,
            preferredTrainingWindows: state.preferredTrainingWindows,
            preferredTrainingTimes: state.preferredTrainingTimes,
            usualWalkTimes: state.usualWalkTimes,
            sessionStyle: state.sessionStyle,
            scheduleFlexibility: state.scheduleFlexibility,
            scheduleIntensity: state.scheduleIntensity,
            blockedDays: state.blockedDays,
            blockedDates: state.blockedDates,
            timezone: state.timezone,
          }),
        });
      },

      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),

      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      reset: () => set(defaults),

      submitOnboarding: async (userId: string, options?: { accessToken?: string | null }) => {
        const state = get();

        const lifecycleStage =
          state.ageMonths <= 6
            ? 'puppy'
            : state.ageMonths <= 18
            ? 'adolescent'
            : state.ageMonths <= 36
            ? 'adult'
            : 'senior';

        const dogPayload = {
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
          preferred_training_days: state.preferredTrainingDays,
          preferred_training_windows: state.preferredTrainingWindows,
          preferred_training_times: state.preferredTrainingTimes,
          usual_walk_times: state.usualWalkTimes,
          session_style: state.sessionStyle,
          schedule_flexibility: state.scheduleFlexibility,
          schedule_intensity: state.scheduleIntensity,
          blocked_days: state.blockedDays,
          blocked_dates: state.blockedDates,
          schedule_notes: state.scheduleNotes || null,
          schedule_version: 1,
          timezone: state.timezone,
          lifecycle_stage: lifecycleStage,
          has_kids: state.hasKids,
          has_other_pets: state.hasOtherPets,
        };

        // Retry dog insert — auth.users row may not be immediately visible to FK checks
        let dogData: { id: unknown } | null = null;
        let dogError: Error | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const result = await supabase
            .from('dogs')
            .insert(dogPayload)
            .select('id')
            .single();
          if (!result.error) {
            dogData = result.data;
            dogError = null;
            break;
          }
          dogError = result.error;
          if (result.error.code === '23503' && attempt < 2) {
            // FK not yet visible — wait and retry
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          break;
        }

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

        const dog = buildDogFromState(state, userId, dogId, lifecycleStage);

        captureEvent('onboarding_schedule_preferences_set', {
          daysPerWeek: state.availableDaysPerWeek,
          sessionStyle: state.sessionStyle,
          scheduleFlexibility: state.scheduleFlexibility,
          scheduleIntensity: state.scheduleIntensity,
        });

        let plan: Plan;
        let planId: string;

        if (isAdaptivePlanningEnabled()) {
          // Adaptive path: call Edge Function which handles AI + validation + insert
          try {
            const result = await generateAdaptivePlanWithOptions(dog, {
              accessToken: options?.accessToken ?? null,
            });
            plan = result.plan;
            if (!plan.color) {
              plan.color = getGoalColor(plan.goal);
            }
            planId = plan.id;

            // First plan for a new dog must be primary — patch the DB row now
            // (Edge Function does not set is_primary; the PR-18 migration only
            //  backfilled existing rows. New rows need an explicit update.)
            if (planId) {
              await supabase
                .from('plans')
                .update({ is_primary: true })
                .eq('id', planId);
              plan = { ...plan, isPrimary: true };
            }

            captureEvent('plan_schedule_generated', {
              dogId,
              planId,
              plannerMode: result.plannerMode,
              scheduledSessions: plan.sessions.filter((session: any) => session.scheduledDate).length,
              fallbackReason: result.fallbackReason,
            });
          } catch (adaptiveErr) {
            console.warn('[onboarding] Adaptive planner failed, using rules fallback:', adaptiveErr);
            // Fallback to rules-based — include is_primary=true in INSERT
            plan = generatePlan(dog);

            const { data: planData, error: planError } = await supabase
              .from('plans')
              .insert({
                dog_id: dogId,
                goal: plan.goal,
                status: plan.status,
                color: plan.color,
                duration_weeks: plan.durationWeeks,
                sessions_per_week: plan.sessionsPerWeek,
                current_week: plan.currentWeek,
                current_stage: plan.currentStage,
                sessions: plan.sessions,
                metadata: { ...(plan.metadata ?? {}), plannerMode: 'rules_fallback', fallbackReason: String(adaptiveErr) },
                is_primary: true,
              })
              .select('id')
              .single();

            if (planError || !planData) throw planError ?? new Error('Failed to create plan record');
            planId = planData.id as string;
            plan = { ...plan, id: planId, isPrimary: true };

            captureEvent('plan_schedule_generated', {
              dogId,
              planId,
              plannerMode: 'rules_fallback',
              scheduledSessions: plan.sessions.filter((session) => session.scheduledDate).length,
            });
          }
        } else {
          // Rules-based path — include is_primary=true so the first plan is always primary
          plan = generatePlan(dog);

          const { data: planData, error: planError } = await supabase
            .from('plans')
            .insert({
              dog_id: dogId,
              goal: plan.goal,
              status: plan.status,
              color: plan.color,
              duration_weeks: plan.durationWeeks,
              sessions_per_week: plan.sessionsPerWeek,
              current_week: plan.currentWeek,
              current_stage: plan.currentStage,
              sessions: plan.sessions,
              metadata: plan.metadata ?? {},
              is_primary: true,
            })
            .select('id')
            .single();

          if (planError || !planData) throw planError ?? new Error('Failed to create plan record');
          planId = planData.id as string;
          plan = { ...plan, id: planId, isPrimary: true };

          captureEvent('plan_schedule_generated', {
            dogId,
            planId,
            scheduledSessions: plan.sessions.filter((session) => session.scheduledDate).length,
          });
        }

        // Non-blocking — user_profiles FK may also race with auth.users visibility
        supabase.from('user_profiles').upsert({
          id: userId,
          onboarding_completed_at: new Date().toISOString(),
          notification_prefs: {
            daily_reminder: true,
            daily_reminder_time: state.usualWalkTimes[0] ?? '19:00',
            walk_reminders: true,
            post_walk_check_in: true,
            streak_alerts: true,
            milestone_alerts: true,
            insights: true,
            expert_review: true,
            lifecycle: true,
            weekly_summary: true,
            scheduled_session_reminders: true,
            reminder_lead_minutes: 15,
            fallback_missed_session_reminders: true,
          },
        });

        return {
          dogId,
          planId,
          dog,
          plan: plan.id ? plan : { ...plan, id: planId },
        };
      },
    }),
    {
      name: 'pawly-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
