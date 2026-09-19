/**
 * Three radii, each with a meaning. See DESIGN.md. Rounder than a utility
 * app on purpose: Pawly is friendly, and its mascot is all curves.
 *   sm   controls: inputs, chips, tags
 *   md   containers: grouped lists, cards, buttons, sheets
 *   full avatars, progress bars, dots
 */
export const radii = {
  sm: 12,
  md: 16,
  full: 999,
} as const;
