import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Text } from '@/components/ui/Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<ButtonVariant, { backgroundColor: string; borderColor: string; textColor: string }> = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    textColor: colors.surface
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderColor: colors.border,
    textColor: colors.textPrimary
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: colors.primary
  }
};

export function Button({ label, variant = 'primary', style, ...props }: ButtonProps) {
  const styles = variantStyles[variant];

  return (
    <Pressable
      className="items-center justify-center rounded-xl border"
      style={[
        {
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl
        },
        style
      ]}
      {...props}
    >
      <Text color={styles.textColor} variant="body">
        {label}
      </Text>
    </Pressable>
  );
}
