import { useRef } from 'react';
import { Pressable, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';

type OptionCardLayout = 'vertical' | 'horizontal';
type OptionCardSize = 'sm' | 'md' | 'lg';

type OptionCardProps = {
  icon?: AppIconName;
  emoji?: string;
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  layout?: OptionCardLayout;
  size?: OptionCardSize;
  badge?: string;
  disabled?: boolean;
  style?: object;
};

const PADDING: Record<OptionCardSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

const MIN_HEIGHT: Record<OptionCardSize, number> = {
  sm: 64,
  md: 76,
  lg: 88,
};

export function OptionCard({
  icon,
  emoji,
  label,
  description,
  selected,
  onPress,
  layout = 'horizontal',
  size = 'md',
  badge,
  disabled = false,
  style,
}: OptionCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 140 });
  };

  const borderColor = selected ? colors.brand.primary : colors.border.default;
  const bgColor = selected ? `${colors.brand.primary}12` : colors.bg.surface;
  const iconColor = selected ? colors.brand.primary : colors.text.secondary;
  const pad = PADDING[size];
  const minH = MIN_HEIGHT[size];

  const shadow =
    Platform.OS === 'ios'
      ? {
          shadowColor: colors.shadow?.soft ?? '#94A3B8',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: selected ? 0 : 0.06,
          shadowRadius: 4,
        }
      : { elevation: selected ? 0 : 2 };

  return (
    <Animated.View style={[animStyle, { flex: 1 }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          {
            borderWidth: selected ? 2 : 1,
            borderColor,
            borderRadius: radii.md,
            backgroundColor: bgColor,
            padding: pad,
            minHeight: minH,
            opacity: disabled ? 0.5 : 1,
          },
          layout === 'vertical'
            ? { alignItems: 'center', justifyContent: 'center', gap: 8 }
            : { flexDirection: 'row', alignItems: 'center', gap: 14 },
          shadow,
        ]}
      >
        {/* Icon or emoji */}
        {(icon || emoji) && (
          <View
            style={
              layout === 'vertical'
                ? {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: selected
                      ? `${colors.brand.primary}20`
                      : colors.bg.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                : undefined
            }
          >
            {emoji ? (
              <Text style={{ fontSize: layout === 'vertical' ? 20 : 22 }}>{emoji}</Text>
            ) : icon ? (
              <AppIcon
                name={icon}
                size={layout === 'vertical' ? 20 : 22}
                color={iconColor}
              />
            ) : null}
          </View>
        )}

        {/* Text content */}
        <View style={layout === 'horizontal' ? { flex: 1 } : { alignItems: 'center' }}>
          <Text
            variant="bodyStrong"
            color={selected ? colors.brand.primary : colors.text.primary}
            style={{ fontWeight: '600', textAlign: layout === 'vertical' ? 'center' : 'left' }}
          >
            {label}
          </Text>
          {description ? (
            <Text
              variant="caption"
              color={colors.text.secondary}
              style={{ marginTop: 2, textAlign: layout === 'vertical' ? 'center' : 'left' }}
            >
              {description}
            </Text>
          ) : null}
        </View>

        {/* Selected checkmark (horizontal layout only) */}
        {layout === 'horizontal' && selected && (
          <AppIcon name="checkmark-circle" size={20} color={colors.brand.primary} />
        )}

        {/* Badge overlay */}
        {badge ? (
          <View
            style={{
              position: 'absolute',
              top: -1,
              right: -1,
              backgroundColor: colors.brand.primary,
              borderRadius: 8,
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderTopRightRadius: radii.md - 1,
              borderBottomLeftRadius: 8,
            }}
          >
            <Text variant="micro" color="#FFFFFF" style={{ fontWeight: '700', fontSize: 10 }}>
              {badge}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
