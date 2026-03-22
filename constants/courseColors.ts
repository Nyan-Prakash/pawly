/**
 * Stable, app-layer-only course theming.
 *
 * We intentionally do not persist these colors. Instead we deterministically
 * assign a course color from a fixed palette using existing stable identifiers
 * such as plan.id. This keeps course theming consistent across reloads without
 * any schema changes or migrations.
 */

export const COURSE_COLOR_PALETTE = [
  '#2563EB', // Blue
  '#0F766E', // Teal
  '#7C3AED', // Violet
  '#DC2626', // Red
  '#CA8A04', // Amber
  '#0891B2', // Cyan
  '#C2410C', // Orange
  '#BE185D', // Rose
  '#4F46E5', // Indigo
  '#15803D', // Green
] as const;

export const GOAL_COLORS = {
  leash_pulling: COURSE_COLOR_PALETTE[8],
  jumping_up: COURSE_COLOR_PALETTE[5],
  barking: COURSE_COLOR_PALETTE[7],
  recall: COURSE_COLOR_PALETTE[9],
  potty_training: COURSE_COLOR_PALETTE[4],
  crate_anxiety: COURSE_COLOR_PALETTE[2],
  puppy_biting: COURSE_COLOR_PALETTE[6],
  settling: COURSE_COLOR_PALETTE[1],
  fallback: '#6B7280',
} as const;

export type GoalColorKey = keyof typeof GOAL_COLORS;
export type CourseColorValue = (typeof COURSE_COLOR_PALETTE)[number];

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

export function isValidHexColor(value: string | null | undefined): value is `#${string}` {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
}

/**
 * Simple hex to RGBA helper to create soft tints.
 * Avoids heavy color libraries.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const safeHex = isValidHexColor(hex) ? hex : GOAL_COLORS.fallback;
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  const r = parseInt(safeHex.slice(1, 3), 16);
  const g = parseInt(safeHex.slice(3, 5), 16);
  const b = parseInt(safeHex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

export interface CourseUiColors {
  solid: string;
  tint: string;
  soft: string;
  border: string;
  text: string;
  contrastText: '#FFFFFF' | '#0F172A';
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

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getCourseColorSeed(source: CourseColorSource | string): string {
  if (typeof source === 'string') {
    return normalizeGoalKey(source);
  }

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

export function getCourseColor(source: CourseColorSource | string): string {
  const seed = getCourseColorSeed(source);
  const color = COURSE_COLOR_PALETTE[hashString(seed) % COURSE_COLOR_PALETTE.length];
  return isValidHexColor(color) ? color : GOAL_COLORS.fallback;
}

export function getContrastTextColor(hex: string): '#FFFFFF' | '#0F172A' {
  const safeHex = isValidHexColor(hex) ? hex : GOAL_COLORS.fallback;

  function toLinear(channel: number): number {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }

  function getRelativeLuminance(color: string): number {
    const r = toLinear(parseInt(color.slice(1, 3), 16));
    const g = toLinear(parseInt(color.slice(3, 5), 16));
    const b = toLinear(parseInt(color.slice(5, 7), 16));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const luminance = getRelativeLuminance(safeHex);
  const whiteContrast = (1.05) / (luminance + 0.05);
  const darkContrast = (luminance + 0.05) / 0.05;

  return '#FFFFFF';
}

/**
 * Derived color set for UI components (cards, pills, etc).
 */
export function getCourseUiColors(source: CourseColorSource | string): CourseUiColors {
  const solid = getCourseColor(source);
  return {
    solid,
    tint: hexToRgba(solid, 0.08),
    soft: hexToRgba(solid, 0.14),
    border: hexToRgba(solid, 0.2),
    text: solid,
    contrastText: getContrastTextColor(solid),
    selectedSurface: hexToRgba(solid, 0.16),
    selectedBorder: hexToRgba(solid, 0.34),
    mutedDot: hexToRgba(solid, 0.9),
  };
}

export function getCoursePillColors(
  source: CourseColorSource | string,
  isSelected: boolean
): CoursePillColors {
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
    backgroundColor: '#F5F7F9',
    borderColor: theme.border,
    textColor: '#111827',
    dotColor: theme.mutedDot,
  };
}

export function resolveSelectedCourseTheme<TPlan extends CourseThemePlanLike>(
  plansById: Record<string, TPlan>,
  activePlanIds: string[],
  selectedPlanId: string | null
): CourseUiColors | null {
  const resolvedId =
    selectedPlanId ??
    activePlanIds.find((id) => plansById[id]?.isPrimary) ??
    activePlanIds[0] ??
    null;

  return resolvedId ? getCourseUiColors(plansById[resolvedId] ?? { id: resolvedId }) : null;
}
