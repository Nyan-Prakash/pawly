import type { DogLearningState, Plan } from '../../types/index.ts';
import { deriveCurrentHypotheses } from './hypothesisEngine.ts';
import {
  aggregateRecentSignals,
  trimSignalsForWindow,
  type AggregatedRecentSignals,
  type SessionLogInput,
  type WalkLogInput,
} from './learningSignals.ts';

export const LEARNING_STATE_VERSION = 2;

function clampScore(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score)));
}

function boundedDelta(value: number): number {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

function applyDelta(score: number, delta: number): number {
  return clampScore(score + boundedDelta(delta));
}

export function createDefaultLearningState(): Omit<DogLearningState, 'id' | 'dogId' | 'createdAt' | 'updatedAt'> {
  return {
    motivationScore: 3,
    distractionSensitivity: 3,
    confidenceScore: 3,
    impulseControlScore: 3,
    handlerConsistencyScore: 3,
    fatigueRiskScore: 3,
    recoverySpeedScore: 3,
    environmentConfidence: {
      indoors_low_distraction: 3,
      indoors_moderate_distraction: 3,
      outdoors_low_distraction: 3,
      outdoors_moderate_distraction: 3,
      outdoors_high_distraction: 2,
    },
    behaviorSignals: {},
    recentTrends: {},
    currentHypotheses: [],
    lastEvaluatedAt: null,
    version: LEARNING_STATE_VERSION,
  };
}

function confidenceFromRate(rate: number | null | undefined): number | null {
  if (rate === null || rate === undefined) return null;
  if (rate >= 0.8) return 5;
  if (rate >= 0.65) return 4;
  if (rate >= 0.45) return 3;
  if (rate >= 0.25) return 2;
  return 1;
}

function mergeEnvironmentConfidence(
  previous: Record<string, number>,
  signals: AggregatedRecentSignals,
): Record<string, number> {
  const next = { ...previous };
  const summary = signals.summary;

  const indoor = confidenceFromRate(summary.indoorSuccessRate);
  const outdoor = confidenceFromRate(summary.outdoorSuccessRate);
  const low = confidenceFromRate(summary.lowDistractionSuccessRate);

  if (indoor !== null) next.indoors_low_distraction = clampScore(Math.round((next.indoors_low_distraction ?? 3) * 0.5 + indoor * 0.5));
  if (summary.indoorSuccessRate !== null && summary.indoorSuccessRate < 0.55) {
    next.indoors_moderate_distraction = applyDelta(next.indoors_moderate_distraction ?? 3, -1);
  } else if (summary.indoorSuccessRate !== null && summary.indoorSuccessRate >= 0.7) {
    next.indoors_moderate_distraction = applyDelta(next.indoors_moderate_distraction ?? 3, 1);
  }

  if (low !== null) {
    next.outdoors_low_distraction = clampScore(
      Math.round((next.outdoors_low_distraction ?? 3) * 0.6 + low * 0.4),
    );
  }
  if (outdoor !== null) {
    next.outdoors_moderate_distraction = clampScore(
      Math.round((next.outdoors_moderate_distraction ?? 3) * 0.6 + outdoor * 0.4),
    );
    if (summary.hardOutdoorCount >= 2 || outdoor <= 0.35) {
      next.outdoors_high_distraction = applyDelta(next.outdoors_high_distraction ?? 2, -1);
    } else if (outdoor >= 0.7) {
      next.outdoors_high_distraction = applyDelta(next.outdoors_high_distraction ?? 2, 1);
    }
  }

  return next;
}

function buildBehaviorSignals(signals: AggregatedRecentSignals) {
  const summary = signals.summary;
  return {
    recentSessionCount: summary.sessionCount,
    easySuccessStreak: summary.easySuccessStreak,
    averageSessionSuccess: summary.avgSessionSuccess,
    abandonmentRate: Number(summary.abandonmentRate.toFixed(2)),
    averageSessionDurationMinutes: summary.avgSessionDurationMinutes,
    indoorSuccessRate: summary.indoorSuccessRate,
    outdoorSuccessRate: summary.outdoorSuccessRate,
    recoveryBounceRate: summary.recoveryBounceRate,
    walkQualityAverage: summary.walkQualityAvg,
    poorWalkCount: summary.poorWalkCount,
    goodWalkCount: summary.goodWalkCount,
    hardOutdoorCount: summary.hardOutdoorCount,
    inconsistencyIndex: summary.inconsistencyIndex,
  };
}

function buildRecentTrends(signals: AggregatedRecentSignals) {
  const summary = signals.summary;
  const sessionTrend = summary.easySuccessStreak >= 3
    ? 'improving'
    : summary.hardSessionCount >= Math.max(2, Math.ceil(summary.sessionCount / 2))
    ? 'declining'
    : 'stable';
  const walkTrend = summary.walkQualityDelta >= 0.35
    ? 'improving'
    : summary.walkQualityDelta <= -0.35
    ? 'declining'
    : 'stable';

  return {
    sessionTrend,
    walkTrend,
    notableEnvironmentDeltas: summary.notableEnvironmentDeltas,
    warnings: summary.warnings,
    lastWindowEndedAt: signals.asOf,
  };
}

export function computeUpdatedLearningState(
  previousState: DogLearningState,
  recentSignals: AggregatedRecentSignals,
): Omit<DogLearningState, 'id' | 'dogId' | 'createdAt' | 'updatedAt'> {
  const summary = recentSignals.summary;

  let motivationDelta = 0;
  let distractionDelta = 0;
  let confidenceDelta = 0;
  let impulseDelta = 0;
  let handlerDelta = 0;
  let fatigueDelta = 0;
  let recoveryDelta = 0;

  if (summary.easySuccessStreak >= 3 && (summary.lowDistractionSuccessRate ?? 0) >= 0.75) {
    confidenceDelta += 1;
    motivationDelta += 1;
  }
  if (summary.hardOutdoorCount >= 2 && (summary.outdoorSuccessRate ?? 0) <= 0.4) {
    distractionDelta += 1;
  }
  if (summary.outdoorSuccessRate !== null && summary.indoorSuccessRate !== null && summary.indoorSuccessRate - summary.outdoorSuccessRate >= 0.3) {
    distractionDelta += 1;
  }
  if (summary.abandonedCount > 0 || summary.longSessionCount >= 2 || summary.motivationDropInLongSessions) {
    fatigueDelta += 1;
    motivationDelta -= 1;
  } else if ((summary.avgSessionDurationMinutes ?? 0) > 0 && (summary.avgSessionDurationMinutes ?? 0) <= 10 && summary.easySuccessStreak >= 2) {
    fatigueDelta -= 1;
  }
  if (summary.inconsistencyIndex >= 0.35) {
    handlerDelta -= 1;
  } else if (summary.sessionCount >= 4 && summary.inconsistencyIndex <= 0.15) {
    handlerDelta += 1;
  }
  if (summary.recoverySessionCount >= 2 && (summary.recoveryBounceRate ?? 0) >= 0.66) {
    recoveryDelta += 1;
    confidenceDelta += 1;
  }
  if (summary.poorWalkCount >= 2 || (summary.walkQualityAvg ?? 2) <= 1.7) {
    impulseDelta -= 1;
    distractionDelta += 1;
  } else if (summary.goodWalkCount >= 3 && (summary.walkQualityAvg ?? 2) >= 2.5) {
    impulseDelta += 1;
  }

  const nextState: Omit<DogLearningState, 'id' | 'dogId' | 'createdAt' | 'updatedAt'> = {
    motivationScore: applyDelta(previousState.motivationScore, motivationDelta),
    distractionSensitivity: applyDelta(previousState.distractionSensitivity, distractionDelta),
    confidenceScore: applyDelta(previousState.confidenceScore, confidenceDelta),
    impulseControlScore: applyDelta(previousState.impulseControlScore, impulseDelta),
    handlerConsistencyScore: applyDelta(previousState.handlerConsistencyScore, handlerDelta),
    fatigueRiskScore: applyDelta(previousState.fatigueRiskScore, fatigueDelta),
    recoverySpeedScore: applyDelta(previousState.recoverySpeedScore, recoveryDelta),
    environmentConfidence: mergeEnvironmentConfidence(previousState.environmentConfidence, recentSignals),
    behaviorSignals: buildBehaviorSignals(recentSignals),
    recentTrends: buildRecentTrends(recentSignals),
    currentHypotheses: [],
    lastEvaluatedAt: recentSignals.asOf,
    version: LEARNING_STATE_VERSION,
  };

  const hypothesisSource: DogLearningState = {
    ...previousState,
    ...nextState,
  };
  nextState.currentHypotheses = deriveCurrentHypotheses(hypothesisSource, recentSignals);

  return nextState;
}

export function recomputeLearningStateFromHistory(
  initialState: DogLearningState,
  sessions: SessionLogInput[],
  walks: WalkLogInput[],
  plan: Plan | null,
): DogLearningState {
  let previous = { ...initialState };

  const timeline = [
    ...sessions.map((session) => session.completed_at ?? session.created_at ?? new Date(0).toISOString()),
    ...walks.map((walk) => walk.logged_at ?? walk.created_at ?? new Date(0).toISOString()),
  ].sort();

  for (const timestamp of timeline) {
    const window = trimSignalsForWindow(sessions, walks, timestamp);
    const recentSignals = aggregateRecentSignals({
      sessions: window.sessions,
      walks: window.walks,
      plan,
    });
    previous = {
      ...previous,
      ...computeUpdatedLearningState(previous, recentSignals),
    };
  }

  return previous;
}
