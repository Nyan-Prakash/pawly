import type {
  DogLearningState,
  LearningHypothesis,
  Plan,
  PlanAdaptation,
  PlanSession,
  SkillEdge,
  SkillNode,
} from '../../types/index.ts';
import type { AggregatedRecentSignals, SessionLearningSignal, WalkLearningSignal } from './learningSignals.ts';
import { buildSkillGraph, type SkillGraph } from './skillGraph.ts';
import {
  getAdvanceOptions,
  getDetourOptions,
  getRegressionOptions,
} from './graphTraversal.ts';
import { chooseAdaptationCandidate, MAX_ADAPTATION_WINDOW } from './adaptationRules.ts';
import { compileAdaptation } from './adaptationCompiler.ts';
import { buildPlanDiff, type PlanDiffResult } from './planDiff.ts';

export interface AdaptationEngineInput {
  plan: Plan;
  nodes: SkillNode[];
  edges: SkillEdge[];
  learningState: DogLearningState | null;
  aggregatedSignals: AggregatedRecentSignals;
  recentSessions: SessionLearningSignal[];
  recentWalks: WalkLearningSignal[];
  recentAdaptations: PlanAdaptation[];
  now?: string;
  /**
   * Optional hypotheses derived externally (e.g. from deriveCurrentHypotheses).
   * When provided they are forwarded to the rule context so reflection-backed
   * hypothesis codes can be checked during candidate selection.
   * When omitted the engine falls back to learningState.currentHypotheses.
   */
  currentHypotheses?: LearningHypothesis[];
}

export interface AdaptationEngineResult {
  applied: boolean;
  skipped: boolean;
  reasonCode: string;
  reasonSummary: string;
  adaptationType: 'repeat' | 'regress' | 'advance' | 'detour' | 'difficulty_adjustment' | 'schedule_adjustment' | 'environment_adjustment';
  nextPlan: Plan;
  diff: PlanDiffResult;
  evidence: Record<string, unknown>;
  /** ID of the extra support session inserted, or null if none was inserted. */
  insertedSupportSessionId: string | null;
}

function getUpcomingSessions(plan: Plan): PlanSession[] {
  return plan.sessions.filter((session) => !session.isCompleted).slice(0, MAX_ADAPTATION_WINDOW);
}

function getCurrentSkill(graph: SkillGraph, plan: Plan, recentSessions: SessionLearningSignal[]): SkillNode | null {
  const upcomingSkillId = getUpcomingSessions(plan)[0]?.skillId ?? null;
  const recentSkillId = recentSessions[0]?.skillId ?? null;
  return graph.nodes.get(upcomingSkillId ?? recentSkillId ?? '') ?? null;
}

function emptyDiff(plan: Plan): PlanDiffResult {
  return {
    changedSessionIds: [],
    changedFields: [],
    previousSnapshot: { sessions: [], metadata: plan.metadata ?? {} },
    newSnapshot: { sessions: [], metadata: plan.metadata ?? {} },
  };
}

export function runAdaptationEngine(input: AdaptationEngineInput): AdaptationEngineResult | null {
  const now = input.now ?? new Date().toISOString();
  const graph = buildSkillGraph(input.nodes, input.edges);
  const currentSkill = getCurrentSkill(graph, input.plan, input.recentSessions);
  if (!currentSkill) return null;

  // Resolve hypotheses: prefer explicitly provided, fall back to learning state.
  const currentHypotheses: LearningHypothesis[] =
    input.currentHypotheses ??
    input.learningState?.currentHypotheses ??
    [];

  const candidate = chooseAdaptationCandidate({
    plan: input.plan,
    learningState: input.learningState,
    aggregatedSignals: input.aggregatedSignals,
    recentSessions: input.recentSessions,
    recentWalks: input.recentWalks,
    currentSkill,
    upcomingSessions: getUpcomingSessions(input.plan),
    advanceOptions: getAdvanceOptions(graph, currentSkill.id).filter((node) => Boolean(node.protocolId)),
    regressionOptions: getRegressionOptions(graph, currentSkill.id).filter((node) => Boolean(node.protocolId)),
    detourOptions: getDetourOptions(graph, currentSkill.id).filter((node) => Boolean(node.protocolId)),
    recentAdaptations: input.recentAdaptations,
    now,
    currentHypotheses,
  });

  if (!candidate) return null;

  const targetSkill = candidate.targetSkillId
    ? graph.nodes.get(candidate.targetSkillId) ?? null
    : currentSkill;
  if (candidate.targetSkillId && !targetSkill) {
    return {
      applied: false,
      skipped: true,
      reasonCode: 'target_skill_missing',
      reasonSummary: 'A safe target skill was not available for adaptation.',
      adaptationType: candidate.type,
      nextPlan: input.plan,
      diff: emptyDiff(input.plan),
      evidence: { candidate },
      insertedSupportSessionId: null,
    };
  }

  const compiled = compileAdaptation({
    plan: input.plan,
    candidate,
    targetSkill,
    now,
  });

  if (!compiled) {
    return {
      applied: false,
      skipped: true,
      reasonCode: 'no_mutation_window',
      reasonSummary: 'No upcoming incomplete sessions were available to adapt safely.',
      adaptationType: candidate.type,
      nextPlan: input.plan,
      diff: emptyDiff(input.plan),
      evidence: { candidate },
      insertedSupportSessionId: null,
    };
  }

  // Include the inserted support session in the diff tracking so audit records
  // reflect the new session.
  const trackedForDiff = compiled.insertedSupportSessionId
    ? [...compiled.touchedSessionIds, compiled.insertedSupportSessionId]
    : compiled.touchedSessionIds;
  const diff = buildPlanDiff(input.plan, compiled.nextPlan, trackedForDiff);
  if (diff.changedSessionIds.length === 0) {
    return {
      applied: false,
      skipped: true,
      reasonCode: 'no_effective_change',
      reasonSummary: 'The adaptation candidate did not produce a meaningful change in the next session window.',
      adaptationType: candidate.type,
      nextPlan: input.plan,
      diff,
      evidence: { candidate },
      insertedSupportSessionId: null,
    };
  }

  return {
    applied: true,
    skipped: false,
    reasonCode: candidate.reasonCode,
    reasonSummary: candidate.reasonSummary,
    adaptationType: candidate.type,
    nextPlan: compiled.nextPlan,
    diff,
    evidence: {
      ...candidate.evidence,
      insertedSupportSessionId: compiled.insertedSupportSessionId,
      insertedSupportSessionType: candidate.insertSupportSession ?? null,
    },
    insertedSupportSessionId: compiled.insertedSupportSessionId,
  };
}
