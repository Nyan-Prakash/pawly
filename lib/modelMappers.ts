import type { Dog, Plan, PlanMetadata, PlanSession } from '@/types';

function asWeekdayArray(value: unknown): Dog['preferredTrainingDays'] {
  return Array.isArray(value) ? (value.filter((item): item is Dog['preferredTrainingDays'][number] => typeof item === 'string') as Dog['preferredTrainingDays']) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function mapDogRowToDog(data: Record<string, any>): Dog {
  return {
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
    preferredTrainingDays: asWeekdayArray(data.preferred_training_days),
    preferredTrainingWindows: (data.preferred_training_windows ?? {}) as Dog['preferredTrainingWindows'],
    preferredTrainingTimes: (data.preferred_training_times ?? {}) as Dog['preferredTrainingTimes'],
    usualWalkTimes: asStringArray(data.usual_walk_times),
    sessionStyle: data.session_style ?? 'balanced',
    scheduleFlexibility: data.schedule_flexibility ?? 'move_next_slot',
    scheduleIntensity: data.schedule_intensity ?? 'balanced',
    blockedDays: asWeekdayArray(data.blocked_days),
    blockedDates: asStringArray(data.blocked_dates),
    scheduleNotes: data.schedule_notes ?? null,
    scheduleVersion: data.schedule_version ?? 1,
    timezone: data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
    lifecycleStage: data.lifecycle_stage ?? '',
    createdAt: data.created_at,
  };
}

function mapPlanSessions(sessions: unknown): PlanSession[] {
  if (!Array.isArray(sessions)) return [];
  return sessions as PlanSession[];
}

export function mapPlanRowToPlan(data: Record<string, any>): Plan {
  return {
    id: data.id,
    dogId: data.dog_id,
    goal: data.goal,
    status: data.status,
    durationWeeks: data.duration_weeks,
    sessionsPerWeek: data.sessions_per_week,
    currentWeek: data.current_week,
    currentStage: data.current_stage,
    sessions: mapPlanSessions(data.sessions),
    metadata: (data.metadata ?? {}) as PlanMetadata,
    createdAt: data.created_at,
  };
}
