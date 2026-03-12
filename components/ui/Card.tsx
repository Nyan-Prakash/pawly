import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type CardProps = PropsWithChildren<ViewProps>;

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View
      className="rounded-2xl"
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          padding: spacing.lg,
          shadowColor: colors.textPrimary,
          shadowOffset: { width: 0, height: spacing.xs },
          shadowOpacity: 0.08,
          shadowRadius: spacing.sm,
          elevation: 3
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
