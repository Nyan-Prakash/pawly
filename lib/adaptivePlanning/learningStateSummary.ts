import type { DogLearningState } from '../../types/index.ts';

export interface LearningStateCoachSummary {
  summary: string;
  topHypotheses: string[];
  environmentDeltas: string[];
  warnings: string[];
}

function formatEnvironmentLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

export function buildLearningStateCoachSummary(
  dogName: string,
  state: DogLearningState | null,
): LearningStateCoachSummary {
  if (!state) {
    return {
      summary: `No learning-state history yet for ${dogName}. Use only the dog profile, plan, and recent activity.`,
      topHypotheses: [],
      environmentDeltas: [],
      warnings: [],
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

  const scoreSummary = [
    `motivation ${state.motivationScore}/5`,
    `distraction sensitivity ${state.distractionSensitivity}/5`,
    `confidence ${state.confidenceScore}/5`,
    `fatigue risk ${state.fatigueRiskScore}/5`,
  ].join(', ');

  const summary = [
    `Learning state for ${dogName}: ${scoreSummary}.`,
    hypotheses.length ? `Top training patterns: ${hypotheses.join(' ')}` : 'No strong training patterns yet.',
    deltas.length ? `Environment notes: ${deltas.join(' ')}` : '',
    warnings.length ? `Use these as training heuristics, not medical facts. Watch-outs: ${warnings.join(' ')}` : 'Use these as training heuristics, not medical facts.',
  ].filter(Boolean).join(' ');

  return {
    summary,
    topHypotheses: hypotheses,
    environmentDeltas: deltas,
    warnings,
  };
}
