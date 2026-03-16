import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { updateLearningStateFromWalkLog } from '@/lib/adaptivePlanning/learningStateEngine';
import { triggerPlanAdaptation } from '@/lib/sessionManager';
import { didUpcomingScheduleChange } from '@/lib/notifications';
import type {
  Milestone,
  BehaviorScore,
  WeeklyData,
  WeeklyWalkData,
} from '@/types';
import { checkMilestones } from '@/lib/milestoneEngine';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore } from '@/stores/planStore';

// ─────────────────────────────────────────────────────────────────────────────
// Store Interface
// ─────────────────────────────────────────────────────────────────────────────

interface ProgressStore {
  sessionStreak: number;
  walkStreak: number;
  longestSessionStreak: number;
  totalSessionsCompleted: number;
  sessionsByWeek: WeeklyData[];
  walkQualityByWeek: WeeklyWalkData[];
  behaviorScores: BehaviorScore[];
  milestones: Milestone[];
  walkLoggedToday: boolean;
  isLoading: boolean;

  fetchProgressData: (dogId: string, userId: string) => Promise<void>;
  logWalk: (
    userId: string,
    dogId: string,
    quality: 1 | 2 | 3,
    notes?: string,
    durationMinutes?: number,
    goalAchieved?: boolean | null
  ) => Promise<Milestone | null>;
  fetchMilestones: (dogId: string, userId: string) => Promise<void>;
  checkAndCreateMilestones: (dogId: string, userId: string) => Promise<Milestone | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers (module-level, no store dependency)
// ─────────────────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d.toISOString().split('T')[0];
}

function getLast14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

async function computeBehaviorScores(dogId: string): Promise<BehaviorScore[]> {
  const { data: plan } = await supabase
    .from('plans')
    .select('goal, current_stage')
    .eq('dog_id', dogId)
    .eq('status', 'active')
    .single();

  if (!plan) return [];

  const { count } = await supabase
    .from('session_logs')
    .select('id', { count: 'exact', head: true })
    .eq('dog_id', dogId);

  const { data: recentSessions } = await supabase
    .from('session_logs')
    .select('difficulty, completed_at')
    .eq('dog_id', dogId)
    .order('completed_at', { ascending: false })
    .limit(6);

  const stageStr = plan.current_stage ?? 'Stage 1';
  const stageNum = parseInt(stageStr.match(/\d/)?.[0] ?? '1', 10);

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentSessions && recentSessions.length >= 6) {
    const scoreOf = (d: string) => (d === 'easy' ? 3 : d === 'okay' ? 2 : 1);
    const recent3 = recentSessions.slice(0, 3).reduce((s, r) => s + scoreOf(r.difficulty), 0);
    const prev3 = recentSessions.slice(3, 6).reduce((s, r) => s + scoreOf(r.difficulty), 0);
    if (recent3 > prev3) trend = 'improving';
    else if (recent3 < prev3) trend = 'declining';
  }

  const lastDifficulty = recentSessions?.[0]?.difficulty;
  const lastScore = lastDifficulty === 'easy' ? 5 : lastDifficulty === 'okay' ? 3 : 1;

  return [
    {
      behavior: plan.goal,
      currentStage: stageNum,
      totalStages: 4,
      sessionCount: count ?? 0,
      trend,
      lastSessionScore: lastScore,
    },
  ];
}

