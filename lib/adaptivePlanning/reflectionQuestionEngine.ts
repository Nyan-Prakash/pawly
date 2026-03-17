import {
  OVERALL_EXPECTATION_QUESTION,
  MAIN_ISSUE_QUESTION,
  FAILURE_TIMING_QUESTION,
  DISTRACTION_TYPE_QUESTION,
  CUE_UNDERSTANDING_QUESTION,
  AROUSAL_LEVEL_QUESTION,
  HANDLER_ISSUE_QUESTION,
  CONFIDENCE_IN_ANSWERS_QUESTION,
} from './reflectionQuestionCatalog.ts';
import type {
  ReflectionQuestionConfig,
  ReflectionQuestionEngineInput,
  RecentSessionSummary,
  ReflectionLearningStateSnapshot,
} from './reflectionQuestionTypes.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Helper-text builders — only return a string when grounded context exists.
// Each function returns null when there is no concrete history to cite.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Helper text for failureTiming.
 * Grounds in recent "near_end" pattern if available; otherwise silent.
 */
function failureTimingHelperText(input: ReflectionQuestionEngineInput): string | null {
  const recent = input.recentSessions.slice(0, 3);
  // Count how many recent sessions were hard/abandoned
  const recentHard = recent.filter(
    (s) => s.difficulty === 'hard' || s.status === 'abandoned',
  ).length;

  if (recentHard >= 2) {
    return 'A couple of recent sessions were harder than expected — this helps Pawly see where things are breaking down.';
  }
  if (input.durationSeconds !== null && input.durationSeconds < 120 && isHardOrAbandoned(input)) {
    return 'Things broke down quickly today — this helps us understand whether it was a warm-up issue.';
  }
  // Generic grounding only when hard/abandoned — never show for clean sessions
  if (isHardOrAbandoned(input)) {
    return 'Knowing when things got hard helps Pawly adjust the right part of the session.';
  }
  return null;
}

/**
 * Helper text for distractionType.
 * Grounds in environment history when available.
 */
function distractionTypeHelperText(input: ReflectionQuestionEngineInput): string | null {
  const hardOutdoor = input.recentSessions.filter(
    (s) => s.environmentTag?.includes('outdoors') && s.successScore <= 2,
  ).length;

  if (hardOutdoor >= 2) {
    return 'Recent outdoor sessions have been harder — knowing the distraction type helps pick the right setup next time.';
  }
  if (hasEnvironmentInconsistency(input.recentSessions)) {
    return 'Sessions indoors have been going better than outside — Pawly is trying to understand what the main trigger is.';
  }
  if (input.learningState !== null && input.learningState.distractionSensitivity >= 4) {
    return 'Pawly is checking in on distractions because recent patterns suggest they may be the main blocker.';
  }
  return null;
}

/**
 * Helper text for cueUnderstanding.
 * Grounds in repeated low-success on the same skill.
 */
function cueUnderstandingHelperText(input: ReflectionQuestionEngineInput): string | null {
  if (hasRepeatedLowSuccessOnSkill(input)) {
    return 'A few recent sessions on this skill have been difficult — Pawly is checking whether the cue is fully clear yet.';
  }
  if (failedEarly(input)) {
    return 'Things broke down early today, which can sometimes mean the cue still needs reinforcing.';
  }
  return null;
}

/**
 * Helper text for arousalLevel.
 * Grounds in the recent abandoned/hard pattern.
 */
function arousalLevelHelperText(input: ReflectionQuestionEngineInput): string | null {
  const recentTrouble = input.recentSessions
    .slice(0, 5)
    .filter((s) => s.status === 'abandoned' || s.difficulty === 'hard').length;

  if (recentTrouble >= 3) {
    return 'Several recent sessions have been cut short or rated hard — energy level going in may be playing a role.';
  }
  if (recentTrouble >= 2) {
    return 'A couple of recent sessions were hard — starting energy can make a big difference.';
  }
  return null;
}

/**
 * Helper text for handlerIssue.
 * Grounds in the learning-state inconsistency signal.
 */
function handlerIssueHelperText(
  learningState: ReflectionLearningStateSnapshot | null,
): string | null {
  if (learningState === null) return null;
  if (learningState.handlerConsistencyScore <= 2) {
    return 'Recent patterns suggest handler-side factors may be contributing — this helps Pawly understand what to focus on.';
  }
  if (learningState.inconsistencyIndex !== null && learningState.inconsistencyIndex >= 0.35) {
    return 'Pawly noticed some inconsistency in recent sessions — this helps separate dog-side from handler-side factors.';
  }
  return null;
}

