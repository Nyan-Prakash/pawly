/**
 * AdaptationNotice
 *
 * Shown on the Today screen when the most recent plan adaptation is 'applied'.
 * Tapping "See why" opens WhyThisChangedSheet.
 */

import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
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
  // Prefer the human-written reasonSummary from the DB
  if (adaptation.reasonSummary) return adaptation.reasonSummary;

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
    <View
      style={{
        backgroundColor: colors.status.infoBg,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.status.infoBorder,
        padding: spacing.md,
        gap: spacing.xs,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <AppIcon name="sparkles" size={14} color={colors.brand.coach} />
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brand.coach, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Plan updated
        </Text>
      </View>

      <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text.primary }}>
        {adaptationTitle(adaptation, dogName)}
      </Text>

      <Text style={{ fontSize: 13, lineHeight: 19, color: colors.text.secondary }}>
        {adaptationBody(adaptation)}
      </Text>

      <Pressable
        onPress={onSeeWhy}
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          marginTop: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingVertical: 7,
          borderRadius: radii.pill,
          backgroundColor: pressed ? `${colors.brand.coach}22` : `${colors.brand.coach}14`,
          borderWidth: 1,
          borderColor: `${colors.brand.coach}30`,
        })}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.brand.coach }}>
          See why →
        </Text>
      </Pressable>
    </View>
  );
}
