import { supabase } from '@/lib/supabase';
import { updateLearningStateFromSessionLog } from '@/lib/adaptivePlanning/learningStateEngine';
import type { AdaptationApiResult, PlanEnvironment, PlanSession, PostSessionReflection } from '@/types';
import type { StepResult } from '@/stores/sessionStore';
import type { LiveAiTrainerSummary } from './liveCoach/liveAiTrainerTypes';
import type { RecentSessionSummary } from './adaptivePlanning/reflectionQuestionTypes';
import { computeStreakUpdate, localDateKey } from './sessionScoring';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SaveSessionParams {
  userId: string;
  dogId: string;
  planId: string;
  sessionId: string;
  exerciseId: string;
  protocolId: string;
  durationSeconds: number;
  difficulty: 'easy' | 'okay' | 'hard';
  notes: string;
  completedAt: string;
  successScore?: number;
  stepResults?: StepResult[];
  sessionStatus?: 'completed' | 'abandoned';
  skillId?: string | null;
  sessionKind?: PlanSession['sessionKind'] | null;
  environmentTag?: PlanEnvironment | null;
  // Live AI Trainer fields
  /** Set to true only when the Live AI Trainer flow was used. */
  liveCoachingUsed?: boolean;
  /** Summary of the Live AI Trainer interaction. */
  liveAiTrainerSummary?: LiveAiTrainerSummary;
  // PR17: post-session reflection (optional — null when handler skips the flow)
  /** Structured handler reflection captured after the session review step. */
  postSessionReflection?: PostSessionReflection | null;
}

export interface CompletedSession {
  sessionId: string;
  dogId: string;
  planId: string;
}

export interface SaveSessionResult {
  sessionLogId: string | null;
  adaptation: AdaptationApiResult | null;
  /** Set when the log row could not be written. Callers must surface this. */
  error: string | null;
}

export interface Milestone {
  type: 'first_session' | 'streak_7' | 'streak_14' | 'streak_30' | 'sessions_10' | 'sessions_25';
  label: string;
  emoji: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// saveSession
// ─────────────────────────────────────────────────────────────────────────────

async function invokeAdaptPlan(body: {
  dogId: string;
  planId: string;
  triggeredBySessionLogId?: string | null;
  triggeredByWalkLogId?: string | null;
}): Promise<AdaptationApiResult | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase.functions.invoke('adapt-plan', {
    body,
    headers: session?.access_token
      ? {
          Authorization: `Bearer ${session.access_token}`,
        }
      : undefined,
  });
  if (error) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      context: 'context' in error ? (error as { context?: unknown }).context : undefined,
    };
    console.warn('[sessionManager] adapt-plan invoke error:', errorDetails);
    return null;
  }

  console.log('[sessionManager] adapt-plan response:', data);
  return (data ?? null) as AdaptationApiResult | null;
}

export async function triggerPlanAdaptation(params: {
  dogId: string;
  planId: string;
  triggeredBySessionLogId?: string | null;
  triggeredByWalkLogId?: string | null;
}): Promise<AdaptationApiResult | null> {
  return invokeAdaptPlan(params);
}

