import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type SectionHeaderProps = {
  title: string;
  /** Optional text action on the right, e.g. { label: 'See all', onPress }. */
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
};

/** Sentence-case h2 above a ListGroup. Never uppercase, never tracked. */
export function SectionHeader({ title, action, style }: SectionHeaderProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 44,
          marginBottom: spacing.sm,
        },
        style,
      ]}
    >
      <Text variant="h2" accessibilityRole="header">
        {title}
      </Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={8}
          style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Text variant="bodyStrong" color={colors.accent}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
