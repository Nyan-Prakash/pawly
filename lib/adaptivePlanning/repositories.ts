import { supabase } from '../supabase';
import {
  mapDogLearningStateRowToModel,
  mapPlanAdaptationRowToModel,
  mapSkillNodeRowToModel,
  mapSkillEdgeRowToModel,
} from '../modelMappers';
import { ADAPTIVE_PLANNING_CONFIG } from './config';
import type { DogLearningState, PlanAdaptation, SkillNode, SkillEdge } from '../../types';

// ─── Dog Learning State ──────────────────────────────────────────────────────

export async function fetchDogLearningState(dogId: string): Promise<DogLearningState | null> {
  const { data, error } = await supabase
    .from('dog_learning_state')
    .select('*')
    .eq('dog_id', dogId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDogLearningStateRowToModel(data) : null;
}

export async function upsertDogLearningState(
  dogId: string,
  updates: Partial<Omit<DogLearningState, 'id' | 'dogId' | 'createdAt' | 'updatedAt'>>
): Promise<DogLearningState> {
  const dbUpdates: Record<string, unknown> = { dog_id: dogId };
  if (updates.motivationScore !== undefined) dbUpdates.motivation_score = updates.motivationScore;
  if (updates.distractionSensitivity !== undefined) dbUpdates.distraction_sensitivity = updates.distractionSensitivity;
  if (updates.confidenceScore !== undefined) dbUpdates.confidence_score = updates.confidenceScore;
  if (updates.impulseControlScore !== undefined) dbUpdates.impulse_control_score = updates.impulseControlScore;
  if (updates.handlerConsistencyScore !== undefined) dbUpdates.handler_consistency_score = updates.handlerConsistencyScore;
  if (updates.fatigueRiskScore !== undefined) dbUpdates.fatigue_risk_score = updates.fatigueRiskScore;
  if (updates.recoverySpeedScore !== undefined) dbUpdates.recovery_speed_score = updates.recoverySpeedScore;
  if (updates.environmentConfidence !== undefined) dbUpdates.environment_confidence = updates.environmentConfidence;
  if (updates.behaviorSignals !== undefined) dbUpdates.behavior_signals = updates.behaviorSignals;
  if (updates.recentTrends !== undefined) dbUpdates.recent_trends = updates.recentTrends;
  if (updates.currentHypotheses !== undefined) dbUpdates.current_hypotheses = updates.currentHypotheses;
  if (updates.lastEvaluatedAt !== undefined) dbUpdates.last_evaluated_at = updates.lastEvaluatedAt;
  if (updates.version !== undefined) dbUpdates.version = updates.version;

  const { data, error } = await supabase
    .from('dog_learning_state')
    .upsert(dbUpdates, { onConflict: 'dog_id' })
    .select('*')
    .single();

  if (error) throw error;
  return mapDogLearningStateRowToModel(data);
}

// ─── Plan Adaptations ────────────────────────────────────────────────────────

export async function fetchRecentAdaptations(planId: string): Promise<PlanAdaptation[]> {
  const { data, error } = await supabase
    .from('plan_adaptations')
    .select('*')
    .eq('plan_id', planId)
    .order('created_at', { ascending: false })
    .limit(ADAPTIVE_PLANNING_CONFIG.adaptations.maxRecentToFetch);

  if (error) throw error;
  return (data ?? []).map(mapPlanAdaptationRowToModel);
}

// ─── Skill Graph ─────────────────────────────────────────────────────────────

export async function fetchSkillNodes(behavior?: string): Promise<SkillNode[]> {
  let query = supabase.from('skill_nodes').select('*').eq('is_active', true);
  if (behavior) query = query.eq('behavior', behavior);
  query = query.order('stage', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapSkillNodeRowToModel);
}

export async function fetchSkillEdges(fromSkillId?: string): Promise<SkillEdge[]> {
  let query = supabase.from('skill_edges').select('*');
  if (fromSkillId) query = query.eq('from_skill_id', fromSkillId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapSkillEdgeRowToModel);
}
