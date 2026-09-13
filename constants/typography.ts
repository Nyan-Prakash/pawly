/**
 * Pawly type scale. See DESIGN.md.
 *
 * Platform system font (SF Pro / Roboto). Eight variants, three weights,
 * letter-spacing always 0. Screens pick a variant; they never set
 * fontSize / fontWeight / lineHeight directly.
 */

import type { TextStyle } from 'react-native';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'captionStrong'
  | 'label';

type TypeSpec = Required<Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>>;

export const typography: Record<TypographyVariant, TypeSpec> = {
  display:       { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  h1:            { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  h2:            { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body:          { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong:    { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption:       { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  captionStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  label:         { fontSize: 12, lineHeight: 16, fontWeight: '600' },
};
