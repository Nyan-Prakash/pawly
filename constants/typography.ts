/**
 * Pawly type scale. See DESIGN.md.
 *
 * Two typefaces with assigned roles:
 *   Nunito ExtraBold  the voice: display, h1, h2, and button labels (`action`)
 *   System font       everything readable: body, captions, labels
 * Letter-spacing always 0. Screens pick a variant; they never set
 * fontSize / fontWeight / lineHeight directly.
 */

import type { TextStyle } from 'react-native';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'action'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'captionStrong'
  | 'label';

export const HEADING_FONT = 'Nunito_800ExtraBold';

type TypeSpec = Required<Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>> & Pick<TextStyle, 'fontFamily'>;

export const typography: Record<TypographyVariant, TypeSpec> = {
  display:       { fontSize: 32, lineHeight: 38, fontWeight: '800', fontFamily: HEADING_FONT },
  h1:            { fontSize: 24, lineHeight: 30, fontWeight: '800', fontFamily: HEADING_FONT },
  h2:            { fontSize: 20, lineHeight: 26, fontWeight: '800', fontFamily: HEADING_FONT },
  action:        { fontSize: 16, lineHeight: 22, fontWeight: '800', fontFamily: HEADING_FONT },
  body:          { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong:    { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption:       { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  captionStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  label:         { fontSize: 12, lineHeight: 16, fontWeight: '600' },
};
