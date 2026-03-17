import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';
import { buildLearningStateCoachSummary } from '../../../lib/adaptivePlanning/learningStateSummary.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RequestBody {
  message: string;
  conversationId: string;
  dogId: string;
}

interface DogRow {
  id: string;
  name: string;
  breed: string | null;
  breed_group: string | null;
  age_months: number | null;
  sex: string | null;
  neutered: boolean | null;
  environment_type: string | null;
  behavior_goals: string[];
  training_experience: string | null;
  equipment: string[];
  lifecycle_stage: string | null;
  has_kids: boolean | null;
  has_other_pets: boolean | null;
}

interface PlanRow {
  goal: string;
  current_stage: string;
  current_week: number;
  duration_weeks: number;
}

interface SessionLogRow {
  exercise_id: string;
  protocol_id: string;
  difficulty: string;
  completed_at: string;
}

interface WalkLogRow {
  quality: number | null;
  goal_achieved: boolean | null;
  logged_at: string;
  duration_minutes: number | null;
}

interface LearningHypothesisRow {
  summary?: string;
}

interface LearningStateRow {
  motivation_score: number;
  distraction_sensitivity: number;
  confidence_score: number;
  impulse_control_score: number;
  handler_consistency_score: number;
  fatigue_risk_score: number;
  recovery_speed_score: number;
  environment_confidence: Record<string, number> | null;
  behavior_signals: Record<string, unknown> | null;
  recent_trends: Record<string, unknown> | null;
  current_hypotheses: LearningHypothesisRow[] | null;
  last_evaluated_at: string | null;
}

interface MessageRow {
  role: string;
  content: string;
}

