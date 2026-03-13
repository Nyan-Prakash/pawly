import { supabase } from '@/lib/supabase';
import type { Milestone, MilestoneDefinition, MilestoneCheckData } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Milestone Definitions
// ─────────────────────────────────────────────────────────────────────────────

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: 'first_session',
    title: 'First step taken',
    description: 'Completed your first training session',
    emoji: 'paw',
    checkFn: (data) => data.totalSessions >= 1,
  },
  {
    id: 'streak_3',
    title: '3-day streak',
    description: '3 days of training in a row',
    emoji: 'flame',
    checkFn: (data) => data.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'One week strong',
    description: '7 days of training in a row',
    emoji: 'flame',
    checkFn: (data) => data.currentStreak >= 7,
  },
  {
    id: 'streak_14',
    title: 'Two-week warrior',
    description: '14 days of training in a row',
    emoji: 'barbell',
    checkFn: (data) => data.currentStreak >= 14,
  },
  {
    id: 'streak_30',
    title: '30-day legend',
    description: '30 days of training in a row',
    emoji: 'ribbon',
    checkFn: (data) => data.currentStreak >= 30,
  },
  {
    id: 'sessions_10',
    title: '10 sessions done',
    description: 'Completed 10 training sessions',
    emoji: 'star',
    checkFn: (data) => data.totalSessions >= 10,
  },
  {
    id: 'sessions_25',
    title: '25 sessions done',
    description: 'Quarter century of training sessions',
    emoji: 'trophy',
    checkFn: (data) => data.totalSessions >= 25,
  },
  {
    id: 'sessions_50',
    title: '50 sessions done',
    description: 'An incredible commitment to your dog',
    emoji: 'diamond',
    checkFn: (data) => data.totalSessions >= 50,
  },
  {
    id: 'stage_advance',
    title: 'Level up',
    description: 'Advanced to a new training stage',
    emoji: 'flag',
    checkFn: (data) => data.stageAdvances >= 1,
  },
  {
    id: 'walk_streak_5',
    title: '5 walks logged',
    description: 'Logged 5 consecutive days of walks',
    emoji: 'walk',
    checkFn: (data) => data.walkStreak >= 5,
  },
  {
    id: 'walk_streak_14',
    title: 'Two-week walker',
    description: '14 days of walks logged in a row',
    emoji: 'sparkles',
    checkFn: (data) => data.walkStreak >= 14,
  },
  {
    id: 'walk_improvement',
    title: 'Walks getting better',
    description: '3 consecutive walk quality improvements',
    emoji: 'trending-up',
    checkFn: (data) => data.consecutiveWalkImprovements >= 3,
  },
  {
    id: 'first_video',
    title: 'Show and tell',
    description: 'Uploaded your first training video',
    emoji: 'film',
    checkFn: (data) => data.videosUploaded >= 1,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Check & Award Milestones
// ─────────────────────────────────────────────────────────────────────────────

export async function checkMilestones(
  dogId: string,
  userId: string
): Promise<Milestone | null> {
  // Fetch all data needed for checks
  const [
    sessionCountResult,
    streakResult,
    walkStreakResult,
    walkLogsResult,
    achievedResult,
  ] = await Promise.all([
    supabase
      .from('session_logs')
      .select('id', { count: 'exact', head: true })
      .eq('dog_id', dogId),
    supabase
      .from('streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .eq('dog_id', dogId)
      .single(),
    supabase
      .from('walk_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .eq('dog_id', dogId)
      .single(),
    supabase
      .from('walk_logs')
      .select('quality, logged_at')
      .eq('dog_id', dogId)
      .order('logged_at', { ascending: false })
      .limit(10),
    supabase
      .from('milestones')
      .select('milestone_id')
      .eq('user_id', userId)
      .eq('dog_id', dogId),
  ]);

  const alreadyAchieved = new Set(
    (achievedResult.data ?? []).map((r: { milestone_id: string }) => r.milestone_id)
  );

  // Compute consecutive walk improvements
  let consecutiveWalkImprovements = 0;
  const walkLogs = walkLogsResult.data ?? [];
  for (let i = 0; i < walkLogs.length - 1; i++) {
    if (walkLogs[i].quality > walkLogs[i + 1].quality) {
      consecutiveWalkImprovements++;
    } else {
      break;
    }
  }

  const checkData: MilestoneCheckData = {
    totalSessions: sessionCountResult.count ?? 0,
    currentStreak: streakResult.data?.current_streak ?? 0,
    longestStreak: streakResult.data?.longest_streak ?? 0,
    stageAdvances: 0, // simplified for now — stage advance tracking in plan store
    walkStreak: walkStreakResult.data?.current_streak ?? 0,
    consecutiveWalkImprovements,
    videosUploaded: 0, // placeholder until video upload tracking added
  };

  // Find the first unachieved milestone that is now earned
  for (const def of MILESTONE_DEFINITIONS) {
    if (!alreadyAchieved.has(def.id) && def.checkFn(checkData)) {
      return {
        id: '', // will be assigned by DB
        userId,
        dogId,
        milestoneId: def.id,
        title: def.title,
        description: def.description,
        emoji: def.emoji,
        achievedAt: new Date().toISOString(),
      };
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Get next achievable milestone (for "almost there" UI)
// ─────────────────────────────────────────────────────────────────────────────

export function getNextMilestoneDefinition(
  achievedIds: string[]
): MilestoneDefinition | null {
  const achieved = new Set(achievedIds);
  return MILESTONE_DEFINITIONS.find((def) => !achieved.has(def.id)) ?? null;
}
