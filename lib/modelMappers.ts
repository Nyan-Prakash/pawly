import type {
  Dog,
  DogLearningState,
  InAppNotification,
  Plan,
  PlanAdaptation,
  PlanMetadata,
  PlanSession,
  SkillEdge,
  SkillNode,
} from '../types/index.ts';
import type { Protocol, LiveCoachingConfig } from '../constants/protocols.ts';

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

export function mapDogLearningStateRowToModel(data: Record<string, any>): DogLearningState {
  return {
    id: data.id,
    dogId: data.dog_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    motivationScore: data.motivation_score,
    distractionSensitivity: data.distraction_sensitivity,
    confidenceScore: data.confidence_score,
    impulseControlScore: data.impulse_control_score,
    handlerConsistencyScore: data.handler_consistency_score,
    fatigueRiskScore: data.fatigue_risk_score,
    recoverySpeedScore: data.recovery_speed_score,
    environmentConfidence: data.environment_confidence ?? {},
    behaviorSignals: data.behavior_signals ?? {},
    recentTrends: data.recent_trends ?? {},
    currentHypotheses: data.current_hypotheses ?? [],
    lastEvaluatedAt: data.last_evaluated_at ?? null,
    version: data.version,
  };
}

export function mapPlanAdaptationRowToModel(data: Record<string, any>): PlanAdaptation {
  return {
    id: data.id,
    dogId: data.dog_id,
    planId: data.plan_id,
    triggeredBySessionLogId: data.triggered_by_session_log_id ?? null,
    createdAt: data.created_at,
    adaptationType: data.adaptation_type,
    status: data.status,
    reasonCode: data.reason_code,
    reasonSummary: data.reason_summary,
    evidence: data.evidence ?? {},
    previousSnapshot: data.previous_snapshot,
    newSnapshot: data.new_snapshot,
    changedSessionIds: data.changed_session_ids ?? [],
    changedFields: data.changed_fields ?? [],
    modelName: data.model_name ?? null,
    latencyMs: data.latency_ms ?? null,
    wasUserVisible: data.was_user_visible ?? true,
  };
}

export function mapSkillNodeRowToModel(data: Record<string, any>): SkillNode {
  return {
    id: data.id,
    behavior: data.behavior,
    skillCode: data.skill_code,
    title: data.title,
    description: data.description ?? null,
    stage: data.stage,
    difficulty: data.difficulty,
    kind: data.kind,
    protocolId: data.protocol_id ?? null,
    metadata: data.metadata ?? {},
    isActive: data.is_active ?? true,
  };
}

export function mapSkillEdgeRowToModel(data: Record<string, any>): SkillEdge {
  return {
    id: data.id,
    fromSkillId: data.from_skill_id,
    toSkillId: data.to_skill_id,
    edgeType: data.edge_type,
    conditionSummary: data.condition_summary ?? null,
    metadata: data.metadata ?? {},
  };
}

export function mapInAppNotificationRowToModel(data: Record<string, unknown>): InAppNotification {
  return {
    id: String(data.id),
    userId: String(data.user_id),
    dogId: typeof data.dog_id === 'string' ? data.dog_id : null,
    type: data.type === 'plan_updated' ? 'plan_updated' : 'plan_updated',
    title: String(data.title),
    body: String(data.body),
    metadata:
      data.metadata && typeof data.metadata === 'object' && !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : {},
    isRead: data.is_read === true,
    createdAt: String(data.created_at),
    readAt: typeof data.read_at === 'string' ? data.read_at : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Protocol row mapper
//
// Maps a Supabase `protocols` table row to the Protocol type defined in
// constants/protocols.ts.  Used when protocols are fetched from the DB rather
// than imported from the constants file (e.g. for admin tooling or dynamic
// protocol delivery).
//
// Legacy rows that predate PR16 will have:
//   supports_live_pose_coaching = false  (column default)
//   live_coaching_config = null          (column default)
// Both cases are handled gracefully.
// ─────────────────────────────────────────────────────────────────────────────

export function mapProtocolRowToProtocol(data: Record<string, unknown>): Protocol {
  return {
    id:                   String(data.id),
    behavior:             String(data.behavior),
    stage:                (data.stage as Protocol['stage']),
    title:                String(data.title),
    objective:            String(data.objective),
    durationMinutes:      Number(data.duration_minutes),
    repCount:             Number(data.rep_count),
    steps:                Array.isArray(data.steps) ? (data.steps as Protocol['steps']) : [],
    successCriteria:      String(data.success_criteria),
    commonMistakes:       Array.isArray(data.common_mistakes) ? (data.common_mistakes as string[]) : [],
    equipmentNeeded:      Array.isArray(data.equipment_needed) ? (data.equipment_needed as string[]) : [],
    ageMinMonths:         Number(data.age_min_months),
    ageMaxMonths:         Number(data.age_max_months),
    difficulty:           (data.difficulty as Protocol['difficulty']),
    nextProtocolId:       typeof data.next_protocol_id === 'string' ? data.next_protocol_id : null,
    trainerNote:          String(data.trainer_note),
    // PR16 live coaching fields — default to disabled for legacy rows
    supportsLivePoseCoaching:
      data.supports_live_pose_coaching === true,
    liveCoachingConfig:
      data.supports_live_pose_coaching === true &&
      data.live_coaching_config !== null &&
      typeof data.live_coaching_config === 'object'
        ? (data.live_coaching_config as LiveCoachingConfig)
        : null,
  };
}
