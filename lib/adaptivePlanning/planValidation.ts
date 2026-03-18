import type {
  AIPlannerOutput,
  AIWeekStructure,
  AISkillSelection,
  PlannerValidationError,
  PlanEnvironment,
  PlanSessionKind,
  SkillNode,
} from '../../types';
import type { SkillGraph } from './skillGraph';
import { getPrerequisiteSkills } from './graphTraversal.ts';

const VALID_ENVIRONMENTS: PlanEnvironment[] = [
  'indoors_low_distraction',
  'indoors_moderate_distraction',
  'outdoors_low_distraction',
  'outdoors_moderate_distraction',
  'outdoors_high_distraction',
];

const VALID_SESSION_KINDS: PlanSessionKind[] = ['core', 'repeat', 'proofing'];

export function validatePlannerOutput(
  output: unknown,
  graph: SkillGraph,
  expectedSessionsPerWeek: number,
  maxHorizonWeeks: number,
): PlannerValidationError[] {
  const errors: PlannerValidationError[] = [];

  if (!output || typeof output !== 'object') {
    errors.push({ field: 'root', message: 'Output must be a JSON object' });
    return errors;
  }

  const plan = output as Record<string, unknown>;

  // Basic shape validation
  if (typeof plan.primaryGoal !== 'string') {
    errors.push({ field: 'primaryGoal', message: 'primaryGoal must be a string' });
  }
  if (typeof plan.startingSkillId !== 'string') {
    errors.push({ field: 'startingSkillId', message: 'startingSkillId must be a string' });
  }
  if (typeof plan.planHorizonWeeks !== 'number' || plan.planHorizonWeeks < 1 || plan.planHorizonWeeks > maxHorizonWeeks) {
    errors.push({ field: 'planHorizonWeeks', message: `planHorizonWeeks must be 1-${maxHorizonWeeks}` });
  }
  if (typeof plan.sessionsPerWeek !== 'number' || plan.sessionsPerWeek !== expectedSessionsPerWeek) {
    errors.push({ field: 'sessionsPerWeek', message: `sessionsPerWeek must equal ${expectedSessionsPerWeek}` });
  }
  if (!Array.isArray(plan.weeklyStructure)) {
    errors.push({ field: 'weeklyStructure', message: 'weeklyStructure must be an array' });
    return errors;
  }

  // Validate planningSummary
  if (!plan.planningSummary || typeof plan.planningSummary !== 'object') {
    errors.push({ field: 'planningSummary', message: 'planningSummary is required' });
  } else {
    const summary = plan.planningSummary as Record<string, unknown>;
    if (typeof summary.whyThisStart !== 'string') {
      errors.push({ field: 'planningSummary.whyThisStart', message: 'whyThisStart must be a string' });
    }
    if (!Array.isArray(summary.keyAssumptions)) {
      errors.push({ field: 'planningSummary.keyAssumptions', message: 'keyAssumptions must be an array' });
    }
    if (!Array.isArray(summary.risksToWatch)) {
      errors.push({ field: 'planningSummary.risksToWatch', message: 'risksToWatch must be an array' });
    }
  }

  // Validate weekly structure
  const weeks = plan.weeklyStructure as unknown[];
  const scheduledSkillOrder: string[] = [];

  for (let i = 0; i < weeks.length; i++) {
    const week = weeks[i] as Record<string, unknown>;
    if (typeof week.weekNumber !== 'number') {
      errors.push({ field: `weeklyStructure[${i}].weekNumber`, message: 'weekNumber must be a number' });
      continue;
    }
    if (typeof week.focus !== 'string') {
      errors.push({ field: `weeklyStructure[${i}].focus`, message: 'focus must be a string' });
    }
    if (!Array.isArray(week.skillSequence)) {
      errors.push({ field: `weeklyStructure[${i}].skillSequence`, message: 'skillSequence must be an array' });
      continue;
    }

    const weekSessions = (week.skillSequence as AISkillSelection[]).reduce(
      (sum, s) => sum + (s.sessionCount ?? 0),
      0,
    );
    if (weekSessions !== expectedSessionsPerWeek) {
      errors.push({
        field: `weeklyStructure[${i}]`,
        message: `Week ${week.weekNumber} has ${weekSessions} sessions, expected ${expectedSessionsPerWeek}`,
      });
    }

    errors.push(
      ...validateSkillSequence(
        week.skillSequence as AISkillSelection[],
        graph,
        i,
        scheduledSkillOrder,
      ),
    );
  }

  // Validate startingSkillId exists
  if (typeof plan.startingSkillId === 'string' && !graph.nodes.has(plan.startingSkillId)) {
    errors.push({ field: 'startingSkillId', message: `startingSkillId "${plan.startingSkillId}" does not exist in skill graph` });
  }

  // Validate prerequisite ordering
  errors.push(...validatePrerequisiteOrdering(scheduledSkillOrder, graph));

  return errors;
}

