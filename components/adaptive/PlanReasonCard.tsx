/**
 * PlanReasonCard
 *
 * Shown on plan-preview to explain WHY this plan was built this way.
 * Renders the planningSummary from AdaptivePlanMetadata plus a
 * "Built for <Dog>" row drawn from dog profile facts.
 */

import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import type { AIPlanningSummary } from '@/types';

interface PlanReasonCardProps {
  dogName: string;
  summary: AIPlanningSummary;
  /** e.g. "9 months old · Apartment · 3×/week" */
  profileCaption?: string;
  delay?: number;
}

export function PlanReasonCard({
  dogName,
  summary,
  profileCaption,
  delay = 0,
}: PlanReasonCardProps) {
  const bullets: { icon: 'checkmark-circle' | 'information-circle' | 'alert-circle'; text: string }[] = [];

  if (summary.whyThisStart) {
    bullets.push({ icon: 'checkmark-circle', text: summary.whyThisStart });
  }

  for (const assumption of (summary.keyAssumptions ?? []).slice(0, 2)) {
    bullets.push({ icon: 'information-circle', text: assumption });
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      style={{
        backgroundColor: `${colors.brand.primary}08`,
        borderRadius: radii.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: `${colors.brand.primary}28`,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
        <AppIcon name="sparkles" size={18} color={colors.brand.primary} />
        <Text style={{ fontWeight: '700', fontSize: 15, color: colors.brand.primary }}>
          Why we're starting here
        </Text>
      </View>

      {/* Bullets */}
      {bullets.map((b, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.xs,
            marginBottom: spacing.xs,
          }}
        >
          <AppIcon name={b.icon} size={14} color={b.icon === 'checkmark-circle' ? colors.success : colors.text.secondary} />
          <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: colors.text.secondary }}>
            {b.text}
          </Text>
        </View>
      ))}

      {/* Built for <Dog> row */}
      <View
        style={{
          marginTop: spacing.sm,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: `${colors.brand.primary}18`,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        }}
      >
        <AppIcon name="paw" size={13} color={colors.brand.primary} />
        <Text style={{ fontSize: 12, color: colors.text.secondary, flex: 1 }}>
          <Text style={{ fontWeight: '700', color: colors.text.primary }}>Built for {dogName}</Text>
          {profileCaption ? `  ·  ${profileCaption}` : ''}
        </Text>
      </View>
    </Animated.View>
  );
}
