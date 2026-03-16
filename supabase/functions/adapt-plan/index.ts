import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildAdaptationAuditRecord, toAdaptationApiResult } from '../../../lib/adaptivePlanning/adaptationAudit.ts';
import { runAdaptationEngine } from '../../../lib/adaptivePlanning/adaptationEngine.ts';
import { aggregateRecentSignals, extractSessionSignals, extractWalkSignals } from '../../../lib/adaptivePlanning/learningSignals.ts';
import { mapDogLearningStateRowToModel, mapPlanAdaptationRowToModel, mapPlanRowToPlan, mapSkillEdgeRowToModel, mapSkillNodeRowToModel } from '../../../lib/modelMappers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GOAL_MAP: Record<string, string> = {
  leash_pulling: 'leash_pulling',
  jumping_up: 'jumping_up',
  barking: 'barking',
  recall: 'recall',
  potty_training: 'potty_training',
  crate_anxiety: 'crate_anxiety',
  puppy_biting: 'puppy_biting',
  settling: 'settling',
  'Leash Pulling': 'leash_pulling',
  'Jumping Up': 'jumping_up',
  Barking: 'barking',
  "Won't Come": 'recall',
  'Potty Training': 'potty_training',
  'Crate Anxiety': 'crate_anxiety',
  'Puppy Biting': 'puppy_biting',
  Settling: 'settling',
};