interface AdaptationRow {
  adaptation_type: string;
  reason_summary: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORS headers
// ─────────────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// System prompt builder
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(
  dog: DogRow,
  plan: PlanRow | null,
  sessions: SessionLogRow[],
  walks: WalkLogRow[],
  learningState: LearningStateRow | null,
  adaptations: AdaptationRow[],
): string {
  // Lifecycle label
  const ageMonths = dog.age_months ?? 0;
  let lifecycleStage = 'adult';
  if (ageMonths < 6) lifecycleStage = 'young puppy';
  else if (ageMonths < 12) lifecycleStage = 'puppy';
  else if (ageMonths < 18) lifecycleStage = 'adolescent';
  else if (ageMonths >= 84) lifecycleStage = 'senior';

  const neuteredStatus = dog.neutered === true
    ? 'neutered/spayed'
    : dog.neutered === false
    ? 'intact'
    : 'unknown neuter status';

  const householdDesc = dog.has_kids ? 'has kids' : 'no kids';
  const otherPetsDesc = dog.has_other_pets ? 'has other pets' : 'no other pets';
  const equipmentList = dog.equipment?.length ? dog.equipment.join(', ') : 'standard leash and collar';

  // Session stats
  const completedSessions = sessions.length;
  const avgScore = sessions.length
    ? null // session_logs doesn't store success_score; skip avg for now
    : null;
  const lastSession = sessions[0];
  const lastSessionSummary = lastSession
    ? `${lastSession.exercise_id} (${lastSession.difficulty}) on ${new Date(lastSession.completed_at).toLocaleDateString()}`
    : 'none yet';

  // Walk trend
  const walkQualityAvg = walks.length
    ? (walks.reduce((sum, w) => sum + (w.quality ?? 2), 0) / walks.length).toFixed(1)
    : null;
  const walkTrend = walkQualityAvg
    ? `average quality ${walkQualityAvg}/3 over last ${walks.length} walks`
    : 'no recent walk data';

  const planSection = plan
    ? `## Current Training Focus
Goal: ${plan.goal}
Current stage: ${plan.current_stage}
Week ${plan.current_week} of ${plan.duration_weeks}`
    : `## Current Training Focus
No active training plan. Encourage user to complete onboarding and start a plan.`;

  const learningStateSummary = buildLearningStateCoachSummary(dog.name, learningState
    ? {
        id: 'edge',
        dogId: dog.id,
        createdAt: learningState.last_evaluated_at ?? new Date().toISOString(),
        updatedAt: learningState.last_evaluated_at ?? new Date().toISOString(),
        motivationScore: learningState.motivation_score,
        distractionSensitivity: learningState.distraction_sensitivity,
        confidenceScore: learningState.confidence_score,
        impulseControlScore: learningState.impulse_control_score,
        handlerConsistencyScore: learningState.handler_consistency_score,
        fatigueRiskScore: learningState.fatigue_risk_score,
        recoverySpeedScore: learningState.recovery_speed_score,
        environmentConfidence: learningState.environment_confidence ?? {},
        behaviorSignals: learningState.behavior_signals ?? {},
        recentTrends: learningState.recent_trends ?? {},
        currentHypotheses: (learningState.current_hypotheses ?? []).map((item, index) => ({
          code: `edge_${index}`,
          summary: item.summary ?? '',
          evidence: [],
          confidence: 'medium' as const,
        })),
        lastEvaluatedAt: learningState.last_evaluated_at,
        version: 1,
      }
    : null);

  const adaptationSummary = adaptations.length
    ? adaptations
        .map((item) =>
          `${item.adaptation_type} on ${new Date(item.created_at).toLocaleDateString()}: ${item.reason_summary}`,
        )
        .join(' | ')
    : 'No recent plan adaptations.';

  return `You are Pawly's AI training coach. You are warm, direct, knowledgeable, and always specific to this dog and owner.

## Dog Profile
Name: ${dog.name}
Breed: ${dog.breed ?? 'Unknown'} (${dog.breed_group ?? 'unknown'} group)
Age: ${ageMonths} months (${lifecycleStage})
Sex: ${dog.sex ?? 'unknown'}, ${neuteredStatus}
Environment: ${dog.environment_type ?? 'unknown'}
Household: ${householdDesc}
Other pets: ${otherPetsDesc}
Equipment available: ${equipmentList}
Training experience: ${dog.training_experience ?? 'unknown'}
Behavior goals: ${dog.behavior_goals?.join(', ') || 'not specified'}

${planSection}

## Recent Activity (Last 7 Sessions)
Sessions completed: ${completedSessions}
${avgScore !== null ? `Average success score: ${avgScore}/5` : ''}
Walk quality trend: ${walkTrend}
Last session: ${lastSessionSummary}

## Learning Patterns
${learningStateSummary.summary}
${learningStateSummary.topHypotheses.length ? `Top 3 hypotheses: ${learningStateSummary.topHypotheses.join(' | ')}` : 'Top 3 hypotheses: none yet'}
${learningStateSummary.environmentDeltas.length ? `Environment deltas: ${learningStateSummary.environmentDeltas.join(' | ')}` : 'Environment deltas: none yet'}
${learningStateSummary.warnings.length ? `Warnings: ${learningStateSummary.warnings.join(' | ')}` : 'Warnings: none'}

## Recent Plan Adjustments
${adaptationSummary}

## Your Guidelines
- Always address ${dog.name} by name
- Ground all advice in the current training stage and plan
- Treat learning-state signals as training patterns, not facts or diagnoses
- You may say things like "seems to do better indoors" or "recent sessions suggest shorter reps may help"
- Never diagnose medical conditions — refer to vet when behavior changes suggest health issues
- Never recommend aversive, punishment-based, or dominance methods
- For severe aggression, bite history, or extreme fear — strongly recommend in-person behaviorist
- Keep responses concise and actionable — owners want to know what to do, not read essays
- Use rich formatting to improve readability:
    - Use **bold headers** for key sections (on their own lines)
    - Use bulleted or numbered lists for steps and instructions
    - Use bold inline for key labels or emphasis
    - Use emoji callouts at the start of a line for important tips or warnings:
        - 💡 for helpful tips
        - ⚠️ for warnings or common mistakes
        - ✅ for "do" items or confirmations
        - 🐶 for dog-specific insights
    - Use double line breaks between sections to ensure clear spacing
- If uncertain, say so and offer the safest conservative approach
- Always end advice with a clear section: **Try This Today** followed by one specific next action`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Validate JWT ────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

  // Admin client (bypasses RLS for writes, also used to verify JWT)
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // ── 2. Parse request body ──────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { message, conversationId, dogId } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return jsonResponse({ error: 'message is required' }, 400);
  }
  if (message.length > 1000) {
    return jsonResponse({ error: 'message too long (max 1000 chars)' }, 400);
  }
  if (!conversationId || !dogId) {
    return jsonResponse({ error: 'conversationId and dogId are required' }, 400);
  }

