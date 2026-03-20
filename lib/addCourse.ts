/**
 * lib/addCourse.ts
 *
 * Core logic for the "add another course" flow.
 *
 * Responsibilities:
 *  - Duplicate active-goal detection
 *  - Max-active-courses enforcement (MAX_ACTIVE_COURSES = 2)
 *  - Plan insertion for an existing dog (without touching existing plans)
 *  - Primary-plan assignment when the new course is promoted
 *
 * Pure utilities (normalizeGoalKey, buildCourseTitle, MAX_ACTIVE_COURSES) live
 * in addCourseUtils.ts so tests can import them without @/ alias resolution.
 */

import { supabase } from '@/lib/supabase';
import { generatePlan } from '@/lib/planGenerator';
import { generateAdaptivePlanWithOptions } from '@/lib/adaptivePlanning/initialPlanner';
import { isAdaptivePlanningEnabled } from '@/lib/adaptivePlanning/featureFlags';
import {
  MAX_ACTIVE_COURSES,
  normalizeGoalKey,
  buildCourseTitle,
} from '@/lib/addCourseUtils';
import type { Dog, Plan } from '@/types';

// Re-export so callers can import everything from one place.
export { MAX_ACTIVE_COURSES, normalizeGoalKey, buildCourseTitle };

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export type AddCourseResult =
  | { ok: true; plan: Plan; madeNewPlanPrimary: boolean }
  | { ok: false; reason: 'duplicate_goal' | 'limit_reached' | 'generation_failed'; message: string };

