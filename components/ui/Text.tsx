import type { PropsWithChildren } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors } from '@/constants/colors';
import { typography, type TypographyVariant } from '@/constants/typography';

type TextProps = PropsWithChildren<
  RNTextProps & {
    variant?: TypographyVariant;
    /** Defaults to text.primary for headings/body and text.secondary for caption/label. */
    color?: string;
  }
>;

const SECONDARY_VARIANTS: ReadonlySet<TypographyVariant> = new Set(['caption', 'label']);

/**
 * The only way to render text. Picks a variant from the type scale; never
 * accepts fontSize / fontWeight / lineHeight overrides (see DESIGN.md).
 * Heading variants carry the Nunito family; the rest use the system font.
 */
export function Text({ variant = 'body', color, style, children, ...props }: TextProps) {
  const resolvedColor = color ?? (SECONDARY_VARIANTS.has(variant) ? colors.text.secondary : colors.text.primary);

  return (
    <RNText
      style={[typography[variant], { color: resolvedColor, letterSpacing: 0 }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
