import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

export function NotificationBell({
  unreadCount,
  onPress,
}: {
  unreadCount: number;
  onPress: () => void;
}) {
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <View style={{ position: 'relative' }}>
      <IconButton
        variant="surface"
        onPress={onPress}
        icon={<AppIcon name="notifications-outline" size={20} color={colors.text.primary} />}
      />
      {unreadCount > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            paddingHorizontal: 5,
            backgroundColor: colors.brand.coach,
            borderWidth: 2,
            borderColor: colors.bg.app,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.text.inverse,
              fontSize: 10,
              fontWeight: '700',
              lineHeight: 12,
            }}
          >
            {badgeLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
