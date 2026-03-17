import type {
  AdaptivePlanResult,
  AIPlannerOutput,
  Dog,
  Plan,
} from '../../types';
import { generatePlan } from '../planGenerator';
import { buildSkillGraph, getNodesForBehavior, type SkillGraph } from './skillGraph';
import { buildPlannerSystemPrompt } from './plannerPrompt';
import { validatePlannerOutput, parsePlannerJSON } from './planValidation';
import { compilePlan } from './planCompiler';
import { isAdaptivePlanningEnabled } from './featureFlags';
import { fetchSkillNodes, fetchSkillEdges } from './repositories';
import { supabase } from '../supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const ADAPTIVE_PLANNER_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/generate-adaptive-plan`
  : null;

type AdaptivePlannerHttpBody = Partial<AdaptivePlanResult> & {
  plan?: Plan;
  plannerMode?: AdaptivePlanResult['plannerMode'];
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
  'Barking': 'barking',
  "Won't Come": 'recall',
  'Potty Training': 'potty_training',
  'Crate Anxiety': 'crate_anxiety',
  'Puppy Biting': 'puppy_biting',
  'Settling': 'settling',
};

/**
 * Generate a plan using the adaptive AI planner if enabled,
 * falling back to the rules-based planner on any failure.
 */
export async function generateAdaptivePlan(dog: Dog): Promise<AdaptivePlanResult> {
  return generateAdaptivePlanWithOptions(dog);
}

export async function generateAdaptivePlanWithOptions(
  dog: Dog,
  options?: { accessToken?: string | null },
): Promise<AdaptivePlanResult> {
  if (!isAdaptivePlanningEnabled()) {
    return {
      plan: generatePlan(dog),
      plannerMode: 'rules_fallback',
      fallbackReason: 'Feature flag disabled',
    };
  }

  try {
    return await callAdaptivePlanner(dog, options);
  } catch (err) {
    console.warn('[adaptive-planner] Falling back to rules-based planner:', err);
    return {
      plan: generatePlan(dog),
      plannerMode: 'rules_fallback',
      fallbackReason: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function callAdaptivePlanner(
  dog: Dog,
  options?: { accessToken?: string | null },
): Promise<AdaptivePlanResult> {
  const goalKey = GOAL_MAP[dog.behaviorGoals[0]] ?? 'leash_pulling';

  // Fetch skill graph for the behavior
  const [nodes, edges] = await Promise.all([
    fetchSkillNodes(goalKey),
    fetchSkillEdges(),
  ]);

  const graph = buildSkillGraph(nodes, edges);
  const behaviorNodes = getNodesForBehavior(graph, goalKey);

  if (behaviorNodes.length === 0) {
    throw new Error(`No skill nodes found for behavior: ${goalKey}`);
  }

  // Filter to only usable nodes (not recovery/diagnostic, active, with protocols or proofing)
  const usableNodes = behaviorNodes.filter(
    (n) =>
      n.isActive &&
      n.kind !== 'recovery' &&
      n.kind !== 'diagnostic',
  );

  if (usableNodes.length === 0) {
    throw new Error(`No usable skill nodes for behavior: ${goalKey}`);
  }

  let accessToken = options?.accessToken ?? null;
  if (!accessToken) {
    const {
      data: { session: refreshedSession },
      error: refreshError,
    } = await supabase.auth.refreshSession();
    if (refreshError) {
      throw new Error(`Failed to refresh session: ${refreshError.message}`);
    }

    const session = refreshedSession ?? (await supabase.auth.getSession()).data.session;
    accessToken = session?.access_token ?? null;
  }

  if (!accessToken) throw new Error('No active session');

  const invokePlanner = async () => {
    if (!ADAPTIVE_PLANNER_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase function configuration');
    }

    const response = await fetch(ADAPTIVE_PLANNER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ dogId: dog.id }),
    });

    const rawBody = await response.text();
    const parsedBody = rawBody ? safeParseJSON(rawBody) : null;

    return {
      ok: response.ok,
      status: response.status,
      body: parsedBody ?? rawBody,
    };
  };

  let result = await invokePlanner();

  if (result.status === 401) {
    const retryRefresh = await supabase.auth.refreshSession();
    if (retryRefresh.data.session?.access_token) {
      accessToken = retryRefresh.data.session.access_token;
      result = await invokePlanner();
    }
  }

  if (!result.ok) {
    const body =
      typeof result.body === 'string'
        ? result.body
        : JSON.stringify(result.body ?? { error: 'Unknown error' });
    throw new Error(
      result.status ? `Edge Function returned ${result.status}: ${body}` : `Edge Function error: ${body}`
    );
  }

  const responseBody = asAdaptivePlannerBody(result.body);
  if (!responseBody?.plan || !responseBody.plannerMode) {
    throw new Error(`Edge Function returned invalid payload: ${JSON.stringify(result.body)}`);
  }

  return {
    plan: responseBody.plan,
    plannerMode: responseBody.plannerMode,
    planningSummary: responseBody.planningSummary,
    fallbackReason: responseBody.fallbackReason,
  };
}

function safeParseJSON(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asAdaptivePlannerBody(value: unknown): AdaptivePlannerHttpBody | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as AdaptivePlannerHttpBody;
}

/**
 * Server-side: generate plan from AI output. Used by the Edge Function.
 * This is the shared deterministic pipeline: validate → compile.
 */
export function compileAdaptivePlanFromAIOutput(
  rawOutput: string,
  dog: Dog,
  graph: SkillGraph,
  expectedSessionsPerWeek: number,
): { plan: Plan; warnings: string[] } | { error: string } {
  const { parsed, error: parseError } = parsePlannerJSON(rawOutput);
  if (!parsed || parseError) {
    return { error: `Failed to parse AI output: ${parseError}` };
  }

  const validationErrors = validatePlannerOutput(parsed, graph, expectedSessionsPerWeek, 4);
  if (validationErrors.length > 0) {
    return {
      error: `Validation failed: ${validationErrors.map((e) => `${e.field}: ${e.message}`).join('; ')}`,
    };
  }

  const warnings: string[] = [];
  const plan = compilePlan(parsed, dog, graph, 'adaptive_ai', warnings);

  return { plan, warnings };
}
