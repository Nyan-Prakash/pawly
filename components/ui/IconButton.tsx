import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';

type IconButtonProps = {
  icon: AppIconName;
  /** Required: an icon-only control must be announced. */
  accessibilityLabel: string;
  onPress: () => void;
  tone?: 'accent' | 'secondary' | 'primary';
  variant?: 'plain' | 'filled';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** 44×44 icon-only control. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = 'accent',
  variant = 'plain',
  disabled,
  style,
}: IconButtonProps) {
  const color = { accent: colors.accent, secondary: colors.text.secondary, primary: colors.text.primary }[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variant === 'filled' ? colors.bg.fill : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      <AppIcon name={icon} size={22} color={color} />
    </Pressable>
  );
}
