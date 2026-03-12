import type { PropsWithChildren } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

type TextVariant = 'title' | 'body' | 'caption';

type TextProps = PropsWithChildren<
  RNTextProps & {
    variant?: TextVariant;
    color?: string;
  }
>;

const variantStyles: Record<TextVariant, RNTextProps['style']> = {
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary
  },
  body: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary
  },
  caption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary
  }
};

export function Text({ variant = 'body', color, style, children, ...props }: TextProps) {
  return (
    <RNText className="" style={[variantStyles[variant], color ? { color } : undefined, style]} {...props}>
      {children}
    </RNText>
  );
}
