import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';

type CardVariant = 'default' | 'elevated';

type CardProps = PropsWithChildren<
  ViewProps & {
    variant?: CardVariant;
  }
>;

export function Card({ children, style, variant = 'default', ...props }: CardProps) {
  const isElevated = variant === 'elevated';

  return (
    <View
      style={[
        {
          backgroundColor: colors.bg.surface,
          borderColor: isElevated ? 'transparent' : colors.border.default,
          borderWidth: isElevated ? 0 : 1,
          borderRadius: radii.lg,
          padding: spacing.lg,
          ...(isElevated ? shadows.modal : shadows.card),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
