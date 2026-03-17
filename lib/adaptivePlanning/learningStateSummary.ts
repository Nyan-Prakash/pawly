import type { DogLearningState } from '../../types/index.ts';
import type { ReflectionEvidence } from './learningSignals.ts';

export interface LearningStateCoachSummary {
  summary: string;
  topHypotheses: string[];
  environmentDeltas: string[];
  warnings: string[];
  /** Grounded observation lines derived from recent handler reflections. Empty when no reflection data is available. */
  reflectionObservations: string[];
}

function formatEnvironmentLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

/**
 * Builds grounded observation sentences from aggregated reflection evidence.
 * Only emits observations when the pressure is notable (>= 0.4) and there
 * are at least 2 sessions worth of reflection data behind it.
 * Wording is conservative: "suggests", "appears", "may".
 */
function buildReflectionObservations(ref: ReflectionEvidence): string[] {
  if (ref.sessionsWithReflection < 2) return [];

  const observations: string[] = [];

  if (ref.understandingPressure >= 0.4) {
    observations.push(
      `Recent sessions suggest the dog may not fully understand the cue yet (${ref.sessionsWithReflection} sessions reported).`,
    );
  }
  if (ref.distractionPressure >= 0.4) {
    observations.push(
      `Distraction appears to be a recurring blocker across recent sessions.`,
    );
  }
  if (ref.durationBreakdownPressure >= 0.4) {
    observations.push(
      `Recent breakdowns appear to be happening near the end of sessions, which may suggest the duration needs trimming.`,
    );
  }
  if (ref.arousalPressure >= 0.4) {
    observations.push(
      `Over-arousal may be interfering with the dog's ability to settle and respond during sessions.`,
    );
  }
  if (ref.handlerFrictionPressure >= 0.4) {
    observations.push(
      `Handler-side friction (timing, cue consistency) may be contributing to inconsistent results.`,
    );
  }

  return observations;
}

export function buildLearningStateCoachSummary(
  dogName: string,
  state: DogLearningState | null,
  reflectionEvidence?: ReflectionEvidence | null,
): LearningStateCoachSummary {
  if (!state) {
    return {
      summary: `No learning-state history yet for ${dogName}. Use only the dog profile, plan, and recent activity.`,
      topHypotheses: [],
      environmentDeltas: [],
      warnings: [],
      reflectionObservations: [],
    };
  }

  const hypotheses = state.currentHypotheses.slice(0, 3).map((item) => item.summary);
  const deltas = Object.entries((state.recentTrends?.notableEnvironmentDeltas ?? {}) as Record<string, number>)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([environment, delta]) => {
      const direction = delta > 0 ? 'stronger' : 'harder';
      return `${formatEnvironmentLabel(environment)} has been ${direction} lately (${delta > 0 ? '+' : ''}${delta.toFixed(2)} vs baseline).`;
    });
  const warnings = Array.isArray(state.recentTrends?.warnings)
    ? (state.recentTrends.warnings as string[]).slice(0, 3)
    : [];

  const reflectionObservations = reflectionEvidence
    ? buildReflectionObservations(reflectionEvidence)
    : [];

  const scoreSummary = [
    `motivation ${state.motivationScore}/5`,
    `distraction sensitivity ${state.distractionSensitivity}/5`,
    `confidence ${state.confidenceScore}/5`,
    `fatigue risk ${state.fatigueRiskScore}/5`,
  ].join(', ');

  const summary = [
    `Learning state for ${dogName}: ${scoreSummary}.`,
    hypotheses.length ? `Top training patterns: ${hypotheses.join(' ')}` : 'No strong training patterns yet.',
    reflectionObservations.length ? `Handler observations: ${reflectionObservations.join(' ')}` : '',
    deltas.length ? `Environment notes: ${deltas.join(' ')}` : '',
    warnings.length ? `Use these as training heuristics, not medical facts. Watch-outs: ${warnings.join(' ')}` : 'Use these as training heuristics, not medical facts.',
  ].filter(Boolean).join(' ');

  return {
    summary,
    topHypotheses: hypotheses,
    environmentDeltas: deltas,
    warnings,
    reflectionObservations,
  };
}
