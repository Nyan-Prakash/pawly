/**
 * reflectionNormalizer.ts
 *
 * Shared normalization helper for PostSessionReflection.
 *
 * Used by:
 *   - the app-side signal extraction pipeline
 *   - supabase/functions/adapt-plan/index.ts (edge function)
 *
 * Guarantees:
 *   - malformed / unknown enum values normalize to null
 *   - missing reflection stays null
 *   - never throws
 *
 * Keep this file free of React-Native and Deno-specific imports so it can be
 * imported in both environments.
 */

import type {
  PostSessionReflection,
  ReflectionArousalLevel,
  ReflectionCueUnderstanding,
  ReflectionDistractionType,
  ReflectionExpectationGap,
  ReflectionFailureTiming,
  ReflectionHandlerIssue,
  ReflectionMainIssue,
} from '../../types/index.ts';

// ─── Valid enum sets ──────────────────────────────────────────────────────────

const VALID_OVERALL_EXPECTATION = new Set<string>([
  'better_than_expected',
  'as_expected',
  'worse_than_expected',
]);

const VALID_MAIN_ISSUE = new Set<string>([
  'did_not_understand',
  'broke_position',
  'distracted',
  'over_excited',
  'tired_done',
  'handler_inconsistent',
  'no_major_issue',
]);

const VALID_FAILURE_TIMING = new Set<string>([
  'immediately',
  'midway',
  'near_end',
  'never_stabilized',
]);

const VALID_DISTRACTION_TYPE = new Set<string>([
  'dogs',
  'people',
  'smells',
  'noise_movement',
  'other',
]);

const VALID_CUE_UNDERSTANDING = new Set<string>(['yes', 'not_yet', 'unsure']);

const VALID_AROUSAL_LEVEL = new Set<string>(['calm', 'slightly_up', 'very_up']);

const VALID_HANDLER_ISSUE = new Set<string>([
  'timing_rewards',
  'cue_consistency',
  'leash_setup',
  'session_focus',
  'other',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickEnum<T>(value: unknown, valid: Set<string>): T | null {
  if (typeof value === 'string' && valid.has(value)) return value as T;
  return null;
}

function pickConfidence(value: unknown): 1 | 2 | 3 | 4 | 5 | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5) {
    return value as 1 | 2 | 3 | 4 | 5;
  }
  return null;
}

function pickString(value: unknown): string | null {
  if (typeof value === 'string') return value.trim().slice(0, 2000) || null;
  return null;
}

// ─── Main normalizer ──────────────────────────────────────────────────────────

/**
 * Normalizes raw reflection JSON into a well-typed PostSessionReflection.
 *
 * Accepts anything (unknown / null / undefined) so the edge function can pass
 * the raw database JSONB column directly without crashing.
 *
 * Returns null when the input is null / undefined / empty object.
 * Returns a partial reflection (with unknown enums as null) otherwise.
 */
export function normalizePostSessionReflection(
  raw: unknown,
): PostSessionReflection | null {
  if (raw == null) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;

  const r = raw as Record<string, unknown>;

  // Guard: if none of the known fields are present it's probably not a
  // reflection at all — return null rather than a fully-null reflection object
  // that would contribute misleadingly to reflection evidence.
  const hasAnyField =
    r['overallExpectation'] != null ||
    r['mainIssue'] != null ||
    r['failureTiming'] != null ||
    r['distractionType'] != null ||
    r['cueUnderstanding'] != null ||
    r['arousalLevel'] != null ||
    r['handlerIssue'] != null ||
    r['confidenceInAnswers'] != null ||
    r['freeformNote'] != null;

  if (!hasAnyField) return null;

  return {
    overallExpectation: pickEnum<ReflectionExpectationGap>(
      r['overallExpectation'],
      VALID_OVERALL_EXPECTATION,
    ),
    mainIssue: pickEnum<ReflectionMainIssue>(r['mainIssue'], VALID_MAIN_ISSUE),
    failureTiming: pickEnum<ReflectionFailureTiming>(
      r['failureTiming'],
      VALID_FAILURE_TIMING,
    ),
    distractionType: pickEnum<ReflectionDistractionType>(
      r['distractionType'],
      VALID_DISTRACTION_TYPE,
    ),
    cueUnderstanding: pickEnum<ReflectionCueUnderstanding>(
      r['cueUnderstanding'],
      VALID_CUE_UNDERSTANDING,
    ),
    arousalLevel: pickEnum<ReflectionArousalLevel>(
      r['arousalLevel'],
      VALID_AROUSAL_LEVEL,
    ),
    handlerIssue: pickEnum<ReflectionHandlerIssue>(
      r['handlerIssue'],
      VALID_HANDLER_ISSUE,
    ),
    confidenceInAnswers: pickConfidence(r['confidenceInAnswers']),
    freeformNote: pickString(r['freeformNote']),
  };
}