function validateSkillSequence(
  sequence: AISkillSelection[],
  graph: SkillGraph,
  weekIndex: number,
  scheduledSkillOrder: string[],
): PlannerValidationError[] {
  const errors: PlannerValidationError[] = [];

  for (let j = 0; j < sequence.length; j++) {
    const sel = sequence[j];
    const prefix = `weeklyStructure[${weekIndex}].skillSequence[${j}]`;

    // Validate skillId exists and is active
    const node = graph.nodes.get(sel.skillId);
    if (!node) {
      errors.push({ field: `${prefix}.skillId`, message: `Skill "${sel.skillId}" does not exist in skill graph` });
      continue;
    }
    if (!node.isActive) {
      errors.push({ field: `${prefix}.skillId`, message: `Skill "${sel.skillId}" is not active` });
      continue;
    }

    // Validate executable skills have protocols
    if (node.kind !== 'proofing' && node.kind !== 'recovery' && node.kind !== 'diagnostic' && !node.protocolId) {
      errors.push({ field: `${prefix}.skillId`, message: `Skill "${sel.skillId}" has no protocol and is not proofing/recovery` });
    }

    // Validate no recovery/diagnostic nodes used
    if (node.kind === 'recovery' || node.kind === 'diagnostic') {
      errors.push({ field: `${prefix}.skillId`, message: `Skill "${sel.skillId}" is ${node.kind} — not usable in initial plans` });
    }

    // Validate environment
    if (!VALID_ENVIRONMENTS.includes(sel.environment)) {
      errors.push({ field: `${prefix}.environment`, message: `Invalid environment: "${sel.environment}"` });
    }

    // Validate sessionKind
    if (!VALID_SESSION_KINDS.includes(sel.sessionKind)) {
      errors.push({ field: `${prefix}.sessionKind`, message: `Invalid sessionKind: "${sel.sessionKind}"` });
    }

    // Validate sessionCount
    if (typeof sel.sessionCount !== 'number' || sel.sessionCount < 1 || sel.sessionCount > 4) {
      errors.push({ field: `${prefix}.sessionCount`, message: 'sessionCount must be 1-4' });
    }

    // Validate reasoningLabel
    if (typeof sel.reasoningLabel !== 'string' || sel.reasoningLabel.length === 0) {
      errors.push({ field: `${prefix}.reasoningLabel`, message: 'reasoningLabel is required' });
    }

    scheduledSkillOrder.push(sel.skillId);
  }

  return errors;
}

function validatePrerequisiteOrdering(
  scheduledSkillOrder: string[],
  graph: SkillGraph,
): PlannerValidationError[] {
  const errors: PlannerValidationError[] = [];
  const seen = new Set<string>();

  for (const skillId of scheduledSkillOrder) {
    const prereqs = getPrerequisiteSkills(graph, skillId);
    for (const prereq of prereqs) {
      // Only check prerequisite ordering for skills that are in the plan
      // If a prerequisite isn't scheduled at all, that's okay for now (it may already be mastered)
      if (scheduledSkillOrder.includes(prereq.id) && !seen.has(prereq.id)) {
        errors.push({
          field: 'prerequisiteOrdering',
          message: `Skill "${skillId}" is scheduled before its prerequisite "${prereq.id}" (${prereq.title})`,
        });
      }
    }
    seen.add(skillId);
  }

  return errors;
}

export function parsePlannerJSON(raw: string): { parsed: AIPlannerOutput | null; error: string | null } {
  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned) as AIPlannerOutput;
    return { parsed, error: null };
  } catch (e) {
    return { parsed: null, error: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}` };
  }
}
