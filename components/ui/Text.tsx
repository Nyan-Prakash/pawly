import type { PropsWithChildren } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'micro'
  | 'title'; // backward-compat alias → h2

type TextProps = PropsWithChildren<
  RNTextProps & {
    variant?: TextVariant;
    color?: string;
  }
>;

export function Text({ variant = 'body', color, style, children, ...props }: TextProps) {
  const variantStyles: Record<TextVariant, RNTextProps['style']> = {
    display:    { ...typography.display,    color: colors.text.primary,   lineHeight: 40 },
    h1:         { ...typography.h1,         color: colors.text.primary,   lineHeight: 36 },
    h2:         { ...typography.h2,         color: colors.text.primary,   lineHeight: 30 },
    h3:         { ...typography.h3,         color: colors.text.primary,   lineHeight: 26 },
    body:       { ...typography.body,       color: colors.text.primary,   lineHeight: 24 },
    bodyStrong: { ...typography.bodyStrong, color: colors.text.primary,   lineHeight: 24 },
    caption:    { ...typography.caption,    color: colors.text.secondary, lineHeight: 20 },
    micro:      { ...typography.micro,      color: colors.text.secondary, lineHeight: 18 },
    title:      { ...typography.h2,         color: colors.text.primary,   lineHeight: 30 },
  };

  return (
    <RNText
      style={[variantStyles[variant], color ? { color } : undefined, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
