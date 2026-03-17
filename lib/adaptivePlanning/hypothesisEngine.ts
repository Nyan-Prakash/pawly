import type { DogLearningState, LearningHypothesis } from '../../types/index.ts';
import type { AggregatedRecentSignals, ReflectionEvidence } from './learningSignals.ts';

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

  // ── Reflection-derived hypotheses ─────────────────────────────────────────
  // These only fire when enough handler-reported evidence has accumulated
  // (≥ 2 sessions with reflection data) and the weighted pressure is notable.
  // Wording is deliberately conservative: "suggests", "appears", "may".
  // Threshold 0.4 = moderate pressure at high confidence or strong pressure
  // at medium confidence — avoids firing on a single low-confidence session.

  const ref: ReflectionEvidence = summary.reflectionEvidence;
  const hasEnoughReflectionData = ref.sessionsWithReflection >= 2;

  if (hasEnoughReflectionData && ref.understandingPressure >= 0.4) {
    pushHypothesis(
      hypotheses,
      'cue_understanding_gap',
      'Recent sessions suggest the dog may not fully understand the cue yet.',
      [
        `Understanding pressure across ${ref.sessionsWithReflection} recent sessions: ${(ref.understandingPressure * 100).toFixed(0)}%.`,
        `Avg handler confidence: ${ref.avgReflectionConfidence !== null ? (ref.avgReflectionConfidence * 5).toFixed(1) : 'n/a'}/5.`,
      ],
      ref.understandingPressure >= 0.7 ? 'high' : 'medium',
    );
  }

  if (hasEnoughReflectionData && ref.distractionPressure >= 0.4) {
    pushHypothesis(
      hypotheses,
      'distraction_recurring_blocker',
      'Distraction appears to be a recurring blocker across recent sessions.',
      [
        `Distraction pressure across ${ref.sessionsWithReflection} recent sessions: ${(ref.distractionPressure * 100).toFixed(0)}%.`,
        `Avg handler confidence: ${ref.avgReflectionConfidence !== null ? (ref.avgReflectionConfidence * 5).toFixed(1) : 'n/a'}/5.`,
      ],
      ref.distractionPressure >= 0.7 ? 'high' : 'medium',
    );
  }

  if (hasEnoughReflectionData && ref.durationBreakdownPressure >= 0.4) {
    pushHypothesis(
      hypotheses,
      'duration_breakdown_pattern',
      'Recent breakdowns appear to be happening near the end of sessions.',
      [
        `Duration-breakdown pressure across ${ref.sessionsWithReflection} recent sessions: ${(ref.durationBreakdownPressure * 100).toFixed(0)}%.`,
        `Avg handler confidence: ${ref.avgReflectionConfidence !== null ? (ref.avgReflectionConfidence * 5).toFixed(1) : 'n/a'}/5.`,
      ],
      'medium',
    );
  }

  if (hasEnoughReflectionData && ref.arousalPressure >= 0.4) {
    pushHypothesis(
      hypotheses,
      'arousal_pattern',
      'Over-arousal may be interfering with the dog\'s ability to settle and respond.',
      [
        `Arousal pressure across ${ref.sessionsWithReflection} recent sessions: ${(ref.arousalPressure * 100).toFixed(0)}%.`,
        `Avg handler confidence: ${ref.avgReflectionConfidence !== null ? (ref.avgReflectionConfidence * 5).toFixed(1) : 'n/a'}/5.`,
      ],
      ref.arousalPressure >= 0.7 ? 'high' : 'medium',
    );
  }

  if (hasEnoughReflectionData && ref.handlerFrictionPressure >= 0.4) {
    pushHypothesis(
      hypotheses,
      'handler_friction_pattern',
      'Handler-side friction may be contributing to inconsistent results.',
      [
        `Handler friction pressure across ${ref.sessionsWithReflection} recent sessions: ${(ref.handlerFrictionPressure * 100).toFixed(0)}%.`,
        `Avg handler confidence: ${ref.avgReflectionConfidence !== null ? (ref.avgReflectionConfidence * 5).toFixed(1) : 'n/a'}/5.`,
      ],
      'medium',
    );
  }

  return hypotheses.slice(0, 3);
}
