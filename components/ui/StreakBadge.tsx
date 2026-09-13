import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type StreakBadgeProps = {
  count: number;
};

/** "4-day streak": the one small warm flourish, in amber. */
export function StreakBadge({ count }: StreakBadgeProps) {
  if (!count) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <AppIcon name="flame" size={16} color={colors.status.warning} />
      <Text variant="captionStrong" color={colors.status.warning}>
        {count}-day streak
      </Text>
    </View>
  );
}
