import type {
  DogLearningState,
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
    };
  }

  const diff = buildPlanDiff(input.plan, compiled.nextPlan, compiled.touchedSessionIds);
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
    evidence: candidate.evidence,
  };
}
