import { supabase } from '@/lib/supabase';
import { updateLearningStateFromSessionLog } from '@/lib/adaptivePlanning/learningStateEngine';
import type { AdaptationApiResult, PlanEnvironment, PlanSession } from '@/types';
import type { StepResult } from '@/stores/sessionStore';

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
}

export interface CompletedSession {
  sessionId: string;
  dogId: string;
  planId: string;
}

export interface SaveSessionResult {
  sessionLogId: string | null;
  adaptation: AdaptationApiResult | null;
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
    })
    .select('id')
    .single();

  if (error) {
    console.warn('[sessionManager] saveSession error:', error.message);
    return { sessionLogId: null, adaptation: null };
  }

  let adaptation: AdaptationApiResult | null = null;
  if (data?.id) {
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
  }

  return { sessionLogId: data?.id ?? null, adaptation };
}

// ─────────────────────────────────────────────────────────────────────────────
// updateStreak
// ─────────────────────────────────────────────────────────────────────────────

export async function updateStreak(userId: string, dogId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('dog_id', dogId)
    .single();

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

  const lastDate = existing.last_session_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;
  if (lastDate === today) {
    // Already trained today — no change
    return;
  } else if (lastDate === yesterdayStr) {
    // Consecutive day
    newStreak = existing.current_streak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, existing.longest_streak ?? 0),
      last_session_date: today,
    })
    .eq('id', existing.id);
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
  const { count } = await supabase
    .from('session_logs')
    .select('id', { count: 'exact', head: true })
    .eq('dog_id', dogId);

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
    .single();

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