/**
 * Attaches context-grounded helperText to a dynamic follow-up question.
 * Returns the config unchanged when no grounded text is available.
 * Never adds helper text to core questions (overallExpectation, mainIssue).
 */
function withHelperText(
  question: ReflectionQuestionConfig,
  helperText: string | null,
): ReflectionQuestionConfig {
  if (!helperText) return question;
  return { ...question, helperText };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal predicates — each encodes a single inspectable condition
// ─────────────────────────────────────────────────────────────────────────────

/** Session was clearly difficult or cut short. */
function isHardOrAbandoned(input: ReflectionQuestionEngineInput): boolean {
  return input.sessionStatus === 'abandoned' || input.difficulty === 'hard';
}

/**
 * Session outcome looks clean: completed, explicitly easy, and no concerning
 * recent-history signals. Used to decide whether main_issue can be skipped.
 * "okay" sessions are not clean by this definition — we want the question.
 */
function isCleanEasySession(input: ReflectionQuestionEngineInput): boolean {
  if (input.sessionStatus !== 'completed') return false;
  // Only skip mainIssue for sessions the handler explicitly rated 'easy'.
  if (input.difficulty !== 'easy') return false;

  const recent = input.recentSessions.slice(0, 3);
  // If there are any hard or abandoned sessions in the last three, not clean.
  const hasRecentTrouble = recent.some(
    (s) => s.status === 'abandoned' || s.difficulty === 'hard' || s.successScore <= 2,
  );
  return !hasRecentTrouble;
}

// ─── Rule C helpers ───────────────────────────────────────────────────────────

/**
 * Returns true when the recent session window shows inconsistent outcomes
 * across environment contexts — a signal of context-sensitivity / distraction.
 */
function hasEnvironmentInconsistency(recent: RecentSessionSummary[]): boolean {
  if (recent.length < 2) return false;
  const outdoorScores = recent
    .filter((s) => s.environmentTag?.includes('outdoors'))
    .map((s) => s.successScore);
  const indoorScores = recent
    .filter((s) => s.environmentTag?.includes('indoors'))
    .map((s) => s.successScore);
  if (outdoorScores.length === 0 || indoorScores.length === 0) return false;
  const avgOutdoor = outdoorScores.reduce((a, b) => a + b, 0) / outdoorScores.length;
  const avgIndoor  = indoorScores.reduce((a, b) => a + b, 0)  / indoorScores.length;
  return avgIndoor - avgOutdoor >= 1.5;
}

/**
 * Returns true when the learning state suggests elevated distraction
 * sensitivity or the recent history has multiple hard-outdoor sessions.
 */
function hasDistractionSignal(
  input: ReflectionQuestionEngineInput,
  learningState: ReflectionLearningStateSnapshot | null,
): boolean {
  if (learningState !== null && learningState.distractionSensitivity >= 4) return true;
  const hardOutdoor = input.recentSessions.filter(
    (s) => s.environmentTag?.includes('outdoors') && s.successScore <= 2,
  ).length;
  if (hardOutdoor >= 2) return true;
  if (hasEnvironmentInconsistency(input.recentSessions)) return true;
  return false;
}

// ─── Rule D helpers ───────────────────────────────────────────────────────────

/**
 * Returns true when the session appears to have failed very early or
 * never established any rhythm.
 */
function failedEarly(input: ReflectionQuestionEngineInput): boolean {
  // Short duration (under 2 minutes) combined with hard/abandoned is a strong
  // early-failure signal.
  if (
    input.durationSeconds !== null &&
    input.durationSeconds < 120 &&
    isHardOrAbandoned(input)
  ) {
    return true;
  }
  return false;
}

/**
 * Returns true when the recent window shows repeated low-success on the
 * same skill — suggesting a fundamental understanding gap.
 */
function hasRepeatedLowSuccessOnSkill(input: ReflectionQuestionEngineInput): boolean {
  if (!input.skillId && !input.protocolId) return false;
  const sameSkill = input.recentSessions.filter(
    (s) =>
      (input.skillId && s.skillId === input.skillId) ||
      (input.protocolId && s.skillId === input.protocolId),
  );
  if (sameSkill.length < 2) return false;
  const lowSuccess = sameSkill.filter((s) => s.successScore <= 2).length;
  return lowSuccess >= 2;
}

// ─── Rule E helpers ───────────────────────────────────────────────────────────

/**
 * Returns true when the recent history shows a pattern of sessions that
 * started dysregulated or had repeated over-excitement signals.
 *
 * We infer over-excitement from: abandoned very early, or multiple
 * hard+short sessions in a row — common over-threshold pattern.
 */
function hasArousalPattern(input: ReflectionQuestionEngineInput): boolean {
  // Three or more of the last 5 sessions were abandoned or hard
  const recentTrouble = input.recentSessions
    .slice(0, 5)
    .filter((s) => s.status === 'abandoned' || s.difficulty === 'hard').length;
  return recentTrouble >= 3;
}

// ─── Rule F helpers ───────────────────────────────────────────────────────────

/**
 * Returns true when the learning state or recent signals suggest handler
 * consistency issues (high inconsistency index or low handler score).
 */
function hasHandlerInconsistencySignal(
  learningState: ReflectionLearningStateSnapshot | null,
): boolean {
  if (learningState === null) return false;
  if (learningState.handlerConsistencyScore <= 2) return true;
  if (learningState.inconsistencyIndex !== null && learningState.inconsistencyIndex >= 0.35) return true;
  return false;
}

// ─── Rule G helpers ───────────────────────────────────────────────────────────

/**
 * Returns true when the situation is ambiguous enough that the confidence
 * question will meaningfully improve adaptation quality.
 * Conditions: abandoned session, or mixed signals in recent history.
 */
function needsConfidenceQuestion(input: ReflectionQuestionEngineInput): boolean {
  if (input.sessionStatus === 'abandoned') return true;

  // Mixed signals: some recent sessions good, some poor — unclear trend
  const scores = input.recentSessions.slice(0, 4).map((s) => s.successScore);
  if (scores.length < 3) return false;
  const high = scores.filter((s) => s >= 4).length;
  const low  = scores.filter((s) => s <= 2).length;
  return high >= 1 && low >= 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main engine function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deterministically selects the post-session reflection questions to present.
 *
 * Output ordering:
 *   1. overallExpectation  (always)
 *   2. mainIssue           (almost always — skipped only for clean easy sessions)
 *   3. One or two dynamic follow-ups in priority order:
 *        failureTiming → distractionType | cueUnderstanding | arousalLevel | handlerIssue
 *   4. confidenceInAnswers (only when ambiguity warrants it)
 *
 * Total is usually 2–4 questions.
 */
export function buildPostSessionReflectionQuestions(
  input: ReflectionQuestionEngineInput,
): ReflectionQuestionConfig[] {
  const questions: ReflectionQuestionConfig[] = [];
  const ls = input.learningState;

  // ── Core questions ─────────────────────────────────────────────────────────

  // Rule A: overallExpectation is always first.
  questions.push(OVERALL_EXPECTATION_QUESTION);

  // Rule A: mainIssue is asked unless the session was clearly clean and easy.
  const skipMainIssue = isCleanEasySession(input);
  if (!skipMainIssue) {
    questions.push(MAIN_ISSUE_QUESTION);
  }

  // ── Dynamic follow-ups (max 2) ─────────────────────────────────────────────

  const followUps: ReflectionQuestionConfig[] = [];

  // Rule B: failure_timing for hard / abandoned sessions.
  if (isHardOrAbandoned(input)) {
    followUps.push(withHelperText(FAILURE_TIMING_QUESTION, failureTimingHelperText(input)));
  }

  // Rule C: distraction_type when distraction is the likely culprit.
  // Checked before cue_understanding because environment signals are concrete
  // and actionable; distraction context informs the next-session setup directly.
  if (followUps.length < 2 && hasDistractionSignal(input, ls)) {
    followUps.push(withHelperText(DISTRACTION_TYPE_QUESTION, distractionTypeHelperText(input)));
  }

  // Rule D: cue_understanding when failure appears to be comprehension-based.
  // Only added when distraction hasn't already explained the difficulty.
  if (followUps.length < 2 && (failedEarly(input) || hasRepeatedLowSuccessOnSkill(input))) {
    followUps.push(withHelperText(CUE_UNDERSTANDING_QUESTION, cueUnderstandingHelperText(input)));
  }

  // Rule E: arousal_level when over-excitement pattern is present.
  if (followUps.length < 2 && hasArousalPattern(input)) {
    followUps.push(withHelperText(AROUSAL_LEVEL_QUESTION, arousalLevelHelperText(input)));
  }

  // Rule F: handler_issue when handler inconsistency signal is active.
  if (followUps.length < 2 && hasHandlerInconsistencySignal(ls)) {
    followUps.push(withHelperText(HANDLER_ISSUE_QUESTION, handlerIssueHelperText(ls)));
  }

  // Cap follow-ups at 2.
  questions.push(...followUps.slice(0, 2));

  // ── Rule G: confidence last ────────────────────────────────────────────────
  // Hard cap: only add if we are still under 4 questions total.
  if (questions.length < 4 && needsConfidenceQuestion(input)) {
    questions.push(CONFIDENCE_IN_ANSWERS_QUESTION);
  }

  return questions;
}
