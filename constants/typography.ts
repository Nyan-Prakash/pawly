const regular   = 'Nunito_400Regular';
const medium    = 'Nunito_500Medium';
const semibold  = 'Nunito_600SemiBold';
const bold      = 'Nunito_700Bold';
const extrabold = 'Nunito_800ExtraBold';

export const typography = {
  // ── New named scale ────────────────────────────────────────────────────
  display:    { fontSize: 32, fontFamily: extrabold },
  h1:         { fontSize: 28, fontFamily: extrabold },
  h2:         { fontSize: 22, fontFamily: bold },
  h3:         { fontSize: 18, fontFamily: bold },
  body:       { fontSize: 16, fontFamily: regular },
  bodyStrong: { fontSize: 16, fontFamily: semibold },
  caption:    { fontSize: 14, fontFamily: regular },
  micro:      { fontSize: 12, fontFamily: medium },

  // ── Legacy aliases (kept for backward compat during migration) ─────────
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
