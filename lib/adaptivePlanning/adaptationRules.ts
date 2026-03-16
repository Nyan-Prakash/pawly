import type {
  AdaptationType,
  DogLearningState,
  Plan,
  PlanAdaptation,
  PlanEnvironment,
  PlanSession,
  SkillNode,
} from '../../types/index.ts';
import type { AggregatedRecentSignals, SessionLearningSignal, WalkLearningSignal } from './learningSignals.ts';

export const MAX_ADAPTATION_WINDOW = 5;
export const DEFAULT_ADAPTATION_WINDOW = 3;

export interface AdaptationCandidate {
  type: AdaptationType;
  priority: number;
  reasonCode: string;
  reasonSummary: string;
  targetSkillId?: string | null;
  targetEnvironment?: PlanEnvironment | null;
  sessionCount: number;
  durationDeltaMinutes?: number;
  requiresDateShift?: boolean;
  evidence: Record<string, unknown>;
}

export interface AdaptationDecisionContext {
  plan: Plan;
  learningState: DogLearningState | null;
  aggregatedSignals: AggregatedRecentSignals;
  recentSessions: SessionLearningSignal[];
  recentWalks: WalkLearningSignal[];
  currentSkill: SkillNode | null;
  upcomingSessions: PlanSession[];
  advanceOptions: SkillNode[];
  regressionOptions: SkillNode[];
  detourOptions: SkillNode[];
  recentAdaptations: PlanAdaptation[];
  now: string;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hoursSince(iso: string, now: string): number {
  return (Date.parse(now) - Date.parse(iso)) / 3600000;
}

function isSameBehaviorWindow(candidate: AdaptationCandidate, recent: PlanAdaptation | undefined): boolean {
  if (!recent) return false;
  return recent.reasonCode === candidate.reasonCode || recent.adaptationType === candidate.type;
}

export function determineLowerEnvironmentTrack(
  currentEnvironment?: PlanEnvironment | null,
): PlanEnvironment | null {
  if (!currentEnvironment) return 'indoors_low_distraction';
  if (currentEnvironment === 'outdoors_high_distraction') return 'outdoors_low_distraction';
  if (currentEnvironment === 'outdoors_moderate_distraction') return 'outdoors_low_distraction';
  if (currentEnvironment === 'outdoors_low_distraction') return 'indoors_low_distraction';
  if (currentEnvironment === 'indoors_moderate_distraction') return 'indoors_low_distraction';
  return 'indoors_low_distraction';
}

export function chooseAdaptationCandidate(
  context: AdaptationDecisionContext,
): AdaptationCandidate | null {
  const completed = context.recentSessions.filter((session) => session.completed).slice(0, 5);
  const lastThree = completed.slice(0, 3);
  const avgLastThree = average(lastThree.map((session) => session.successScore));
  const allEasy = lastThree.length >= 3 && lastThree.every((session) => session.difficulty === 'easy');
  const consecutiveHard = context.recentSessions
    .slice(0, 2)
    .filter((session) => session.completed && (session.difficulty === 'hard' || session.successScore <= 2))
    .length;
  const outdoorFailures = completed.filter(
    (session) => session.environmentTag.includes('outdoors') && session.successScore <= 2,
  );
  const indoorSuccesses = completed.filter(
    (session) => session.environmentTag.includes('indoors') && session.successScore >= 4,
  );
  const latestApplied = context.recentAdaptations.find((item) => item.status === 'applied');

  const currentEnvironment =
    context.upcomingSessions[0]?.environment ??
    (context.recentSessions[0]?.environmentTag as PlanEnvironment | undefined) ??
    null;

  const candidates: AdaptationCandidate[] = [];

  if (outdoorFailures.length >= 2 && indoorSuccesses.length >= 1 && currentEnvironment?.includes('outdoors')) {
    candidates.push({
      type: 'environment_adjustment',
      priority: 100,
      reasonCode: 'outdoor_breakdown',
      reasonSummary: 'Recent results suggest this skill is holding indoors but breaking down outside.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
      sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -2,
      evidence: {
        outdoorFailureCount: outdoorFailures.length,
        indoorSuccessCount: indoorSuccesses.length,
        currentEnvironment,
      },
    });
  }

  if (consecutiveHard >= 2 || avgLastThree <= 2) {
    const detourTarget =
      context.detourOptions[0] ??
      null;
    const regressTarget =
      context.regressionOptions[0] ??
      null;
    const poorConfidence = (context.learningState?.confidenceScore ?? 3) <= 2;
    const highDistraction = (context.learningState?.distractionSensitivity ?? 3) >= 4;

    if ((highDistraction || poorConfidence) && detourTarget?.protocolId) {
      candidates.push({
        type: 'detour',
        priority: 95,
        reasonCode: 'supporting_skill_reset',
        reasonSummary: 'Recent sessions were consistently hard, so the next block shifts to a supporting skill first.',
        targetSkillId: detourTarget.id,
        targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
        sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
        durationDeltaMinutes: -2,
        evidence: {
          consecutiveHard,
          avgLastThree: Number(avgLastThree.toFixed(2)),
          detourSkillId: detourTarget.id,
        },
      });
    } else if (regressTarget?.protocolId) {
      candidates.push({
        type: 'regress',
        priority: 90,
        reasonCode: 'consistency_drop',
        reasonSummary: 'The last few sessions were too difficult, so the next sessions step back to an easier prerequisite.',
        targetSkillId: regressTarget.id,
        targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
        sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
        durationDeltaMinutes: -2,
        evidence: {
          consecutiveHard,
          avgLastThree: Number(avgLastThree.toFixed(2)),
          regressSkillId: regressTarget.id,
        },
      });
    }
  }

  if ((context.learningState?.fatigueRiskScore ?? 3) >= 4) {
    candidates.push({
      type: 'schedule_adjustment',
      priority: 80,
      reasonCode: 'fatigue_risk_high',
      reasonSummary: 'Recent signals suggest fatigue risk is elevated, so the next session is being lightened and spaced out.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
      sessionCount: 1,
      durationDeltaMinutes: -3,
      requiresDateShift: true,
      evidence: {
        fatigueRiskScore: context.learningState?.fatigueRiskScore ?? null,
        recentWalkDelta: context.aggregatedSignals.summary.walkQualityDelta,
      },
    });
  }

  if (
    (context.learningState?.handlerConsistencyScore ?? 3) <= 2 ||
    context.aggregatedSignals.summary.inconsistencyIndex >= 0.45
  ) {
    candidates.push({
      type: 'repeat',
      priority: 70,
      reasonCode: 'handler_consistency_reset',
      reasonSummary: 'The next session will repeat the current foundation to rebuild cleaner timing and consistency.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
      sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -1,
      evidence: {
        handlerConsistencyScore: context.learningState?.handlerConsistencyScore ?? null,
        inconsistencyIndex: Number(context.aggregatedSignals.summary.inconsistencyIndex.toFixed(2)),
      },
    });
  }

  if (
    context.aggregatedSignals.summary.longSessionCount >= 2 &&
    context.aggregatedSignals.summary.motivationDropInLongSessions
  ) {
    candidates.push({
      type: 'difficulty_adjustment',
      priority: 60,
      reasonCode: 'session_load_too_high',
      reasonSummary: 'The next sessions are being shortened slightly to keep motivation up.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: currentEnvironment,
      sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -3,
      evidence: {
        longSessionCount: context.aggregatedSignals.summary.longSessionCount,
        avgSessionDurationMinutes: context.aggregatedSignals.summary.avgSessionDurationMinutes,
      },
    });
  }

  if (
    lastThree.length >= 3 &&
    avgLastThree >= 4 &&
    allEasy &&
    context.advanceOptions[0]?.protocolId
  ) {
    candidates.push({
      type: 'advance',
      priority: 50,
      reasonCode: 'high_consistent_success',
      reasonSummary: 'Recent sessions have been consistently easy and successful, so the next block can advance early.',
      targetSkillId: context.advanceOptions[0].id,
      targetEnvironment: context.upcomingSessions[0]?.environment ?? 'indoors_low_distraction',
      sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
      evidence: {
        avgLastThree: Number(avgLastThree.toFixed(2)),
        easySessionCount: lastThree.length,
        advanceSkillId: context.advanceOptions[0].id,
      },
    });
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const selected = candidates[0] ?? null;
  if (!selected) return null;

  if (
    latestApplied &&
    hoursSince(latestApplied.createdAt, context.now) < 8 &&
    isSameBehaviorWindow(selected, latestApplied) &&
    selected.type !== 'regress' &&
    selected.type !== 'detour'
  ) {
    return null;
  }

  return selected;
}
