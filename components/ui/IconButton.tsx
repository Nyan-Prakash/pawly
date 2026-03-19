import { useRef } from 'react';
import { Animated, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';

type IconButtonVariant = 'ghost' | 'surface' | 'filled';

type IconButtonProps = {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  variant?: IconButtonVariant;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function IconButton({
  icon,
  onPress,
  size = 44,
  variant = 'ghost',
  style,
  hitSlop = 4,
  disabled,
  accessibilityLabel,
}: IconButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const variantStyle: ViewStyle = {
    ghost: {
      backgroundColor: 'transparent',
    },
    surface: {
      backgroundColor: colors.bg.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border.soft,
    },
    filled: {
      backgroundColor: colors.brand.primary,
    },
  }[variant];

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 2,
    }).start();
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={hitSlop}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={({ pressed }) => [
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
            ...variantStyle,
          },
        ]}
      >
        <View>{icon}</View>
      </Pressable>
    </Animated.View>
  );
}
