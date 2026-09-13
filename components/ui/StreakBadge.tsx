import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type StreakBadgeProps = {
  count: number;
};

/** "4-day streak" as quiet metadata. Not a pill, not a flame. */
export function StreakBadge({ count }: StreakBadgeProps) {
  if (!count) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <AppIcon name="calendar-outline" size={16} color={colors.text.secondary} />
      <Text variant="captionStrong" color={colors.text.secondary}>
        {count}-day streak
      </Text>
    </View>
  );
}
