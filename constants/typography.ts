export const typography = {
  // ── New named scale ────────────────────────────────────────────────────
  display: { fontSize: 32, fontWeight: '700' as const },
  h1:      { fontSize: 28, fontWeight: '700' as const },
  h2:      { fontSize: 22, fontWeight: '700' as const },
  h3:      { fontSize: 18, fontWeight: '600' as const },
  body:    { fontSize: 16, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
  micro:   { fontSize: 12, fontWeight: '500' as const },

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