export interface AddCourseOptions {
  /** The dog who will be enrolled in the new course. */
  dog: Dog;
  /** The goal/behavior for the new course (e.g. "recall", "barking"). */
  goal: string;
  /**
   * When true, the new plan will become the primary plan for this dog and
   * all other active plans will have is_primary set to false.
   * Defaults to false — new courses are secondary by default.
   */
  makePrimary?: boolean;
  /** Supabase access token for Edge Function auth (optional). */
  accessToken?: string | null;
  /**
   * When true, skips the MAX_ACTIVE_COURSES limit check.
   * Used during onboarding when secondary goals are created alongside the primary plan.
   */
  skipLimitCheck?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a new course for an existing dog.
 *
 * Guard rails (in order):
 * 1. Reject exact-duplicate active goals (same normalised goal key).
 * 2. Reject if the dog already has MAX_ACTIVE_COURSES active plans.
 * 3. Generate the plan (adaptive or rules-based).
 * 4. Insert into DB with is_primary=false (or true if makePrimary requested,
 *    which also clears the flag on all other active plans for the dog).
 */
export async function addCourse(options: AddCourseOptions): Promise<AddCourseResult> {
  const { dog, goal, makePrimary = false, accessToken, skipLimitCheck = false } = options;

  // ── 1. Fetch current active plans ────────────────────────────────────────
  const { data: activePlanRows, error: fetchError } = await supabase
    .from('plans')
    .select('id, goal, is_primary, course_title')
    .eq('dog_id', dog.id)
    .eq('status', 'active');

  if (fetchError) {
    return {
      ok: false,
      reason: 'generation_failed',
      message: `Failed to fetch existing plans: ${fetchError.message}`,
    };
  }

  const existingPlans = activePlanRows ?? [];

  // ── 2. Duplicate detection ────────────────────────────────────────────────
  const incomingGoalKey = normalizeGoalKey(goal);
  const isDuplicate = existingPlans.some(
    (p) => normalizeGoalKey(p.goal) === incomingGoalKey
  );

  if (isDuplicate) {
    return {
      ok: false,
      reason: 'duplicate_goal',
      message: `${dog.name} already has an active course for "${goal}". You can't add a duplicate active goal.`,
    };
  }

  // ── 3. Max-course limit ───────────────────────────────────────────────────
  if (!skipLimitCheck && existingPlans.length >= MAX_ACTIVE_COURSES) {
    return {
      ok: false,
      reason: 'limit_reached',
      message: `${dog.name} already has ${MAX_ACTIVE_COURSES} active courses — the maximum allowed. Complete or remove one before adding another.`,
    };
  }

  // ── 4. Generate the new plan ──────────────────────────────────────────────
  // Build a temporary dog object whose primary goal is the requested one so
  // the generators (both adaptive and rules-based) produce the right content.
  const dogForGoal: Dog = {
    ...dog,
    behaviorGoals: [goal, ...dog.behaviorGoals.filter((g) => g !== goal)],
  };

  let generatedPlan: Plan;

  if (isAdaptivePlanningEnabled()) {
    try {
      const result = await generateAdaptivePlanWithOptions(dogForGoal, { accessToken });
      generatedPlan = result.plan;
    } catch (err) {
      console.warn('[addCourse] Adaptive planner failed, falling back to rules:', err);
      generatedPlan = generatePlan(dogForGoal);
    }
  } else {
    generatedPlan = generatePlan(dogForGoal);
  }

  // ── 5. If making primary, clear the flag on all existing active plans ─────
  if (makePrimary && existingPlans.length > 0) {
    const { error: clearError } = await supabase
      .from('plans')
      .update({ is_primary: false })
      .eq('dog_id', dog.id)
      .eq('status', 'active')
      .eq('is_primary', true);

    if (clearError) {
      return {
        ok: false,
        reason: 'generation_failed',
        message: `Failed to update existing primary plan: ${clearError.message}`,
      };
    }
  }

  // ── 6. Insert the new plan ────────────────────────────────────────────────
  // If the Edge Function already inserted the plan (adaptive path), we use the
  // returned plan.id and only need to patch is_primary + course_title.
  // If the plan.id is empty (rules-based path), we do a fresh INSERT.

  const shouldBePrimary = makePrimary || existingPlans.length === 0;
  const courseTitle = buildCourseTitle(goal);
  let finalPlan: Plan;

  if (generatedPlan.id) {
    // Adaptive path: plan already in DB — update multi-course fields
    const { error: patchError } = await supabase
      .from('plans')
      .update({
        is_primary: shouldBePrimary,
        course_title: courseTitle,
        priority: shouldBePrimary ? 1 : 0,
      })
      .eq('id', generatedPlan.id);

    if (patchError) {
      return {
        ok: false,
        reason: 'generation_failed',
        message: `Failed to patch plan metadata: ${patchError.message}`,
      };
    }

    finalPlan = {
      ...generatedPlan,
      isPrimary: shouldBePrimary,
      courseTitle,
      priority: shouldBePrimary ? 1 : 0,
    };
  } else {
    // Rules-based path: insert the plan
    const { data: planData, error: insertError } = await supabase
      .from('plans')
      .insert({
        dog_id: dog.id,
        goal: generatedPlan.goal,
        status: generatedPlan.status,
        duration_weeks: generatedPlan.durationWeeks,
        sessions_per_week: generatedPlan.sessionsPerWeek,
        current_week: generatedPlan.currentWeek,
        current_stage: generatedPlan.currentStage,
        sessions: generatedPlan.sessions,
        metadata: generatedPlan.metadata ?? {},
        is_primary: shouldBePrimary,
        course_title: courseTitle,
        priority: shouldBePrimary ? 1 : 0,
      })
      .select('id')
      .single();

    if (insertError || !planData) {
      return {
        ok: false,
        reason: 'generation_failed',
        message: `Failed to save plan: ${insertError?.message ?? 'unknown error'}`,
      };
    }

    finalPlan = {
      ...generatedPlan,
      id: planData.id as string,
      isPrimary: shouldBePrimary,
      courseTitle,
      priority: shouldBePrimary ? 1 : 0,
    };
  }

  return { ok: true, plan: finalPlan, madeNewPlanPrimary: finalPlan.isPrimary };
}

/**
 * Set is_primary=true for one plan and false for all other active plans
 * for the same dog. Safe to call after the fact (e.g. post-create toggle).
 *
 * Returns an error string on failure, or null on success.
 */
export async function setPrimaryPlanInDB(
  dogId: string,
  planId: string
): Promise<string | null> {
  // Clear existing primaries first
  const { error: clearError } = await supabase
    .from('plans')
    .update({ is_primary: false })
    .eq('dog_id', dogId)
    .eq('status', 'active')
    .neq('id', planId);

  if (clearError) return clearError.message;

  const { error: setError } = await supabase
    .from('plans')
    .update({ is_primary: true })
    .eq('id', planId);

  return setError?.message ?? null;
}
