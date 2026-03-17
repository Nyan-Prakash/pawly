import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { formatNotificationTimestamp } from '@/lib/inAppNotifications';
import type { InAppNotification } from '@/types';

export function NotificationItem({
  item,
  onPress,
}: {
  item: InAppNotification;
  onPress: (item: InAppNotification) => void;
}) {
  const isPlanUpdate = item.type === 'plan_updated';

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => ({
        backgroundColor: item.isRead ? colors.bg.surface : colors.bg.elevated,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: item.isRead ? colors.border.default : colors.status.infoBorder,
        padding: spacing.md,
        opacity: pressed ? 0.82 : 1,
        gap: spacing.xs,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            {!item.isRead ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.brand.coach,
                  marginTop: 4,
                }}
              />
            ) : null}
            <Text
              variant="bodyStrong"
              style={{
                flex: 1,
                color: colors.text.primary,
                opacity: item.isRead ? 0.86 : 1,
              }}
            >
              {item.title}
            </Text>
          </View>

          <Text variant="caption" style={{ color: colors.text.secondary }}>
            {item.body}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
            <Text variant="micro">{formatNotificationTimestamp(item.createdAt)}</Text>
            {isPlanUpdate ? (
              <Text
                variant="micro"
                color={colors.brand.primary}
                style={{ fontWeight: '700' }}
              >
                View updated plan
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
