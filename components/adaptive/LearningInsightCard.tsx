/**
 * LearningInsightCard
 *
 * Shown on the Progress screen.
 * Renders 2–4 warm, trainer-tone insights derived from dog_learning_state
 * (currentHypotheses + recentTrends). Safe to render with null learningState.
 */

import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import type { DogLearningState } from '@/types';

interface LearningInsightCardProps {
  dogName: string;
  learningState: DogLearningState | null;
}

/** Derive friendly insight strings from raw scores + hypotheses. */
function deriveInsights(dogName: string, state: DogLearningState): string[] {
  const insights: string[] = [];

  // Hypotheses first (most directly meaningful)
  for (const h of state.currentHypotheses.slice(0, 2)) {
    if (h.summary) insights.push(h.summary);
  }

  // Score-based insights (only add when there's clear signal)
  if (state.confidenceScore < 2.5) {
    insights.push(`${dogName} seems to be building confidence. Shorter, easier sessions are helping.`);
  } else if (state.confidenceScore >= 4) {
    insights.push(`${dogName}'s confidence is high. This is a great time for new challenges.`);
  }

  if (state.distractionSensitivity >= 3.5) {
    insights.push(`Outdoor distractions are still the biggest challenge for ${dogName}.`);
  }

  if (state.motivationScore >= 4) {
    insights.push(`${dogName} is showing strong motivation right now. Keep the sessions varied and fun.`);
  } else if (state.motivationScore < 2.5) {
    insights.push(`${dogName}'s drive seems a bit lower lately. Try shorter sessions with higher-value treats.`);
  }

  if (state.fatigueRiskScore >= 3.5) {
    insights.push(`Watch for signs of mental tiredness. ${dogName} may need more recovery between sessions.`);
  }

  // Environment confidence
  const envEntries = Object.entries(state.environmentConfidence ?? {});
  const bestEnv = envEntries.sort((a, b) => b[1] - a[1])[0];
  if (bestEnv && bestEnv[1] >= 3.5) {
    const envLabel = bestEnv[0].replace(/_/g, ' ');
    insights.push(`${dogName} performs best in ${envLabel} settings.`);
  }

  // Cap at 4
  return insights.slice(0, 4);
}

export function LearningInsightCard({ dogName, learningState }: LearningInsightCardProps) {
  if (!learningState) return null;

  const insights = deriveInsights(dogName, learningState);
  if (insights.length === 0) return null;

  return (
    <Card style={{ gap: spacing.sm }}>
      <Text variant="caption" accessibilityRole="header">
        What the coach is learning
      </Text>

      {insights.map((insight, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
          <View
            style={{
              width: spacing.xs,
              height: spacing.xs,
              borderRadius: radii.full,
              backgroundColor: colors.accent,
              marginTop: spacing.sm,
            }}
          />
          <Text variant="body" style={{ flex: 1 }}>
            {insight}
          </Text>
        </View>
      ))}
    </Card>
  );
}
