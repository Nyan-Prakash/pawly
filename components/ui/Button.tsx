import {
  ActivityIndicator,
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

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'lg' | 'md';

type ButtonProps = Omit<PressableProps, 'style'> & {
  /** Names the exact action: "Start session", "Save walk". Sentence case. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT: Record<ButtonSize, number> = { lg: 50, md: 44 };

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const palette: Record<ButtonVariant, { bg: string; text: string }> = {
    primary: { bg: colors.accent, text: colors.text.onAccent },
    secondary: { bg: colors.bg.fill, text: colors.text.primary },
    ghost: { bg: 'transparent', text: colors.accent },
    destructive: { bg: colors.status.danger, text: colors.text.onDanger },
  };
  const { bg, text } = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: HEIGHT[size],
          minWidth: 44,
          borderRadius: radii.md,
          paddingHorizontal: spacing.xl,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={text} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {icon ? <AppIcon name={icon} size={20} color={text} /> : null}
          <Text variant="bodyStrong" color={text}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
