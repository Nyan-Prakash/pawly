import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

/**
 * 44-pt icon control with an unread dot. The count is announced through the
 * accessibility label rather than drawn.
 */
export function NotificationBell({
  unreadCount,
  onPress,
}: {
  unreadCount: number;
  onPress: () => void;
  /** Kept for call-site compatibility; the control is always 44 pt. */
  size?: number;
}) {
  const hasUnread = unreadCount > 0;
  const label = hasUnread
    ? `Notifications, ${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
    : 'Notifications';

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <AppIcon name={hasUnread ? 'notifications' : 'notifications-outline'} size={22} color={colors.text.primary} />
      {hasUnread ? (
        <View
          style={{
            position: 'absolute',
            top: spacing.sm,
            right: spacing.sm,
            width: spacing.sm,
            height: spacing.sm,
            borderRadius: radii.full,
            backgroundColor: colors.accent,
          }}
        />
      ) : null}
    </Pressable>
  );
}
