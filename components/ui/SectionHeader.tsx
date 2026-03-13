import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

type SectionHeaderProps = {
  title: string;
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, action, style }: SectionHeaderProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      <Text variant="h3">{title}</Text>
      {action && (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text variant="caption" color={colors.brand.primary} style={{ fontWeight: '600' }}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
