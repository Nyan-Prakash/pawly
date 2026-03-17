export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type DogProfile = {
  id: string;
  name: string;
};

export type SubscriptionTier = 'free' | 'core' | 'premium';

export interface AppUser {
  id: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  onboardingCompletedAt: string | null;
  householdId: string | null;
  createdAt: string;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  breedGroup: string;
  ageMonths: number;
  sex: 'male' | 'female';
  neutered: boolean;
  environmentType: 'apartment' | 'house_no_yard' | 'house_yard';
  behaviorGoals: string[];
  trainingExperience: 'none' | 'some' | 'experienced';
  equipment: string[];
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
  scheduleNotes: string | null;
  scheduleVersion: number;
  timezone: string;
  lifecycleStage: string;
  createdAt: string;
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type TimeWindow =
  | 'early_morning'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'late_evening';

export type SessionStyle = 'micro' | 'balanced' | 'focused';
export type ScheduleFlexibility = 'skip' | 'move_next_slot' | 'move_tomorrow';
export type ScheduleIntensity = 'gentle' | 'balanced' | 'aggressive';

export interface TrainingSchedulePrefs {
  preferredTrainingDays: Weekday[];
  preferredTrainingWindows: Partial<Record<Weekday, TimeWindow[]>>;
  preferredTrainingTimes: Partial<Record<Weekday, string[]>>;
  usualWalkTimes: string[];
  sessionStyle: SessionStyle;
  scheduleFlexibility: ScheduleFlexibility;
  scheduleIntensity: ScheduleIntensity;
  blockedDays: Weekday[];
  blockedDates: string[];
  timezone: string;
}

/** Type of support session inserted by the adaptation engine. */
export type SupportSessionType =
  | 'foundation'
  | 'transition'
  | 'duration_building'
  | 'calm_reset';

export interface PlanSession {
  id: string;
  exerciseId: string;
  weekNumber: number;
  dayNumber: number;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
  scheduledDay?: Weekday;
  scheduledTime?: string;
  scheduledDate?: string;
  isReschedulable?: boolean;
  autoRescheduledFrom?: string | null;
  schedulingReason?: string;
  isMissed?: boolean;
  skillId?: string;
  parentSkillId?: string | null;
  environment?: PlanEnvironment;
  sessionKind?: 'core' | 'repeat' | 'regress' | 'advance' | 'detour' | 'proofing';
  adaptationSource?: 'initial_plan' | 'adaptation_engine';
  reasoningLabel?: string | null;
  /**
   * True when this session was inserted by the adaptation engine as an extra
   * support session (not part of the original plan scaffold).
   */
  insertedByAdaptation?: boolean;
  /**
   * The support-session type when insertedByAdaptation is true.
   * Describes the purpose of the inserted session.
   */
  supportSessionType?: SupportSessionType | null;
  /** Reason code of the adaptation event that caused the insertion. */
  insertionReasonCode?: string | null;
}

export interface PlanMetadata {
  scheduleVersion?: number;
  preferredDays?: Weekday[];
  preferredWindows?: Partial<Record<Weekday, TimeWindow[]>>;
  flexibility?: ScheduleFlexibility;
  intensity?: ScheduleIntensity;
  explanation?: string[];
  scheduleSummary?: string;
  timezone?: string;
  adaptationCount?: number;
  lastAdaptedAt?: string | null;
  lastAdaptationSummary?: string | null;
  activeSkillFocus?: string | null;
  currentEnvironmentTrack?: PlanEnvironment | null;
}

export interface Plan {
  id: string;
  dogId: string;
  goal: string;
  status: 'active' | 'completed' | 'paused';
  durationWeeks: number;
  sessionsPerWeek: number;
  currentWeek: number;
  currentStage: string;
  sessions: PlanSession[];
  metadata?: PlanMetadata;
  color?: string;
  createdAt: string;
  // ── Multi-course fields (PR-18) ──────────────────────────────────────────
  /** Human-readable course name shown in multi-plan UI (e.g. "Loose Leash Walking"). */
  courseTitle: string | null;
  /** Higher = shown first in lists; default 0. */
  priority: number;
  /** At most one active plan per dog should have this set to true. */
  isPrimary: boolean;
}

/**
 * Lightweight plan metadata for list UIs — avoids shipping full sessions array
 * when only summary info is needed.
 */
export interface PlanSummary {
  id: string;
  dogId: string;
  goal: string;
  courseTitle: string | null;
  status: Plan['status'];
  isPrimary: boolean;
  priority: number;
  currentWeek: number;
  durationWeeks: number;
  sessionsPerWeek: number;
  completionPercentage: number;
  todaySession: PlanSession | null;
  createdAt: string;
}

/**
 * A PlanSession enriched with its parent plan's id and goal — used in
 * multi-plan session lists so the UI can show which course each session
 * belongs to.
 */
export interface EnrichedPlanSession extends PlanSession {
  planId: string;
  planGoal: string;
  planCourseTitle: string | null;
  isPrimaryPlan: boolean;
}

export interface BehaviorGoal {
  id: string;
  dogId: string;
  goal: string;
  isPrimary: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  createdAt: string;
}

export interface SessionScore {
  sessionId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  completedAt: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface CoachConversation {
  id: string;
  userId: string;
  dogId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPrefs {
  dailyReminder: boolean;
  dailyReminderTime: string;
  walkReminders: boolean;
  postWalkCheckIn: boolean;
  streakAlerts: boolean;
  milestoneAlerts: boolean;
  insights: boolean;
  expertReview: boolean;
  lifecycle: boolean;
  weeklySummary: boolean;
  scheduledSessionReminders: boolean;
  reminderLeadMinutes: number;
  fallbackMissedSessionReminders: boolean;
}

export type InAppNotificationType = 'plan_updated';

export interface InAppNotification {
  id: string;
  userId: string;
  dogId: string | null;
  type: InAppNotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

// ─── Post-Session Reflection ──────────────────────────────────────────────────

/**
 * Handler's perceived expectation relative to how the session actually went.
 */
export type ReflectionExpectationGap =
  | 'better_than_expected'
  | 'as_expected'
  | 'worse_than_expected';

/**
 * The primary failure mode or issue observed during the session.
 */
export type ReflectionMainIssue =
  | 'did_not_understand'
  | 'broke_position'
  | 'distracted'
  | 'over_excited'
  | 'tired_done'
  | 'handler_inconsistent'
  | 'no_major_issue';

/**
 * When during the session the dog started failing (if applicable).
 */
export type ReflectionFailureTiming =
  | 'immediately'
  | 'midway'
  | 'near_end'
  | 'never_stabilized';

/**
 * The type of external stimulus that drew the dog's attention.
 */
export type ReflectionDistractionType =
  | 'dogs'
  | 'people'
  | 'smells'
  | 'noise_movement'
  | 'other';

/**
 * Whether the dog appeared to understand the cue being trained.
 */
export type ReflectionCueUnderstanding = 'yes' | 'not_yet' | 'unsure';

/**
 * Observed arousal / energy state of the dog during the session.
 */
export type ReflectionArousalLevel = 'calm' | 'slightly_up' | 'very_up';

/**
 * Self-identified handler error that may have contributed to difficulty.
 */
export type ReflectionHandlerIssue =
  | 'timing_rewards'
  | 'cue_consistency'
  | 'leash_setup'
  | 'session_focus'
  | 'other';

/**
 * Identifier for each question in the post-session reflection flow.
 * Used for validation and conditional branching logic.
 */
export type ReflectionQuestionId =
  | 'overallExpectation'
  | 'mainIssue'
  | 'failureTiming'
  | 'distractionType'
  | 'cueUnderstanding'
  | 'arousalLevel'
  | 'handlerIssue'
  | 'confidenceInAnswers'
  | 'freeformNote';

/**
 * Structured post-session reflection captured from the handler after a
 * training session completes. Stored as JSONB in session_logs and used as
 * richer signal input for the adaptive planning engine.
 *
 * All answer fields are nullable so partially completed reflections can be
 * stored safely. UI flow controls which questions are presented.
 */
export interface PostSessionReflection {
  /** How the session compared to the handler's expectations. */
  overallExpectation: ReflectionExpectationGap | null;
  /** Primary issue observed during the session, if any. */
  mainIssue: ReflectionMainIssue | null;
  /** When during the session failures occurred (only relevant when mainIssue !== 'no_major_issue'). */
  failureTiming: ReflectionFailureTiming | null;
  /** What distracted the dog (only relevant when mainIssue === 'distracted'). */
  distractionType: ReflectionDistractionType | null;
  /** Whether the dog appeared to understand the cue. */
  cueUnderstanding: ReflectionCueUnderstanding | null;
  /** The dog's arousal level during the session. */
  arousalLevel: ReflectionArousalLevel | null;
  /** Handler error that may have contributed to difficulty (only relevant when mainIssue === 'handler_inconsistent'). */
  handlerIssue: ReflectionHandlerIssue | null;
  /** Handler's self-assessed confidence in the accuracy of these answers (1 = low, 5 = high). */
  confidenceInAnswers: 1 | 2 | 3 | 4 | 5 | null;
  /** Optional freeform note to supplement structured answers. */
  freeformNote: string | null;
}

// ─── Progress & Walk Tracking ─────────────────────────────────────────────────

export interface WalkLog {
  id: string;
  userId: string;
  dogId: string;
  quality: 1 | 2 | 3; // 1=harder, 2=same, 3=better
  notes?: string;
  durationMinutes?: number;
  goalAchieved?: boolean | null;
  loggedAt: string;
}

export interface Milestone {
  id: string;
  userId: string;
  dogId: string;
  milestoneId: string;
  title: string;
  description: string;
  emoji: string;
  achievedAt: string;
}

export interface BehaviorScore {
  behavior: string;
  currentStage: number;
  totalStages: 4;
  sessionCount: number;
  trend: 'improving' | 'stable' | 'declining';
  lastSessionScore: number;
}

export interface WeeklyData {
  weekStart: string;
  sessionsCompleted: number;
  avgSuccessScore: number;
}

export interface WeeklyWalkData {
  date: string;
  quality: 1 | 2 | 3 | null;
}

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  checkFn: (data: MilestoneCheckData) => boolean;
}

export interface MilestoneCheckData {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  stageAdvances: number;
  walkStreak: number;
  consecutiveWalkImprovements: number;
  videosUploaded: number;
}

// ─── Articles ───────────────────────────────────────────────────────────────

export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ArticleContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string }
  | { type: 'checklist'; items: string[] };

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: ArticleContentBlock[];
  category: string;
  difficulty: ArticleDifficulty;
  readTimeMinutes: number;
  isFeatured: boolean;
  isPublished: boolean;
  coverImageUrl?: string | null;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Video & Expert Review ─────────────────────────────────────────────────

export type VideoContext = 'onboarding' | 'session' | 'behavior';

export type ExpertReviewStatus = 'queued' | 'in_review' | 'complete';

export interface VideoRecord {
  id: string;
  userId: string;
  dogId: string;
  storagePath: string;
  thumbnailPath: string | null;
  durationSeconds: number;
  context: VideoContext;
  behaviorContext: string | null;
  beforeContext: string | null;
  goalContext: string | null;
  uploadedAt: string;
  expertReview?: ExpertReview;
}

export interface TimestampMarker {
  time: number; // seconds
  note: string;
}

export interface ExpertReview {
  id: string;
  videoId: string;
  userId: string;
  status: ExpertReviewStatus;
  trainerName: string | null;
  trainerPhotoUrl: string | null;
  feedback: string | null;
  timestamps: TimestampMarker[];
  requestedAt: string;
  completedAt: string | null;
}

export interface ReviewCredit {
  userId: string;
  creditsRemaining: number;
}

// ─── Adaptive Planning ───────────────────────────────────────────────────────

export type AdaptationType =
  | 'repeat'
  | 'regress'
  | 'advance'
  | 'detour'
  | 'difficulty_adjustment'
  | 'schedule_adjustment'
  | 'environment_adjustment';

export type AdaptationStatus = 'applied' | 'skipped' | 'rolled_back';

export type SkillNodeKind = 'foundation' | 'core' | 'proofing' | 'recovery' | 'diagnostic';

export type SkillEdgeType = 'prerequisite' | 'advance' | 'regress' | 'detour' | 'proofing';

export interface LearningHypothesis {
  code: string;
  summary: string;
  evidence: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface DogLearningState {
  id: string;
  dogId: string;
  createdAt: string;
  updatedAt: string;
  motivationScore: number;
  distractionSensitivity: number;
  confidenceScore: number;
  impulseControlScore: number;
  handlerConsistencyScore: number;
  fatigueRiskScore: number;
  recoverySpeedScore: number;
  environmentConfidence: Record<string, number>;
  behaviorSignals: Record<string, unknown>;
  recentTrends: Record<string, unknown>;
  currentHypotheses: LearningHypothesis[];
  lastEvaluatedAt: string | null;
  version: number;
}

export interface PlanAdaptation {
  id: string;
  dogId: string;
  planId: string;
  triggeredBySessionLogId: string | null;
  createdAt: string;
  adaptationType: AdaptationType;
  status: AdaptationStatus;
  reasonCode: string;
  reasonSummary: string;
  evidence: Record<string, unknown>;
  previousSnapshot: Record<string, unknown>;
  newSnapshot: Record<string, unknown>;
  changedSessionIds: string[];
  changedFields: string[];
  modelName: string | null;
  latencyMs: number | null;
  wasUserVisible: boolean;
}

export interface SkillNode {
  id: string;
  behavior: string;
  skillCode: string;
  title: string;
  description: string | null;
  stage: number;
  difficulty: number;
  kind: SkillNodeKind;
  protocolId: string | null;
  metadata: Record<string, unknown>;
  isActive: boolean;
}

export interface SkillEdge {
  id: string;
  fromSkillId: string;
  toSkillId: string;
  edgeType: SkillEdgeType;
  conditionSummary: string | null;
  metadata: Record<string, unknown>;
}

export interface AdaptivePlanFeatureFlags {
  enableAdaptivePlanner: boolean;
  enableAdaptivePlanPreview: boolean;
  enableAdaptationEngine: boolean;
  enableCoachAdaptationExplanations: boolean;
  enableLearningStateUpdates: boolean;
}

export interface PlanReasoningSummary {
  adaptationId: string;
  reasonCode: string;
  reasonSummary: string;
  adaptationType: AdaptationType;
  wasUserVisible: boolean;
}

export interface PlanChangeSummary {
  adaptationId: string;
  changedSessionIds: string[];
  changedFields: string[];
  previousSnapshot: Record<string, unknown>;
  newSnapshot: Record<string, unknown>;
}

export interface AdaptationApiResult {
  applied: boolean;
  skipped: boolean;
  adaptationId: string | null;
  adaptationType: AdaptationType | null;
  reasonCode: string | null;
  reasonSummary: string | null;
  changedSessionIds: string[];
  changedFields: string[];
}

// ─── Adaptive Planner ─────────────────────────────────────────────────────────

export type PlannerMode = 'adaptive_ai' | 'rules_fallback';

export type PlanEnvironment =
  | 'indoors_low_distraction'
  | 'indoors_moderate_distraction'
  | 'outdoors_low_distraction'
  | 'outdoors_moderate_distraction'
  | 'outdoors_high_distraction';

export type PlanSessionKind = 'core' | 'repeat' | 'proofing';

export interface AISkillSelection {
  skillId: string;
  sessionCount: number;
  environment: PlanEnvironment;
  sessionKind: PlanSessionKind;
  reasoningLabel: string;
}

export interface AIWeekStructure {
  weekNumber: number;
  focus: string;
  skillSequence: AISkillSelection[];
}

export interface AIPlanningSummary {
  whyThisStart: string;
  keyAssumptions: string[];
  risksToWatch: string[];
}

export interface AIPlannerOutput {
  primaryGoal: string;
  startingSkillId: string;
  planHorizonWeeks: number;
  sessionsPerWeek: number;
  weeklyStructure: AIWeekStructure[];
  planningSummary: AIPlanningSummary;
}

export interface PlannerValidationError {
  field: string;
  message: string;
}

export interface AdaptivePlanMetadata extends PlanMetadata {
  plannerVersion: string;
  plannerMode: PlannerMode;
  planningSummary?: AIPlanningSummary;
  selectedSkillIds: string[];
  validationWarnings: string[];
  scheduleExplanation?: string;
}

export interface AdaptivePlanRequest {
  dogId: string;
  userId: string;
}

export interface AdaptivePlanResult {
  plan: Plan;
  plannerMode: PlannerMode;
  planningSummary?: AIPlanningSummary;
  fallbackReason?: string;
}
