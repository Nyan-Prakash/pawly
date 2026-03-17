import { TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { shadows } from '@/constants/shadows';

export function NotificationBell({
  unreadCount,
  onPress,
  size = 42,
}: {
  unreadCount: number;
  onPress: () => void;
  size?: number;
}) {
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.bg.surface,
          borderWidth: 1,
          borderColor: colors.border.default,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.card,
        }}
      >
        <AppIcon name="notifications-outline" size={21} color={colors.text.primary} />
      </TouchableOpacity>
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
