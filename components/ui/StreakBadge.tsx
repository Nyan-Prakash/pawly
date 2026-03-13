import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { radii } from '@/constants/radii';

type StreakBadgeProps = {
  count: number;
  size?: 'sm' | 'md';
};

export function StreakBadge({ count, size = 'md' }: StreakBadgeProps) {
  if (!count) return null;

  const isSm = size === 'sm';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FEF3C7',
        borderRadius: radii.pill,
        paddingHorizontal: isSm ? 8 : 10,
        paddingVertical: isSm ? 3 : 5,
      }}
    >
      <AppIcon name="flame" size={isSm ? 12 : 15} color="#92400E" />
      <Text
        variant={isSm ? 'micro' : 'caption'}
        color="#92400E"
        style={{ fontWeight: '700' }}
      >
        {count}
      </Text>
    </View>
  );
}
