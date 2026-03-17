/**
 * Professional, stable color palette for training goals.
 * Reusable across the app for cards, chips, calendars, and indicators.
 */

export const GOAL_COLORS = {
  leash_pulling: '#4F46E5', // Indigo
  jumping_up: '#0891B2',    // Cyan
  barking: '#E11D48',       // Rose
  recall: '#059669',        // Emerald
  potty_training: '#D97706', // Amber
  crate_anxiety: '#7C3AED', // Violet
  puppy_biting: '#EA580C',  // Orange
  settling: '#0D9488',      // Teal
  fallback: '#6B7280',      // Gray
} as const;

export type GoalColorKey = keyof typeof GOAL_COLORS;

/**
 * Normalizes goal strings to a stable key.
 * Mirrors GOAL_MAP in planGenerator.ts but kept independent.
 */
export function normalizeGoalKey(goal: string): GoalColorKey {
  const normalized = goal.toLowerCase().replace(/ /g, '_').replace("won't_come", 'recall');
  if (normalized in GOAL_COLORS) {
    return normalized as GoalColorKey;
  }
  return 'fallback';
}

/**
 * Returns the primary solid color for a given goal.
 */
export function getGoalColor(goal: string): string {
  const key = normalizeGoalKey(goal);
  return GOAL_COLORS[key];
}

/**
 * Simple hex to RGBA helper to create soft tints.
 * Avoids heavy color libraries.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface CourseUiColors {
  solid: string;
  tint: string;
  border: string;
  text: string;
}

/**
 * Derived color set for UI components (cards, pills, etc).
 */
export function getCourseUiColors(goal: string): CourseUiColors {
  const solid = getGoalColor(goal);
  return {
    solid,
    tint: hexToRgba(solid, 0.08),
    border: hexToRgba(solid, 0.2),
    text: solid,
  };
}
