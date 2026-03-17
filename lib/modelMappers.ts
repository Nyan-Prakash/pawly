import type {
  Article,
  Dog,
  DogLearningState,
  InAppNotification,
  Plan,
  PlanAdaptation,
  PlanMetadata,
  PlanSession,
  PostSessionReflection,
  SkillEdge,
  SkillNode,
} from '../types/index.ts';
import type { Protocol, LiveCoachingConfig } from '../constants/protocols.ts';
import { normalizeArticleContentBlocks, normalizeArticleDifficulty } from './articleContent.ts';
import { getGoalColor } from '../constants/courseColors';

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
  const goal = data.goal;
  return {
    id: data.id,
    dogId: data.dog_id,
    goal,
    status: data.status,
    durationWeeks: data.duration_weeks,
    sessionsPerWeek: data.sessions_per_week,
    currentWeek: data.current_week,
    currentStage: data.current_stage,
    sessions: mapPlanSessions(data.sessions),
    metadata: (data.metadata ?? {}) as PlanMetadata,
    color: data.color ?? getGoalColor(goal),
    createdAt: data.created_at,
    // PR-18 multi-course fields (columns may not exist on old rows → safe defaults)
    courseTitle: data.course_title ?? null,
    priority: data.priority ?? 0,
    isPrimary: data.is_primary ?? false,
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

export function mapArticleRowToModel(data: Record<string, unknown>): Article {
  return {
    id: String(data.id),
    slug: String(data.slug),
    title: String(data.title),
    excerpt: String(data.excerpt),
    content: normalizeArticleContentBlocks(data.content),
    category: String(data.category),
    difficulty: normalizeArticleDifficulty(data.difficulty),
    readTimeMinutes:
      typeof data.read_time_minutes === 'number' && Number.isFinite(data.read_time_minutes)
        ? data.read_time_minutes
        : 1,
    isFeatured: data.is_featured === true,
    isPublished: data.is_published !== false,
    coverImageUrl: typeof data.cover_image_url === 'string' ? data.cover_image_url : null,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((item): item is string => typeof item === 'string')
      : [],
    sortOrder: typeof data.sort_order === 'number' && Number.isFinite(data.sort_order) ? data.sort_order : 0,
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Session log row mapper
//
// Maps a session_logs DB row to a plain app-layer object with camelCase fields.
// Used wherever a typed session log model is needed outside of the raw
// SessionLogInput (which stays snake_case for direct Supabase compat).
//
// post_session_reflection is stored as JSONB.  Rows written before this column
// was added will return null — that is handled gracefully.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Reflection normalization ─────────────────────────────────────────────────
//
// Guards against malformed or legacy DB rows reaching the app layer.
// Strategy: if the top-level value is not a plain object, return null.
// For each enum field: if the stored value is not in the known set, normalize
// to null rather than forwarding an unknown string.
// This lets the app-layer consumers rely on strong typing.
// ─────────────────────────────────────────────────────────────────────────────

const VALID_OVERALL_EXPECTATION = new Set(['better_than_expected', 'as_expected', 'worse_than_expected']);
const VALID_MAIN_ISSUE = new Set(['did_not_understand', 'broke_position', 'distracted', 'over_excited', 'tired_done', 'handler_inconsistent', 'no_major_issue']);
const VALID_FAILURE_TIMING = new Set(['immediately', 'midway', 'near_end', 'never_stabilized']);
const VALID_DISTRACTION_TYPE = new Set(['dogs', 'people', 'smells', 'noise_movement', 'other']);
const VALID_CUE_UNDERSTANDING = new Set(['yes', 'not_yet', 'unsure']);
const VALID_AROUSAL_LEVEL = new Set(['calm', 'slightly_up', 'very_up']);
const VALID_HANDLER_ISSUE = new Set(['timing_rewards', 'cue_consistency', 'leash_setup', 'session_focus', 'other']);
const VALID_CONFIDENCE = new Set([1, 2, 3, 4, 5]);

function pickEnum<T>(value: unknown, validSet: Set<unknown>): T | null {
  return validSet.has(value) ? (value as T) : null;
}

/**
 * Normalizes a raw DB value for post_session_reflection into a typed
 * PostSessionReflection or null.
 *
 * Returns null when:
 *   - the value is null or undefined (missing column, legacy row)
 *   - the value is not a plain object (e.g. an array, a string)
 *
 * For each field: unknown enum values are normalized to null rather than
 * forwarded, so callers can rely on the declared union types.
 */
export function normalizePostSessionReflection(raw: unknown): PostSessionReflection | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;

  const r = raw as Record<string, unknown>;

  return {
    overallExpectation:  pickEnum(r.overallExpectation,  VALID_OVERALL_EXPECTATION),
    mainIssue:           pickEnum(r.mainIssue,           VALID_MAIN_ISSUE),
    failureTiming:       pickEnum(r.failureTiming,       VALID_FAILURE_TIMING),
    distractionType:     pickEnum(r.distractionType,     VALID_DISTRACTION_TYPE),
    cueUnderstanding:    pickEnum(r.cueUnderstanding,    VALID_CUE_UNDERSTANDING),
    arousalLevel:        pickEnum(r.arousalLevel,        VALID_AROUSAL_LEVEL),
    handlerIssue:        pickEnum(r.handlerIssue,        VALID_HANDLER_ISSUE),
    confidenceInAnswers: pickEnum(r.confidenceInAnswers, VALID_CONFIDENCE),
    freeformNote:        typeof r.freeformNote === 'string' ? r.freeformNote : null,
  };
}

export interface SessionLogModel {
  id: string;
  userId: string;
  dogId: string;
  planId: string;
  sessionId: string;
  exerciseId: string;
  protocolId: string;
  durationSeconds: number;
  difficulty: 'easy' | 'okay' | 'hard';
  notes: string | null;
  completedAt: string;
  successScore: number | null;
  sessionStatus: 'completed' | 'abandoned';
  skillId: string | null;
  sessionKind: PlanSession['sessionKind'] | null;
  environmentTag: string | null;
  liveCoachingUsed: boolean;
  postSessionReflection: PostSessionReflection | null;
}

/**
 * Maps a raw session_logs Supabase row to a typed camelCase model.
 * Safe for rows that predate the post_session_reflection column (returns null).
 */
export function mapSessionLogRowToModel(data: Record<string, unknown>): SessionLogModel {
  const postSessionReflection = normalizePostSessionReflection(data.post_session_reflection);

  return {
    id: String(data.id),
    userId: String(data.user_id),
    dogId: String(data.dog_id),
    planId: String(data.plan_id),
    sessionId: String(data.session_id),
    exerciseId: String(data.exercise_id),
    protocolId: String(data.protocol_id),
    durationSeconds: typeof data.duration_seconds === 'number' ? data.duration_seconds : 0,
    difficulty: (data.difficulty as 'easy' | 'okay' | 'hard') ?? 'okay',
    notes: typeof data.notes === 'string' ? data.notes : null,
    completedAt: String(data.completed_at),
    successScore: typeof data.success_score === 'number' ? data.success_score : null,
    sessionStatus: data.session_status === 'abandoned' ? 'abandoned' : 'completed',
    skillId: typeof data.skill_id === 'string' ? data.skill_id : null,
    sessionKind: (data.session_kind as PlanSession['sessionKind']) ?? null,
    environmentTag: typeof data.environment_tag === 'string' ? data.environment_tag : null,
    liveCoachingUsed: data.live_coaching_used === true,
    postSessionReflection,
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
