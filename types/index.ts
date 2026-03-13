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

// ─── Progress & Walk Tracking ─────────────────────────────────────────────────

export interface WalkLog {
  id: string;
  userId: string;
  dogId: string;
  quality: 1 | 2 | 3; // 1=harder, 2=same, 3=better
  notes?: string;
  durationMinutes?: number;
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
