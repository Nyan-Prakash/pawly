import React from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radii } from '@/constants/radii';
import { buildPlanPersonalizationLine } from '@/lib/personalization/buildPlanPersonalizationLine';

interface PlanPersonalizationBadgeProps {
  dogName: string;
  primaryGoal?: string;
  trainingExperience?: string;
  variant?: 'preview' | 'sessionCard';
}

export function PlanPersonalizationBadge({
  dogName,
  primaryGoal,
  trainingExperience,
  variant = 'preview',
}: PlanPersonalizationBadgeProps) {
  const text = buildPlanPersonalizationLine(dogName, primaryGoal, trainingExperience);

  const isSessionCard = variant === 'sessionCard';

  const containerStyle: ViewStyle = isSessionCard
    ? {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.22)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radii.pill,
        flexShrink: 1,
      }
    : {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radii.md,
        alignSelf: 'flex-start',
        marginBottom: spacing.md,
      };

  const textStyle: TextStyle = isSessionCard
    ? {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
        marginLeft: 4,
      }
    : {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginLeft: 6,
      };

  const iconSize = isSessionCard ? 12 : 14;
  const iconColor = isSessionCard ? '#fff' : 'rgba(255,255,255,0.9)';

  return (
    <Animated.View entering={FadeInDown.delay(150).duration(350)} style={containerStyle}>
      <AppIcon name="sparkles" size={iconSize} color={iconColor} />
      <Text style={textStyle}>{text}</Text>
    </Animated.View>
  );
}
