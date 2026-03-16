import type { DogLearningState, LearningHypothesis } from '../../types/index.ts';
import type { AggregatedRecentSignals } from './learningSignals.ts';

function pushHypothesis(
  hypotheses: LearningHypothesis[],
  code: string,
  summary: string,
  evidence: string[],
  confidence: LearningHypothesis['confidence'],
) {
  hypotheses.push({ code, summary, evidence, confidence });
}

export function deriveCurrentHypotheses(
  state: DogLearningState,
  recentSignals: AggregatedRecentSignals,
): LearningHypothesis[] {
  const hypotheses: LearningHypothesis[] = [];
  const summary = recentSignals.summary;
  const indoorRate = summary.indoorSuccessRate ?? 0;
  const outdoorRate = summary.outdoorSuccessRate ?? 0;

  if (summary.outdoorSuccessRate !== null && summary.indoorSuccessRate !== null && indoorRate - outdoorRate >= 0.3) {
    pushHypothesis(
      hypotheses,
      'environment_gap',
      'Learns quickly indoors but loses focus when the environment gets busier.',
      [
        `Indoor success rate: ${Math.round(indoorRate * 100)}%.`,
        `Outdoor success rate: ${Math.round(outdoorRate * 100)}%.`,
      ],
      summary.hardOutdoorCount >= 2 ? 'high' : 'medium',
    );
  }

  if (summary.motivationDropInLongSessions || state.fatigueRiskScore >= 4) {
    pushHypothesis(
      hypotheses,
      'shorter_reps_help',
      'Shorter reps may keep engagement higher than longer sessions right now.',
      [
        `Long-session count in recent window: ${summary.longSessionCount}.`,
        `Fatigue risk score: ${state.fatigueRiskScore}/5.`,
      ],
      summary.abandonedCount > 0 ? 'high' : 'medium',
    );
  }

  if (summary.recoverySessionCount >= 2 && (summary.recoveryBounceRate ?? 0) >= 0.66) {
    pushHypothesis(
      hypotheses,
      'recovery_builds_confidence',
      'Confidence seems to rebound well after easier recovery-style sessions.',
      [
        `Recovery bounce rate: ${Math.round((summary.recoveryBounceRate ?? 0) * 100)}%.`,
        `Confidence score: ${state.confidenceScore}/5.`,
      ],
      'medium',
    );
  }

  if (summary.inconsistencyIndex >= 0.35 || state.handlerConsistencyScore <= 2) {
    pushHypothesis(
      hypotheses,
      'handler_timing_variance',
      'Handler timing may be inconsistent when difficulty increases.',
      [
        `Inconsistency index: ${summary.inconsistencyIndex.toFixed(2)}.`,
        `Handler consistency score: ${state.handlerConsistencyScore}/5.`,
      ],
      summary.proofingCount >= 2 ? 'high' : 'medium',
    );
  }

  if (summary.poorWalkCount >= 2 && (summary.walkQualityAvg ?? 2) <= 1.7) {
    pushHypothesis(
      hypotheses,
      'walks_need_lower_distraction',
      'Walks may improve with a lower-distraction setup before adding more challenge.',
      [
        `Poor-quality walks in recent window: ${summary.poorWalkCount}.`,
        `Average walk quality: ${(summary.walkQualityAvg ?? 2).toFixed(1)}/3.`,
      ],
      'medium',
    );
  }

  if (summary.easySuccessStreak >= 3 && (summary.lowDistractionSuccessRate ?? 0) >= 0.75) {
    pushHypothesis(
      hypotheses,
      'ready_for_slightly_more',
      'Foundational work looks sticky enough to tolerate small increases in challenge.',
      [
        `Easy-success streak: ${summary.easySuccessStreak}.`,
        `Low-distraction success rate: ${Math.round((summary.lowDistractionSuccessRate ?? 0) * 100)}%.`,
      ],
      'medium',
    );
  }

  return hypotheses.slice(0, 3);
}
