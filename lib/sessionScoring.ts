/**
 * Pure scoring + policy helpers for the training session flow.
 *
 * Kept free of React Native imports so they can be unit-tested with
 * `node --test --experimental-strip-types`.
 *
 * Why this exists: the session used to derive three different numbers from a
 * single "easy / okay / hard" tap, and the numbers disagreed with each other.
 * Everything that turns what happened in a session into a score now goes
 * through this file, so the plan store, the session log, and the learning
 * engine all see the same value.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** What happened on an individual protocol step. */
export type StepOutcome = 'success' | 'struggled' | 'skipped';

/**
 * How the session measured against the protocol's own success criterion.
 * This replaces the old effort rating as the primary signal.
 */
export type SessionOutcome = 'met' | 'partial' | 'not_met';

export type SessionDifficulty = 'easy' | 'okay' | 'hard';

export interface StepResultLike {
  outcome?: StepOutcome;
  completed?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Outcome → score mappings (single source of truth)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1–5 success score written to `session_logs.success_score` and used by the
 * learning engine. Abandoned sessions are always 1.
 *
 *   met      → 5, or 4 when the handler marked one or more steps as a struggle
 *   partial  → 3
 *   not_met  → 2
 */
export function outcomeToSuccessScore(
  outcome: SessionOutcome,
  stepResults: StepResultLike[] = [],
): 1 | 2 | 3 | 4 | 5 {
  const struggled = stepResults.some((s) => s.outcome === 'struggled' || s.outcome === 'skipped');
  switch (outcome) {
    case 'met':
      return struggled ? 4 : 5;
    case 'partial':
      return 3;
    case 'not_met':
      return 2;
  }
}

export const ABANDONED_SUCCESS_SCORE = 1 as const;

/**
 * `session_logs.difficulty` has a NOT NULL CHECK constraint on easy/okay/hard,
 * and older analytics read it. Derive it from the outcome so it stays
 * consistent with `success_score` instead of being a separate opinion.
 */
export function outcomeToDifficulty(outcome: SessionOutcome): SessionDifficulty {
  switch (outcome) {
    case 'met':
      return 'easy';
    case 'partial':
      return 'okay';
    case 'not_met':
      return 'hard';
  }
}

/**
 * Rating stored on the plan's SessionScore. Identical to the success score so
 * the plan and the log never disagree.
 */
export function outcomeToPlanRating(
  outcome: SessionOutcome,
  stepResults: StepResultLike[] = [],
): 1 | 2 | 3 | 4 | 5 {
  return outcomeToSuccessScore(outcome, stepResults);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface StepLike {
  durationSeconds: number | null;
  reps: number | null;
}

/**
 * A "setup" step is one with no timer and no rep target — e.g. "Stand still
 * with the leash slack". These get a plain "Next" instead of an outcome
 * choice and skip the celebration interstitial.
 */
export function isSetupStep(step: StepLike): boolean {
  return !step.durationSeconds && !step.reps;
}

export function summarizeStepOutcomes(stepResults: StepResultLike[]): {
  success: number;
  struggled: number;
  skipped: number;
  total: number;
} {
  let success = 0;
  let struggled = 0;
  let skipped = 0;
  for (const r of stepResults) {
    if (r.outcome === 'struggled') struggled += 1;
    else if (r.outcome === 'skipped') skipped += 1;
    else success += 1;
  }
  return { success, struggled, skipped, total: stepResults.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// Abandon policy
// ─────────────────────────────────────────────────────────────────────────────

/** Minimum time on a step before a bail-out counts as a real attempt. */
export const ABANDON_MIN_TRAINING_SECONDS = 45;

/**
 * Leaving from the intro screen is not a failed session — nothing happened.
 * Only record an abandoned log when the handler actually trained: at least
 * one step recorded, or a meaningful amount of time spent on the first step.
 */
export function shouldLogAbandonedSession(params: {
  state: string;
  stepResultCount: number;
  secondsTraining: number | null;
}): boolean {
  const { state, stepResultCount, secondsTraining } = params;
  if (state === 'INTRO' || state === 'LOADING' || state === 'COMPLETE') return false;
  if (stepResultCount > 0) return true;
  return (secondsTraining ?? 0) >= ABANDON_MIN_TRAINING_SECONDS;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dates / streaks
// ─────────────────────────────────────────────────────────────────────────────

/** YYYY-MM-DD in the device's local timezone (never UTC). */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBefore(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() - days);
  return copy;
}

export interface StreakRow {
  current_streak: number;
  longest_streak: number | null;
  last_session_date: string | null;
}

/**
 * Pure streak transition. Returns `null` when nothing should be written
 * (already trained today).
 */
export function computeStreakUpdate(
  existing: StreakRow,
  today: Date = new Date(),
): { current_streak: number; longest_streak: number; last_session_date: string } | null {
  const todayKey = localDateKey(today);
  const yesterdayKey = localDateKey(daysBefore(today, 1));
  if (existing.last_session_date === todayKey) return null;

  const next = existing.last_session_date === yesterdayKey ? existing.current_streak + 1 : 1;
  return {
    current_streak: next,
    longest_streak: Math.max(next, existing.longest_streak ?? 0),
    last_session_date: todayKey,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  if (m === 0) return `${s} sec`;
  return s > 0 ? `${m} min ${s} sec` : `${m} min`;
}

export function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
