import type { Plan, PlanSession } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Today's Session
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the next incomplete session in the plan.
 * Returns null if the plan is complete or no plan exists.
 */
export function getTodaySession(plan: Plan, completedSessions: string[] = []): PlanSession | null {
  if (!plan || plan.sessions.length === 0) return null;

  // Merge in-memory completion with plan's own isCompleted flags
  const completedSet = new Set(completedSessions);

  const next = plan.sessions.find(
    (s) => !s.isCompleted && !completedSet.has(s.id)
  );

  return next ?? null;
}

/**
 * Returns true if all sessions in the plan are completed.
 */
export function isPlanComplete(plan: Plan, completedSessions: string[] = []): boolean {
  const completedSet = new Set(completedSessions);
  return plan.sessions.every((s) => s.isCompleted || completedSet.has(s.id));
}

// ─────────────────────────────────────────────────────────────────────────────
// Walk Goals
// ─────────────────────────────────────────────────────────────────────────────

type WalkGoalKey = `${string}_${number}`;

const WALK_GOALS: Record<string, string> = {
  // Leash pulling
  leash_pulling_1: 'Practice stopping when tension builds — aim for 3 clean stops today',
  leash_pulling_2: 'Hold eye contact at 2 crossings before moving forward',
  leash_pulling_3: 'Try 8 direction changes — make yourself more interesting than the environment',
  // Recall
  recall_1: 'Call once, reward big — even at 5 feet counts as a win',
  recall_2: 'Practice 3 name responses on the walk — stop, call, jackpot when they come',
  recall_3: 'Work on one outdoor recall on the long line if you have it',
  // Jumping
  jumping_up_1: 'Ask every person you meet to follow the four-paws-on-floor rule',
  jumping_up_2: 'Rehearse the auto-sit before entering and leaving the house',
  jumping_up_3: 'Find one stranger to practice a polite greeting — brief them first',
  // Potty training
  potty_training_1: 'Take a trip to the designated spot immediately after this walk',
  potty_training_2: 'Use the potty cue word every time they squat today',
  potty_training_3: 'Track elimination times to spot your dog\'s natural schedule pattern',
  // Crate anxiety
  crate_anxiety_1: 'On return, practice walking calmly past the crate with treats nearby',
  crate_anxiety_2: 'End the walk with a short settle before the crate session',
  crate_anxiety_3: 'Practice the departure routine: walk → settle → crate',
  // Puppy biting
  puppy_biting_1: 'Carry a tug toy on the walk — redirect any mouthing to the toy',
  puppy_biting_2: 'Practice 3 "arousal down" moments: stop, ask for sit, reward calm',
  puppy_biting_3: 'End the walk with a 2-minute calm-on-mat session',
  // Settling
  settling_1: 'End the walk with 2 minutes of mat time to practice the settle cue',
  settling_2: 'Find a bench or café and ask for a settle in a novel environment',
  settling_3: 'Practice "place" in a new spot on this walk — bring a portable mat',
  // Barking
  barking_1: 'Identify your dog\'s threshold distance to their trigger today',
  barking_2: 'Practice 3 "look at that" moments near a mild trigger',
  barking_3: 'Work one trigger exposure at threshold distance, 5 repetitions',
  // Default fallback
  default_1: 'Keep the walk calm and consistent — reward check-ins at your side',
  default_2: 'Practice 3 name responses and reward each with treats',
  default_3: 'End the walk with a 1-minute calm down before going inside',
}

export function getWalkGoal(behavior: string, stage: number): string {
  const key = `${behavior}_${stage}` as WalkGoalKey;
  return WALK_GOALS[key] ?? WALK_GOALS[`default_${Math.min(stage, 3)}`] ?? 'Have a great walk today!';
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan Completion Percentage
// ─────────────────────────────────────────────────────────────────────────────

export function getPlanCompletion(plan: Plan): number {
  if (!plan || plan.sessions.length === 0) return 0;
  const completed = plan.sessions.filter((s) => s.isCompleted).length;
  return Math.round((completed / plan.sessions.length) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone Tracking
// ─────────────────────────────────────────────────────────────────────────────

const MILESTONES = [1, 5, 10, 15, 20, 25, 30] as const;

export function getNextMilestone(completedCount: number): string {
  const next = MILESTONES.find((m) => m > completedCount);
  if (!next) return 'You\'ve hit every milestone — you\'re a training champion!';
  const remaining = next - completedCount;
  if (remaining === 1) return '1 more session to reach your next milestone!';
  return `${remaining} more sessions to reach your ${next}-session milestone!`;
}

export function getLastMilestone(completedCount: number): number | null {
  const hit = [...MILESTONES].reverse().find((m) => m <= completedCount);
  return hit ?? null;
}

export function isRoundStreakNumber(streak: number): boolean {
  return streak > 0 && [7, 14, 21, 30, 60, 90].includes(streak);
}

// ─────────────────────────────────────────────────────────────────────────────
// Greeting Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ─────────────────────────────────────────────────────────────────────────────
// Behavior tag helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getBehaviorLabel(goal: string): string {
  const map: Record<string, string> = {
    'Leash Pulling': 'Leash',
    'Jumping Up': 'Jumping',
    'Barking': 'Barking',
    "Won't Come": 'Recall',
    'Potty Training': 'Potty',
    'Crate Anxiety': 'Crate',
    'Puppy Biting': 'Biting',
    'Settling': 'Settling',
  };
  return map[goal] ?? goal;
}
