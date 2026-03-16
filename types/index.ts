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
  createdAt: string;
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