  // ── 3. Rate limit check ────────────────────────────────────────────────────
  // Fetch user's subscription tier
  const { data: userRow } = await adminClient
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const tier = (userRow?.subscription_tier ?? 'free') as 'free' | 'core' | 'premium';

  if (tier === 'free') {
    // Max 5 messages per day
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const { count } = await adminClient
      .from('coach_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', dayStart.toISOString());

    if ((count ?? 0) >= 5) {
      return jsonResponse(
        { error: 'Daily coaching limit reached. Upgrade for unlimited coaching.' },
        429,
      );
    }
  } else {
    // core / premium: max 30 per hour
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { count } = await adminClient
      .from('coach_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', hourAgo.toISOString());

    if ((count ?? 0) >= 30) {
      return jsonResponse(
        { error: 'Hourly coaching limit reached. Please wait a moment.' },
        429,
      );
    }
  }

  // ── 4. Fetch context ───────────────────────────────────────────────────────

  const [dogResult, planResult, sessionsResult, walksResult, learningStateResult, adaptationsResult, historyResult] = await Promise.all([
    // Dog profile
    adminClient
      .from('dogs')
      .select('id, name, breed, breed_group, age_months, sex, neutered, environment_type, behavior_goals, training_experience, equipment, lifecycle_stage, has_kids, has_other_pets')
      .eq('id', dogId)
      .eq('owner_id', user.id)
      .single(),

    // Active plan
    adminClient
      .from('plans')
      .select('goal, current_stage, current_week, duration_weeks')
      .eq('dog_id', dogId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Last 7 completed sessions
    adminClient
      .from('session_logs')
      .select('exercise_id, protocol_id, difficulty, completed_at')
      .eq('dog_id', dogId)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(7),

    // Last 5 walk logs
    adminClient
      .from('walk_logs')
      .select('quality, goal_achieved, logged_at, duration_minutes')
      .eq('dog_id', dogId)
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(5),

    adminClient
      .from('dog_learning_state')
      .select('motivation_score, distraction_sensitivity, confidence_score, impulse_control_score, handler_consistency_score, fatigue_risk_score, recovery_speed_score, environment_confidence, behavior_signals, recent_trends, current_hypotheses, last_evaluated_at')
      .eq('dog_id', dogId)
      .maybeSingle(),

    adminClient
      .from('plan_adaptations')
      .select('adaptation_type, reason_summary, created_at')
      .eq('dog_id', dogId)
      .order('created_at', { ascending: false })
      .limit(3),

    // Last 20 messages in this conversation
    adminClient
      .from('coach_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20),
  ]);

  if (dogResult.error || !dogResult.data) {
    return jsonResponse({ error: 'Dog not found or access denied' }, 404);
  }

  const dog = dogResult.data as DogRow;
  const plan = planResult.data as PlanRow | null;
  const sessions = (sessionsResult.data ?? []) as SessionLogRow[];
  const walks = (walksResult.data ?? []) as WalkLogRow[];
  const learningState = (learningStateResult.data ?? null) as LearningStateRow | null;
  const adaptations = (adaptationsResult.data ?? []) as AdaptationRow[];
  const history = (historyResult.data ?? []) as MessageRow[];

  // ── 5. Assemble system prompt ──────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(dog, plan, sessions, walks, learningState, adaptations);

  // ── 6. Call OpenAI API ────────────────────────────────────────────────────
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const apiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message.trim() },
  ];

  let assistantContent: string;
  let tokensUsed: number;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 600,
      messages: apiMessages,
    });

    assistantContent = response.choices[0]?.message?.content ?? '';
    tokensUsed = response.usage?.completion_tokens ?? 0;
  } catch (err) {
    console.error('OpenAI API error:', err);
    return jsonResponse({ error: 'AI service temporarily unavailable. Please try again.' }, 503);
  }

  // ── 7. Store message pair ──────────────────────────────────────────────────
  await adminClient.from('coach_messages').insert([
    {
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: message.trim(),
    },
    {
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content: assistantContent,
      tokens_used: tokensUsed,
      model_version: 'gpt-4o',
    },
  ]);

  // Update conversation updated_at
  await adminClient
    .from('coach_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  // ── 8. Return response ─────────────────────────────────────────────────────
  return jsonResponse({ content: assistantContent, conversationId });
});
