import type { PropsWithChildren } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

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

// Maps fontWeight → correct Plus Jakarta Sans fontFamily.
// On iOS, using fontWeight without fontFamily reverts to SF Pro.
// This ensures every Text renders in Plus Jakarta Sans at the right weight.
const WEIGHT_TO_FAMILY: Record<string, string> = {
  '400': 'Nunito_400Regular',
  '500': 'Nunito_500Medium',
  '600': 'Nunito_600SemiBold',
  '700': 'Nunito_700Bold',
  '800': 'Nunito_800ExtraBold',
  normal: 'Nunito_400Regular',
  bold:   'Nunito_700Bold',
};

function resolveFont(style: TextStyle | undefined): string {
  if (!style) return 'PlusJakartaSans_400Regular';
  // If fontFamily already explicitly set, respect it
  if (style.fontFamily) return style.fontFamily;
  const weight = String(style.fontWeight ?? '400');
  return WEIGHT_TO_FAMILY[weight] ?? 'PlusJakartaSans_400Regular';
}

function flattenStyleWeight(style: RNTextProps['style']): TextStyle {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<TextStyle>((acc, s) => ({ ...acc, ...(s as TextStyle) }), {});
  }
  return style as TextStyle;
}

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

  // Flatten all styles to resolve the effective fontWeight
  const variantStyle = flattenStyleWeight(variantStyles[variant]);
  const overrideStyle = flattenStyleWeight(style);
  const merged = { ...variantStyle, ...(color ? { color } : {}), ...overrideStyle };
  const fontFamily = resolveFont(merged);

  return (
    <RNText
      style={[variantStyles[variant], color ? { color } : undefined, style, { fontFamily }]}
      {...props}
    >
      {children}
    </RNText>
  );
}