export async function saveSession(params: SaveSessionParams): Promise<SaveSessionResult> {
  const { data, error } = await supabase
    .from('session_logs')
    .insert({
      user_id: params.userId,
      dog_id: params.dogId,
      plan_id: params.planId,
      session_id: params.sessionId,
      exercise_id: params.exerciseId,
      protocol_id: params.protocolId,
      duration_seconds: params.durationSeconds,
      difficulty: params.difficulty,
      notes: params.notes || null,
      completed_at: params.completedAt,
      success_score: params.successScore ?? null,
      step_results: params.stepResults ?? [],
      session_status: params.sessionStatus ?? 'completed',
      skill_id: params.skillId ?? null,
      session_kind: params.sessionKind ?? null,
      environment_tag: params.environmentTag ?? null,
      live_coaching_used: params.liveCoachingUsed ?? false,
      live_ai_trainer_summary: params.liveAiTrainerSummary ?? null,
      post_session_reflection: params.postSessionReflection ?? null,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    const message = error?.message ?? 'Session log insert returned no id';
    console.warn('[sessionManager] saveSession error:', message);
    return { sessionLogId: null, adaptation: null, error: message };
  }

  // The log is the source of truth. Learning-state and adaptation updates are
  // best-effort: a failure there must never make the session look unsaved.
  let adaptation: AdaptationApiResult | null = null;
  try {
    await updateLearningStateFromSessionLog(data.id);
    if ((params.sessionStatus ?? 'completed') === 'completed') {
      adaptation = await invokeAdaptPlan({
        dogId: params.dogId,
        planId: params.planId,
        triggeredBySessionLogId: data.id,
      });
    }
  } catch (updateError) {
    console.warn('[sessionManager] learning state update error:', updateError);
  }

  return { sessionLogId: data.id, adaptation, error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchRecentSessionSummaries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compact history used by the post-session reflection question engine so it
 * can ask about repeated failures on a skill instead of guessing blind.
 */
export async function fetchRecentSessionSummaries(
  dogId: string,
  limit = 5,
): Promise<RecentSessionSummary[]> {
  const { data, error } = await supabase
    .from('session_logs')
    .select('session_status, difficulty, success_score, environment_tag, session_kind, skill_id, exercise_id')
    .eq('dog_id', dogId)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    status: row.session_status === 'abandoned' ? 'abandoned' : 'completed',
    difficulty: row.difficulty === 'easy' || row.difficulty === 'hard' ? row.difficulty : 'okay',
    successScore: typeof row.success_score === 'number' ? row.success_score : 3,
    environmentTag: row.environment_tag ?? null,
    sessionKind: row.session_kind ?? null,
    skillId: row.skill_id ?? row.exercise_id ?? null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// updateStreak
// ─────────────────────────────────────────────────────────────────────────────

export async function updateStreak(userId: string, dogId: string): Promise<void> {
  const now = new Date();
  const today = localDateKey(now);

  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('dog_id', dogId)
    .maybeSingle();

  if (!existing) {
    await supabase.from('streaks').insert({
      user_id: userId,
      dog_id: dogId,
      current_streak: 1,
      longest_streak: 1,
      last_session_date: today,
    });
    return;
  }

  const update = computeStreakUpdate(
    {
      current_streak: existing.current_streak ?? 0,
      longest_streak: existing.longest_streak ?? 0,
      last_session_date: existing.last_session_date ?? null,
    },
    now,
  );
  if (!update) return; // already trained today

  await supabase.from('streaks').update(update).eq('id', existing.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// checkMilestones
// ─────────────────────────────────────────────────────────────────────────────

export async function checkMilestones(
  userId: string,
  dogId: string,
  sessionData: CompletedSession
): Promise<Milestone | null> {
  // Count total completed sessions for this dog
  // Abandoned logs are attempts, not sessions — they must not consume the
  // "first session" milestone or pad the counts.
  const { count } = await supabase
    .from('session_logs')
    .select('id', { count: 'exact', head: true })
    .eq('dog_id', dogId)
    .eq('session_status', 'completed');

  const total = count ?? 0;

  if (total === 1) {
    return { type: 'first_session', label: 'First session complete!', emoji: 'ribbon' };
  }
  if (total === 10) {
    return { type: 'sessions_10', label: '10 sessions done!', emoji: 'star' };
  }
  if (total === 25) {
    return { type: 'sessions_25', label: '25 sessions — incredible!', emoji: 'trophy' };
  }

  // Check streak milestones
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .eq('dog_id', dogId)
    .maybeSingle();

  const currentStreak = streak?.current_streak ?? 0;
  if (currentStreak === 7) {
    return { type: 'streak_7', label: '7-day streak!', emoji: 'flame' };
  }
  if (currentStreak === 14) {
    return { type: 'streak_14', label: '2-week streak!', emoji: 'flame' };
  }
  if (currentStreak === 30) {
    return { type: 'streak_30', label: '30-day streak!', emoji: 'ribbon' };
  }

  return null;
}
