import { supabase } from '../supabase';
import { mapPlanRowToPlan, normalizePostSessionReflection } from '../modelMappers';
import { fetchDogLearningState, upsertDogLearningState } from './repositories';
import {
  aggregateRecentSignals,
  type SessionLogInput,
  type WalkLogInput,
} from './learningSignals';
import type { DogLearningState, Plan } from '../../types';
import {
  createDefaultLearningState,
  computeUpdatedLearningState,
  recomputeLearningStateFromHistory as recomputeLearningStateFromHistoryInternal,
} from './learningStateScoring';

export async function getOrCreateLearningState(dogId: string): Promise<DogLearningState> {
  const existing = await fetchDogLearningState(dogId);
  if (existing) return existing;
  return persistLearningState(dogId, createDefaultLearningState());
}

export async function persistLearningState(
  dogId: string,
  nextState: Omit<DogLearningState, 'id' | 'dogId' | 'createdAt' | 'updatedAt'>,
): Promise<DogLearningState> {
  return upsertDogLearningState(dogId, {
    motivationScore: nextState.motivationScore,
    distractionSensitivity: nextState.distractionSensitivity,
    confidenceScore: nextState.confidenceScore,
    impulseControlScore: nextState.impulseControlScore,
    handlerConsistencyScore: nextState.handlerConsistencyScore,
    fatigueRiskScore: nextState.fatigueRiskScore,
    recoverySpeedScore: nextState.recoverySpeedScore,
    environmentConfidence: nextState.environmentConfidence,
    behaviorSignals: nextState.behaviorSignals,
    recentTrends: nextState.recentTrends,
    currentHypotheses: nextState.currentHypotheses,
    lastEvaluatedAt: nextState.lastEvaluatedAt,
    version: nextState.version,
  });
}

async function fetchPlanContext(planId: string | null | undefined, dogId: string) {
  if (planId) {
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle();
    if (data) return mapPlanRowToPlan(data);
  }

  const { data } = await supabase
    .from('plans')
    .select('*')
    .eq('dog_id', dogId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapPlanRowToPlan(data) : null;
}

async function fetchSourceLogs(dogId: string) {
  const [sessionsResult, walksResult] = await Promise.all([
    supabase
      .from('session_logs')
      .select('*')
      .eq('dog_id', dogId)
      .order('completed_at', { ascending: true }),
    supabase
      .from('walk_logs')
      .select('*')
      .eq('dog_id', dogId)
      .order('logged_at', { ascending: true }),
  ]);

  if (sessionsResult.error) throw sessionsResult.error;
  if (walksResult.error) throw walksResult.error;

  // Normalize post_session_reflection on each row so the learning signals
  // engine always receives a validated PostSessionReflection | null rather
  // than a raw DB object that may contain unknown enum values or bad shapes.
  const sessions: SessionLogInput[] = (sessionsResult.data ?? []).map((row) => ({
    ...(row as SessionLogInput),
    post_session_reflection: normalizePostSessionReflection(
      (row as Record<string, unknown>).post_session_reflection,
    ),
  }));

  return {
    sessions,
    walks: (walksResult.data ?? []) as WalkLogInput[],
  };
}

export async function updateLearningStateFromSessionLog(sessionLogId: string): Promise<DogLearningState | null> {
  const { data: sessionLog, error } = await supabase
    .from('session_logs')
    .select('*')
    .eq('id', sessionLogId)
    .maybeSingle();

  if (error) throw error;
  if (!sessionLog?.dog_id) return null;

  const [previousState, sourceLogs, plan] = await Promise.all([
    getOrCreateLearningState(sessionLog.dog_id),
    fetchSourceLogs(sessionLog.dog_id),
    fetchPlanContext(sessionLog.plan_id, sessionLog.dog_id),
  ]);

  const recentSignals = aggregateRecentSignals({
    sessions: sourceLogs.sessions,
    walks: sourceLogs.walks,
    plan,
  });
  const nextState = computeUpdatedLearningState(previousState, recentSignals);
  return persistLearningState(sessionLog.dog_id, nextState);
}

export async function updateLearningStateFromWalkLog(walkLogId: string): Promise<DogLearningState | null> {
  const { data: walkLog, error } = await supabase
    .from('walk_logs')
    .select('*')
    .eq('id', walkLogId)
    .maybeSingle();

  if (error) throw error;
  if (!walkLog?.dog_id) return null;

  const [previousState, sourceLogs, plan] = await Promise.all([
    getOrCreateLearningState(walkLog.dog_id),
    fetchSourceLogs(walkLog.dog_id),
    fetchPlanContext(null, walkLog.dog_id),
  ]);

  const recentSignals = aggregateRecentSignals({
    sessions: sourceLogs.sessions,
    walks: sourceLogs.walks,
    plan,
  });
  const nextState = computeUpdatedLearningState(previousState, recentSignals);
  return persistLearningState(walkLog.dog_id, nextState);
}

export async function rebuildLearningStateForDog(dogId: string): Promise<DogLearningState> {
  const [sourceLogs, plan] = await Promise.all([
    fetchSourceLogs(dogId),
    fetchPlanContext(null, dogId),
  ]);

  let previous = await getOrCreateLearningState(dogId);
  previous = {
    ...previous,
    ...createDefaultLearningState(),
  };

  previous = recomputeLearningStateFromHistory(previous, sourceLogs.sessions, sourceLogs.walks, plan);

  const nextState: Omit<DogLearningState, 'id' | 'dogId' | 'createdAt' | 'updatedAt'> = {
    motivationScore: previous.motivationScore,
    distractionSensitivity: previous.distractionSensitivity,
    confidenceScore: previous.confidenceScore,
    impulseControlScore: previous.impulseControlScore,
    handlerConsistencyScore: previous.handlerConsistencyScore,
    fatigueRiskScore: previous.fatigueRiskScore,
    recoverySpeedScore: previous.recoverySpeedScore,
    environmentConfidence: previous.environmentConfidence,
    behaviorSignals: previous.behaviorSignals,
    recentTrends: previous.recentTrends,
    currentHypotheses: previous.currentHypotheses,
    lastEvaluatedAt: previous.lastEvaluatedAt,
    version: previous.version,
  };

  return persistLearningState(dogId, nextState);
}

export function recomputeLearningStateFromHistory(
  initialState: DogLearningState,
  sessions: SessionLogInput[],
  walks: WalkLogInput[],
  plan: Plan | null,
): DogLearningState {
  return recomputeLearningStateFromHistoryInternal(initialState, sessions, walks, plan);
}
