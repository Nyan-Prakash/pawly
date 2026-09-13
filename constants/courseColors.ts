/**
 * Course theming.
 *
 * Pawly has one accent (see DESIGN.md). Courses are told apart by name and
 * icon, not by hue, so every course resolves to the accent. This module keeps
 * its previous API so stores, mappers and tests keep working; the values it
 * returns are now all derived from the current theme.
 */

import { colors, getThemeColors } from './colors.ts';

export const GOAL_KEYS = [
  'leash_pulling',
  'jumping_up',
  'barking',
  'recall',
  'potty_training',
  'crate_anxiety',
  'puppy_biting',
  'settling',
  'leave_it',
  'basic_obedience',
  'separation_anxiety',
  'door_manners',
  'impulse_control',
  'cooperative_care',
  'wait_and_stay',
  'leash_reactivity',
  'sit',
  'down',
  'heel',
] as const;

export type GoalColorKey = (typeof GOAL_KEYS)[number] | 'fallback';

export interface CourseColorSource {
  id?: string | null;
  planId?: string | null;
  courseId?: string | null;
  goal?: string | null;
  courseTitle?: string | null;
  createdAt?: string | null;
}

export interface CourseThemePlanLike extends CourseColorSource {
  id: string;
  isPrimary?: boolean;
}

export function normalizeGoalKey(goal: string): GoalColorKey {
  const normalized = goal.toLowerCase().replace(/ /g, '_').replace("won't_come", 'recall');
  return (GOAL_KEYS as readonly string[]).includes(normalized) ? (normalized as GoalColorKey) : 'fallback';
}

/** Every goal shares the accent. Kept for persisted-model compatibility. */
export function getGoalColor(_goal: string): string {
  return getThemeColors().accent;
}

export function isValidHexColor(value: string | null | undefined): value is `#${string}` {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function hexToRgba(hex: string, alpha: number): string {
  const safeHex = isValidHexColor(hex) ? hex : getThemeColors().accent;
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  const r = parseInt(safeHex.slice(1, 3), 16);
  const g = parseInt(safeHex.slice(3, 5), 16);
  const b = parseInt(safeHex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

export interface CourseUiColors {
  /** The accent. */
  solid: string;
  /** Soft accent fill for selected surfaces. */
  tint: string;
  soft: string;
  border: string;
  /** Accent used as text. */
  text: string;
  /** Text colour to place on `solid`. */
  contrastText: string;
  selectedSurface: string;
  selectedBorder: string;
  mutedDot: string;
}

export interface CoursePillColors {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
}

export function getCourseColorSeed(source: CourseColorSource | string): string {
  if (typeof source === 'string') return normalizeGoalKey(source);
  return (
    source.id ??
    source.planId ??
    source.courseId ??
    source.goal?.trim() ??
    source.courseTitle?.trim() ??
    source.createdAt ??
    'fallback'
  );
}

export function getCourseColor(_source: CourseColorSource | string): string {
  return getThemeColors().accent;
}

export function getContrastTextColor(_hex: string): string {
  return getThemeColors().text.onAccent;
}

export function getCourseUiColors(_source: CourseColorSource | string): CourseUiColors {
  const theme = getThemeColors();
  return {
    solid: theme.accent,
    tint: theme.accentSoft,
    soft: theme.accentSoft,
    border: theme.border.hairline,
    text: theme.accent,
    contrastText: theme.text.onAccent,
    selectedSurface: theme.accentSoft,
    selectedBorder: theme.accent,
    mutedDot: theme.text.secondary,
  };
}

export function getCoursePillColors(source: CourseColorSource | string, isSelected: boolean): CoursePillColors {
  const theme = getCourseUiColors(source);
  if (isSelected) {
    return {
      backgroundColor: theme.solid,
      borderColor: theme.solid,
      textColor: theme.contrastText,
      dotColor: theme.contrastText,
    };
  }
  return {
    backgroundColor: colors.bg.fill,
    borderColor: colors.bg.fill,
    textColor: colors.text.primary,
    dotColor: theme.mutedDot,
  };
}

export function resolveSelectedCourseTheme<TPlan extends CourseThemePlanLike>(
  plansById: Record<string, TPlan>,
  activePlanIds: string[],
  selectedPlanId: string | null,
): CourseUiColors | null {
  const resolvedId =
    selectedPlanId ??
    activePlanIds.find((id) => plansById[id]?.isPrimary) ??
    activePlanIds[0] ??
    null;
  return resolvedId ? getCourseUiColors(plansById[resolvedId] ?? { id: resolvedId }) : null;
}
