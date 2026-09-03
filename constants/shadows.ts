import { Platform } from 'react-native';

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
  }),
  modal: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
  }),
  float: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 16,
    },
    android: { elevation: 6 },
  }),
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Tinted shadows
//
// Pure black shadows on the warm #F7F2EC app background read as dirty gray.
// These tint the shadow toward the surface hue instead, so depth reads as
// "lifted off the paper" rather than "smudged". Prefer these on the app bg.
// ─────────────────────────────────────────────────────────────────────────────

/** Soft shadow tinted to an arbitrary hue — use for colored/branded surfaces. */
export function tintedShadow(
  hex: string,
  level: 'card' | 'float' | 'lifted' = 'card',
) {
  const spec = {
    card:   { height: 2, opacity: 0.10, radius: 10, elevation: 3 },
    float:  { height: 6, opacity: 0.16, radius: 18, elevation: 6 },
    lifted: { height: 10, opacity: 0.22, radius: 24, elevation: 10 },
  }[level];

  return Platform.select({
    ios: {
      shadowColor: hex,
      shadowOffset: { width: 0, height: spec.height },
      shadowOpacity: spec.opacity,
      shadowRadius: spec.radius,
    },
    android: { elevation: spec.elevation },
  });
}

/** Neutral card shadow tinted warm-slate to sit correctly on the app bg. */
export const softShadows = {
  card: tintedShadow('#8A7E70', 'card'),
  float: tintedShadow('#8A7E70', 'float'),
} as const;