interface AdaptPlanRequest {
  dogId: string;
  planId?: string | null;
  triggeredBySessionLogId?: string | null;
  triggeredByWalkLogId?: string | null;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  let body: AdaptPlanRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!body?.dogId) {
    return jsonResponse({ error: 'dogId is required' }, 400);
  }

  const authHeader = req.headers.get('Authorization');
  let authenticatedUserId: string | null = null;

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    authenticatedUserId = user.id;
  }

  const startedAt = Date.now();
  const now = new Date().toISOString();

  let dogQuery = adminClient
    .from('dogs')
    .select('id, owner_id, name')
    .eq('id', body.dogId);

  if (authenticatedUserId) {
    dogQuery = dogQuery.eq('owner_id', authenticatedUserId);
  }

  const dogResult = await dogQuery.maybeSingle();

  if (dogResult.error || !dogResult.data) {
    return jsonResponse({ error: 'Dog not found or access denied' }, 404);
  }

  let planQuery = adminClient
    .from('plans')
    .select('*')
    .eq('dog_id', body.dogId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  if (body.planId) {
    planQuery = adminClient.from('plans').select('*').eq('id', body.planId).eq('dog_id', body.dogId).limit(1);
  }

  const [
    planResult,
    sessionLogsResult,
    walkLogsResult,
    learningStateResult,
    adaptationsResult,
  ] = await Promise.all([
    planQuery.maybeSingle(),
    adminClient
      .from('session_logs')
      .select('*')
      .eq('dog_id', body.dogId)
      .order('completed_at', { ascending: false })
      .limit(8),
    adminClient
      .from('walk_logs')
      .select('*')
      .eq('dog_id', body.dogId)
      .order('logged_at', { ascending: false })
      .limit(6),
    adminClient
      .from('dog_learning_state')
      .select('*')
      .eq('dog_id', body.dogId)
      .maybeSingle(),
    adminClient
      .from('plan_adaptations')
      .select('*')
      .eq('dog_id', body.dogId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (planResult.error || !planResult.data) {
    return jsonResponse({ applied: false, skipped: true, reason: 'No active plan found.' });
  }

  const plan = mapPlanRowToPlan(planResult.data);
  const behavior = GOAL_MAP[plan.goal] ?? plan.goal.toLowerCase().replace(/ /g, '_');

  const [skillNodesResult, skillEdgesResult] = await Promise.all([
    adminClient.from('skill_nodes').select('*').eq('behavior', behavior).eq('is_active', true),
    adminClient.from('skill_edges').select('*'),
  ]);

  if (skillNodesResult.error || skillEdgesResult.error) {
    return jsonResponse({ error: 'Failed to load skill graph context' }, 500);
  }

  const sessionLogs = sessionLogsResult.data ?? [];
  const walkLogs = walkLogsResult.data ?? [];
  const aggregatedSignals = aggregateRecentSignals({
    sessions: sessionLogs,
    walks: walkLogs,
    plan,
  });

  const recentSessions = sessionLogs
    .map((sessionLog) =>
      extractSessionSignals(
        sessionLog,
        null,
        plan.sessions.find((session) => session.id === sessionLog.session_id) ?? null,
      ),
    )
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 5);

  const recentWalks = walkLogs
    .map((walkLog) => extractWalkSignals(walkLog))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 5);

  const engineResult = runAdaptationEngine({
    plan,
    nodes: (skillNodesResult.data ?? []).map(mapSkillNodeRowToModel),
    edges: (skillEdgesResult.data ?? []).map(mapSkillEdgeRowToModel),
    learningState: learningStateResult.data ? mapDogLearningStateRowToModel(learningStateResult.data) : null,
    aggregatedSignals,
    recentSessions,
    recentWalks,
    recentAdaptations: (adaptationsResult.data ?? []).map(mapPlanAdaptationRowToModel),
    now,
  });

  if (!engineResult) {
    return jsonResponse({
      applied: false,
      skipped: true,
      adaptationId: null,
      reasonCode: 'no_rule_match',
      reasonSummary: 'Recent results did not require a plan adjustment.',
      changedSessionIds: [],
      changedFields: [],
    });
  }

  const auditRecord = buildAdaptationAuditRecord({
    dogId: body.dogId,
    plan,
    triggeredBySessionLogId: body.triggeredBySessionLogId ?? null,
    adaptationType: engineResult.adaptationType,
    status: engineResult.applied ? 'applied' : 'skipped',
    reasonCode: engineResult.reasonCode,
    reasonSummary: engineResult.reasonSummary,
    evidence: {
      ...engineResult.evidence,
      triggeredByWalkLogId: body.triggeredByWalkLogId ?? null,
      mutationWindow: 5,
    },
    diff: engineResult.diff,
    latencyMs: Date.now() - startedAt,
  });

  const metadataPatch = engineResult.applied ? (engineResult.nextPlan.metadata ?? {}) : {};
  const rpcResult = await adminClient.rpc('apply_plan_adaptation', {
    p_plan_id: plan.id,
    p_dog_id: body.dogId,
    p_sessions: engineResult.applied ? engineResult.nextPlan.sessions : plan.sessions,
    p_metadata_patch: metadataPatch,
    p_current_stage: engineResult.applied ? engineResult.nextPlan.currentStage : plan.currentStage,
    p_current_week: engineResult.applied ? engineResult.nextPlan.currentWeek : plan.currentWeek,
    p_triggered_by_session_log_id: body.triggeredBySessionLogId ?? null,
    p_adaptation_type: auditRecord.adaptation_type,
    p_status: auditRecord.status,
    p_reason_code: auditRecord.reason_code,
    p_reason_summary: auditRecord.reason_summary,
    p_evidence: auditRecord.evidence,
    p_previous_snapshot: auditRecord.previous_snapshot,
    p_new_snapshot: auditRecord.new_snapshot,
    p_changed_session_ids: auditRecord.changed_session_ids,
    p_changed_fields: auditRecord.changed_fields,
    p_model_name: null,
    p_latency_ms: auditRecord.latency_ms,
    p_was_user_visible: auditRecord.was_user_visible,
  });

  if (rpcResult.error) {
    return jsonResponse({ error: rpcResult.error.message }, 500);
  }

  const adaptationId = (rpcResult.data ?? null) as string | null;

  if (engineResult.applied && adaptationId && dogResult.data.owner_id) {
    const notificationBody =
      auditRecord.reason_summary?.trim().length
        ? auditRecord.reason_summary
        : `${dogResult.data.name}'s plan was adjusted based on recent progress.`;

    const { error: notificationError } = await adminClient
      .from('in_app_notifications')
      .insert({
        user_id: dogResult.data.owner_id,
        dog_id: body.dogId,
        type: 'plan_updated',
        title: 'Training plan updated',
        body: notificationBody,
        metadata: {
          adaptationId,
          planId: plan.id,
          dogId: body.dogId,
          adaptationType: auditRecord.adaptation_type,
          reasonCode: auditRecord.reason_code,
          triggeredBySessionLogId: body.triggeredBySessionLogId ?? null,
          triggeredByWalkLogId: body.triggeredByWalkLogId ?? null,
          changedSessionIds: auditRecord.changed_session_ids,
          deepLink: '/(tabs)/train/plan',
          planUpdatedAt: now,
        },
      });

    if (notificationError && notificationError.code !== '23505') {
      return jsonResponse({ error: notificationError.message }, 500);
    }
  }

  return jsonResponse(toAdaptationApiResult(auditRecord, adaptationId));
});
