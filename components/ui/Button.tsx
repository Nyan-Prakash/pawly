import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'reward';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: AppIconName;
  rightIcon?: AppIconName;
  style?: StyleProp<ViewStyle>;
};

const sizeStyles: Record<ButtonSize, { height: number; borderRadius: number; paddingHorizontal: number }> = {
  lg: { height: 56, borderRadius: radii.pill, paddingHorizontal: spacing.lg },
  md: { height: 44, borderRadius: radii.pill, paddingHorizontal: spacing.md },
  sm: { height: 36, borderRadius: 20,         paddingHorizontal: spacing.sm + 4 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const ss = sizeStyles[size];
  const scale = useRef(new Animated.Value(1)).current;
  const variantStyles: Record<
    ButtonVariant,
    { backgroundColor: string; borderColor: string; textColor: string; borderWidth: number }
  > = {
    primary: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
      textColor: '#FFFFFF',
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: colors.bg.surface,
      borderColor: colors.border.default,
      textColor: colors.text.primary,
      borderWidth: 1.5,
    },
    outline: {
      backgroundColor: colors.bg.surface,
      borderColor: colors.border.default,
      textColor: colors.text.primary,
      borderWidth: 1.5,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: colors.brand.primary,
      borderWidth: 0,
    },
    reward: {
      backgroundColor: colors.brand.secondary,
      borderColor: colors.brand.secondary,
      textColor: '#FFFFFF',
      borderWidth: 0,
    },
  };
  const vs = variantStyles[variant];

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.97,
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

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[
          {
            height: ss.height,
            borderRadius: ss.borderRadius,
            paddingHorizontal: ss.paddingHorizontal,
            backgroundColor: vs.backgroundColor,
            borderColor: vs.borderColor,
            borderWidth: vs.borderWidth,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDisabled ? 0.5 : 1,
          },
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={vs.textColor} size="small" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {leftIcon ? <AppIcon name={leftIcon} size={size === 'sm' ? 14 : 18} color={vs.textColor} /> : null}
            <Text
              variant={size === 'sm' ? 'caption' : 'bodyStrong'}
              color={vs.textColor}
              style={{ fontWeight: '700' }}
            >
              {label}
            </Text>
            {rightIcon ? <AppIcon name={rightIcon} size={size === 'sm' ? 14 : 18} color={vs.textColor} /> : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