async function updateWalkStreak(userId: string, dogId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('walk_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('dog_id', dogId)
    .single();

  if (!existing) {
    await supabase.from('walk_streaks').insert({
      user_id: userId,
      dog_id: dogId,
      current_streak: 1,
      longest_streak: 1,
      last_walk_date: today,
    });
    return;
  }

  if (existing.last_walk_date === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newStreak =
    existing.last_walk_date === yesterdayStr ? existing.current_streak + 1 : 1;

  await supabase
    .from('walk_streaks')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, existing.longest_streak ?? 0),
      last_walk_date: today,
    })
    .eq('id', existing.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useProgressStore = create<ProgressStore>((set, get) => ({
  sessionStreak: 0,
  walkStreak: 0,
  longestSessionStreak: 0,
  totalSessionsCompleted: 0,
  sessionsByWeek: [],
  walkQualityByWeek: [],
  behaviorScores: [],
  milestones: [],
  walkLoggedToday: false,
  isLoading: false,

  fetchProgressData: async (dogId: string, userId: string) => {
    set({ isLoading: true });

    try {
      const today = new Date().toISOString().split('T')[0];
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const [streakResult, sessionsResult, walkLogsResult, walkLogTodayResult] =
        await Promise.all([
          supabase
            .from('streaks')
            .select('current_streak, longest_streak')
            .eq('user_id', userId)
            .eq('dog_id', dogId)
            .single(),
          supabase
            .from('session_logs')
            .select('completed_at, difficulty')
            .eq('dog_id', dogId)
            .gte('completed_at', fourWeeksAgo.toISOString())
            .order('completed_at', { ascending: true }),
          supabase
            .from('walk_logs')
            .select('logged_at, quality')
            .eq('dog_id', dogId)
            .gte(
              'logged_at',
              new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            )
            .order('logged_at', { ascending: true }),
          supabase
            .from('walk_logs')
            .select('id')
            .eq('dog_id', dogId)
            .gte('logged_at', `${today}T00:00:00`)
            .lte('logged_at', `${today}T23:59:59`)
            .limit(1),
        ]);

      const sessionStreak = streakResult.data?.current_streak ?? 0;
      const longestSessionStreak = streakResult.data?.longest_streak ?? 0;

      const { data: walkStreakData } = await supabase
        .from('walk_streaks')
        .select('current_streak')
        .eq('dog_id', dogId)
        .eq('user_id', userId)
        .single();
      const walkStreak = walkStreakData?.current_streak ?? 0;

      const { count: totalCount } = await supabase
        .from('session_logs')
        .select('id', { count: 'exact', head: true })
        .eq('dog_id', dogId);

      // Sessions by week
      const weekMap: Record<string, { count: number; scores: number[] }> = {};
      for (const row of sessionsResult.data ?? []) {
        const weekStart = getWeekStart(new Date(row.completed_at));
        if (!weekMap[weekStart]) weekMap[weekStart] = { count: 0, scores: [] };
        weekMap[weekStart].count += 1;
        const score = row.difficulty === 'easy' ? 5 : row.difficulty === 'okay' ? 3 : 1;
        weekMap[weekStart].scores.push(score);
      }
      const sessionsByWeek: WeeklyData[] = Object.entries(weekMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStart, data]) => ({
          weekStart,
          sessionsCompleted: data.count,
          avgSuccessScore:
            data.scores.length > 0
              ? Math.round(
                  data.scores.reduce((a, b) => a + b, 0) / data.scores.length
                )
              : 0,
        }));

      // Walk quality by day
      const walkByDate: Record<string, 1 | 2 | 3> = {};
      for (const row of walkLogsResult.data ?? []) {
        const date = new Date(row.logged_at).toISOString().split('T')[0];
        walkByDate[date] = row.quality as 1 | 2 | 3;
      }
      const walkQualityByWeek: WeeklyWalkData[] = getLast14Days().map((date) => ({
        date,
        quality: walkByDate[date] ?? null,
      }));

      const behaviorScores = await computeBehaviorScores(dogId);

      set({
        sessionStreak,
        longestSessionStreak,
        walkStreak,
        totalSessionsCompleted: totalCount ?? 0,
        sessionsByWeek,
        walkQualityByWeek,
        behaviorScores,
        walkLoggedToday: (walkLogTodayResult.data?.length ?? 0) > 0,
        isLoading: false,
      });
    } catch (err) {
      console.warn('[progressStore] fetchProgressData error:', err);
      set({ isLoading: false });
    }
  },

  logWalk: async (userId, dogId, quality, notes, durationMinutes, goalAchieved) => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('walk_logs')
      .insert({
        user_id: userId,
        dog_id: dogId,
        quality,
        notes: notes ?? null,
        duration_minutes: durationMinutes ?? null,
        goal_achieved: goalAchieved ?? null,
        logged_at: now,
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[progressStore] logWalk error:', error.message);
      throw error;
    }

    if (data?.id) {
      updateLearningStateFromWalkLog(data.id)
        .then(async () => {
          if (quality !== 1 && goalAchieved !== false) return;

          const activePlan = usePlanStore.getState().activePlan;
          if (!activePlan?.id) return;

          const planBeforeRefresh = activePlan;
          const adaptation = await triggerPlanAdaptation({
            dogId,
            planId: activePlan.id,
            triggeredByWalkLogId: data.id,
          });

          if (!adaptation?.applied) return;

          await usePlanStore.getState().refreshPlan().catch(() => {});
          const refreshedPlan = usePlanStore.getState().activePlan;
          const dog = useDogStore.getState().dog;
          if (dog && refreshedPlan && didUpcomingScheduleChange(planBeforeRefresh, refreshedPlan)) {
            await useNotificationStore.getState().refreshSchedules(dog, refreshedPlan).catch(() => {});
          }
        })
        .catch((updateError) => {
          console.warn('[progressStore] learning state update error:', updateError);
        });
    }

    await updateWalkStreak(userId, dogId);

    // Refresh walk quality chart data
    const { data: walkLogs } = await supabase
      .from('walk_logs')
      .select('logged_at, quality')
      .eq('dog_id', dogId)
      .gte(
        'logged_at',
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('logged_at', { ascending: true });

    const walkByDate: Record<string, 1 | 2 | 3> = {};
    for (const row of walkLogs ?? []) {
      const date = new Date(row.logged_at).toISOString().split('T')[0];
      walkByDate[date] = row.quality as 1 | 2 | 3;
    }
    const walkQualityByWeek: WeeklyWalkData[] = getLast14Days().map((date) => ({
      date,
      quality: walkByDate[date] ?? null,
    }));

    const { data: walkStreakData } = await supabase
      .from('walk_streaks')
      .select('current_streak')
      .eq('dog_id', dogId)
      .eq('user_id', userId)
      .single();

    set({
      walkLoggedToday: true,
      walkQualityByWeek,
      walkStreak: walkStreakData?.current_streak ?? 0,
    });

    return get().checkAndCreateMilestones(dogId, userId);
  },

  fetchMilestones: async (dogId: string, userId: string) => {
    const { data } = await supabase
      .from('milestones')
      .select('*')
      .eq('dog_id', dogId)
      .eq('user_id', userId)
      .order('achieved_at', { ascending: true });

    if (!data) return;

    const milestones: Milestone[] = data.map(
      (row: {
        id: string;
        user_id: string;
        dog_id: string;
        milestone_id: string;
        title: string;
        description: string;
        emoji: string;
        achieved_at: string;
      }) => ({
        id: row.id,
        userId: row.user_id,
        dogId: row.dog_id,
        milestoneId: row.milestone_id,
        title: row.title,
        description: row.description,
        emoji: row.emoji,
        achievedAt: row.achieved_at,
      })
    );

    set({ milestones });
  },

  checkAndCreateMilestones: async (dogId: string, userId: string) => {
    const newMilestone = await checkMilestones(dogId, userId);
    if (newMilestone) {
      await supabase.from('milestones').upsert(
        {
          user_id: userId,
          dog_id: dogId,
          milestone_id: newMilestone.milestoneId,
          title: newMilestone.title,
          description: newMilestone.description,
          emoji: newMilestone.emoji,
          achieved_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,dog_id,milestone_id' }
      );
      await get().fetchMilestones(dogId, userId);
    }
    return newMilestone;
  },
}));
