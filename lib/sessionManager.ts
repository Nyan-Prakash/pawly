import { supabase } from '@/lib/supabase';

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
}

export interface CompletedSession {
  sessionId: string;
  dogId: string;
  planId: string;
}

export interface Milestone {
  type: 'first_session' | 'streak_7' | 'streak_14' | 'streak_30' | 'sessions_10' | 'sessions_25';
  label: string;
  emoji: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// saveSession
// ─────────────────────────────────────────────────────────────────────────────

export async function saveSession(params: SaveSessionParams): Promise<void> {
  const { error } = await supabase.from('session_logs').insert({
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
  });

  if (error) {
    console.warn('[sessionManager] saveSession error:', error.message);
    // Non-fatal — local state is already updated
  }
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
