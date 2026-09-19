import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { formatNotificationTimestamp } from '@/lib/inAppNotifications';
import type { InAppNotification } from '@/types';

/**
 * A ListRow-style pressable. Unread rows lead with an accent dot and a strong
 * title; read rows use the plain body weight. The row itself is the action:
 * a plan update opens the updated plan on press.
 */
export function NotificationItem({
  item,
  onPress,
}: {
  item: InAppNotification;
  onPress: (item: InAppNotification) => void;
}) {
  const isPlanUpdate = item.type === 'plan_updated';
  const timestamp = formatNotificationTimestamp(item.createdAt);
  const hint = isPlanUpdate ? 'Opens the updated plan' : undefined;

  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.isRead ? '' : 'Unread. '}${item.title}. ${item.body}`}
      accessibilityHint={hint}
      style={({ pressed }) => ({
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.bg.surface,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: spacing.sm,
          height: spacing.sm,
          borderRadius: radii.full,
          marginTop: spacing.sm,
          backgroundColor: item.isRead ? 'transparent' : colors.accent,
        }}
      />

      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant={item.isRead ? 'body' : 'bodyStrong'} numberOfLines={2}>
          {item.title}
        </Text>
        <Text variant="caption" numberOfLines={3}>
          {item.body}
        </Text>
      </View>

      {timestamp ? <Text variant="caption">{timestamp}</Text> : null}
    </Pressable>
  );
}
