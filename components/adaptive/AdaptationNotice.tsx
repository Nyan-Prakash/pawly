/**
 * AdaptationNotice
 *
 * Shown on the Today screen when the most recent plan adaptation is 'applied'.
 * Tapping "See why" opens WhyThisChangedSheet.
 */

import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { PlanAdaptation } from '@/types';

interface AdaptationNoticeProps {
  dogName: string;
  adaptation: PlanAdaptation;
  onSeeWhy: () => void;
}

function adaptationTitle(adaptation: PlanAdaptation, dogName: string): string {
  switch (adaptation.adaptationType) {
    case 'regress':
      return `We stepped back for ${dogName}`;
    case 'advance':
      return `${dogName} is ready to move forward`;
    case 'detour':
      return `We adjusted today's focus`;
    case 'repeat':
      return `We're reinforcing this skill`;
    case 'difficulty_adjustment':
      return `We adjusted the difficulty`;
    case 'schedule_adjustment':
      return `We adjusted today's session`;
    default:
      return `We adjusted ${dogName}'s plan`;
  }
}

function adaptationBody(adaptation: PlanAdaptation): string {
  // Prefer the stored reasonSummary; it is already user-facing copy from the rules.
  if (adaptation.reasonSummary) return adaptation.reasonSummary;

  // Fallback copy keyed by reason code for older records that lack a summary.
  switch (adaptation.reasonCode) {
    case 'reflection_understanding_gap':
      return 'Recent feedback suggests the cue may not be fully clear yet, so the coach added extra foundation practice.';
    case 'reflection_distraction_blocker':
      return 'Distraction appears to be the main blocker right now, so the coach lowered the environment challenge for the next sessions.';
    case 'reflection_duration_breakdown':
      return 'Recent sessions seem to fall apart near the end, so the coach shortened the target duration.';
    case 'reflection_over_arousal':
      return 'Over-excitement seems to be getting in the way, so the coach simplified and shortened upcoming sessions.';
    case 'reflection_handler_friction':
      return 'Recent feedback was mixed, so the coach kept this adjustment small.';
    case 'outdoor_breakdown':
      return 'Recent results suggest this skill is holding indoors but breaking down outside.';
    case 'consistency_drop':
      return 'The last few sessions were too difficult, so the next sessions step back to an easier foundation.';
    case 'fatigue_risk_high':
      return 'Recent patterns suggest fatigue risk is elevated, so the next session is shorter and spaced out.';
    case 'high_consistent_success':
      return 'Recent sessions have been consistently easy, so the plan moves to the next challenge.';
  }

  // Final fallback by type
  switch (adaptation.adaptationType) {
    case 'regress':
      return 'We stepped back to an easier version so your dog can build confidence again.';
    case 'advance':
      return 'Recent sessions have gone well, so we moved to the next challenge.';
    case 'detour':
      return 'We swapped in a different skill to keep things fresh and avoid frustration.';
    case 'repeat':
      return 'Another session on this skill will help lock in what was learned.';
    default:
      return 'The plan was updated based on recent training results.';
  }
}

export function AdaptationNotice({ dogName, adaptation, onSeeWhy }: AdaptationNoticeProps) {
  return (
    <Card style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppIcon name="sync-outline" size={20} color={colors.accent} />
        <Text variant="caption" accessibilityRole="header">
          Plan updated
        </Text>
      </View>

      <Text variant="bodyStrong">{adaptationTitle(adaptation, dogName)}</Text>

      <Text variant="body" color={colors.text.secondary}>
        {adaptationBody(adaptation)}
      </Text>

      <Pressable
        onPress={onSeeWhy}
        accessibilityRole="button"
        accessibilityLabel="See why the plan changed"
        accessibilityHint="Opens the explanation"
        hitSlop={8}
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          minHeight: 44,
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text variant="bodyStrong" color={colors.accent}>
          See why
        </Text>
      </Pressable>
    </Card>
  );
}
