import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

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
};

export function IconButton({
  icon,
  onPress,
  size = 44,
  variant = 'ghost',
  style,
  hitSlop = 4,
  disabled,
}: IconButtonProps) {
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

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
          ...variantStyle,
        },
        style,
      ]}
    >
      <View>{icon}</View>
    </Pressable>
  );
}
