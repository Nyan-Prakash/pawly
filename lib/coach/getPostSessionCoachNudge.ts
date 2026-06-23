import type { PostSessionReflection } from '@/types';

export interface CoachNudgeResult {
  shouldShow: boolean;
  reasons: string[];
  summaryLabel: string | null;
}

export interface NudgeInput {
  difficulty: 'easy' | 'okay' | 'hard' | null;
  sessionStatus: 'completed' | 'abandoned';
  postSessionReflection: PostSessionReflection | null;
}

/**
 * Deterministically decides whether a session qualifies for a post-session coach nudge.
 *
 * Qualification Criteria:
 * - difficulty === 'hard'
 * - sessionStatus === 'abandoned'
 * - postSessionReflection.overallExpectation === 'below' (worse_than_expected)
 * - postSessionReflection.mainIssue exists and is not 'no_major_issue'
 */
export function getPostSessionCoachNudge(input: NudgeInput): CoachNudgeResult {
  const { difficulty, sessionStatus, postSessionReflection } = input;
  const reasons: string[] = [];

  if (difficulty === 'hard') {
    reasons.push('difficulty_hard');
  }

  if (sessionStatus === 'abandoned') {
    reasons.push('session_abandoned');
  }

  if (postSessionReflection) {
    if (postSessionReflection.overallExpectation === 'worse_than_expected') {
      reasons.push('below_expectation');
    }

    if (
      postSessionReflection.mainIssue &&
      postSessionReflection.mainIssue !== 'no_major_issue'
    ) {
      reasons.push(`issue_${postSessionReflection.mainIssue}`);
    }
  }

  // Simple guardrail: if it was just "hard" but everything else was okay, we could suppress.
  // But per requirements, ANY of the above qualifies.
  // "To avoid over-triggering, if the session was marked hard but success was still high
  // and no reflection problems were reported, allow a small guardrail to suppress the nudge."

  // If ONLY reason is 'hard' and we have a reflection that says "as_expected" or "better",
  // maybe we suppress? The prompt said "allow a small guardrail".
  // Let's keep it simple: if difficulty is hard and there's a reflection saying it went well, suppress.
  let shouldShow = reasons.length > 0;

  if (
    reasons.length === 1 &&
    reasons[0] === 'difficulty_hard' &&
    postSessionReflection?.overallExpectation === 'better_than_expected'
  ) {
    shouldShow = false;
  }

  return {
    shouldShow,
    reasons,
    summaryLabel: reasons.length > 0 ? reasons[0] : null,
  };
}
