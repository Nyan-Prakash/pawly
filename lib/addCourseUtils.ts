/**
 * lib/addCourseUtils.ts
 *
 * Pure, dependency-free utilities for the add-another-course flow.
 * Extracted here so tests can import them without any @/ alias resolution.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum number of simultaneously active courses per dog. */
export const MAX_ACTIVE_COURSES = 2;

// ─────────────────────────────────────────────────────────────────────────────
// Goal map — same labels used in onboarding / planGenerator
// ─────────────────────────────────────────────────────────────────────────────

export const GOAL_LABEL_MAP: Record<string, string> = {
  leash_pulling: 'leash_pulling',
  jumping_up: 'jumping_up',
  barking: 'barking',
  recall: 'recall',
  potty_training: 'potty_training',
  crate_anxiety: 'crate_anxiety',
  puppy_biting: 'puppy_biting',
  settling: 'settling',
  'Leash Pulling': 'leash_pulling',
  'Jumping Up': 'jumping_up',
  'Barking': 'barking',
  "Won't Come": 'recall',
  'Potty Training': 'potty_training',
  'Crate Anxiety': 'crate_anxiety',
  'Puppy Biting': 'puppy_biting',
  'Settling': 'settling',
};

const GOAL_TITLES: Record<string, string> = {
  leash_pulling: 'Loose Leash Walking',
  jumping_up: 'Jumping Up',
  barking: 'Calm Barking',
  recall: 'Reliable Recall',
  potty_training: 'Potty Training',
  crate_anxiety: 'Crate Confidence',
  puppy_biting: 'Bite Inhibition',
  settling: 'Calm Settling',
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a goal string to the canonical snake_case key.
 * Returns the key, or the original string lowercased-and-underscored if
 * no explicit mapping exists.
 */
export function normalizeGoalKey(goal: string): string {
  return GOAL_LABEL_MAP[goal] ?? goal.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Build a human-readable course title from a goal string.
 * Used as the plan's courseTitle in multi-course UI.
 */
export function buildCourseTitle(goal: string): string {
  const key = normalizeGoalKey(goal);
  return GOAL_TITLES[key] ?? goal;
}
