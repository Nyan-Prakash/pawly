/**
 * LearningInsightCard
 *
 * Shown on the Progress screen.
 * Renders 2–4 warm, trainer-tone insights derived from dog_learning_state
 * (currentHypotheses + recentTrends). Safe to render with null learningState.
 */

import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
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
    insights.push(`${dogName} seems to be building confidence — shorter, easier sessions are helping.`);
  } else if (state.confidenceScore >= 4) {
    insights.push(`${dogName}'s confidence is high. This is a great time for new challenges.`);
  }

  if (state.distractionSensitivity >= 3.5) {
    insights.push(`Outdoor distractions are still the biggest challenge for ${dogName}.`);
  }

  if (state.motivationScore >= 4) {
    insights.push(`${dogName} is showing strong motivation right now — keep the sessions varied and fun.`);
  } else if (state.motivationScore < 2.5) {
    insights.push(`${dogName}'s drive seems a bit lower lately. Try shorter sessions with higher-value treats.`);
  }

  if (state.fatigueRiskScore >= 3.5) {
    insights.push(`Watch for signs of mental tiredness — ${dogName} may need more recovery between sessions.`);
  }

  // Environment confidence
  const envEntries = Object.entries(state.environmentConfidence ?? {});
  const bestEnv = envEntries.sort((a, b) => b[1] - a[1])[0];
  if (bestEnv && bestEnv[1] >= 3.5) {
    const envLabel = bestEnv[0].replace(/_/g, ' ').replace('indoors', 'indoors').replace('outdoors', 'outdoors');
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
    <View
      style={{
        backgroundColor: '#F4FBF6',
        borderRadius: radii.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: '#C6E9D4',
        gap: spacing.sm,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <AppIcon name="analytics" size={18} color={colors.brand.primary} />
        <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text.primary }}>
          What Pawly is learning about {dogName}
        </Text>
      </View>

      <Text style={{ fontSize: 12, color: colors.text.secondary, lineHeight: 18 }}>
        Observations from recent training — not predictions, just patterns.
      </Text>

      {/* Insight rows */}
      {insights.map((insight, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.xs,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.brand.primary,
              marginTop: 6,
              flexShrink: 0,
            }}
          />
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 21, color: colors.text.primary }}>
            {insight}
          </Text>
        </View>
      ))}
    </View>
  );
}
