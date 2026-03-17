import type {
  AdaptationType,
  DogLearningState,
  Plan,
  PlanAdaptation,
  PlanEnvironment,
  PlanSession,
  SkillNode,
  SupportSessionType,
} from '../../types/index.ts';
import type {
  AggregatedRecentSignals,
  ReflectionEvidence,
  SessionLearningSignal,
  WalkLearningSignal,
} from './learningSignals.ts';
import type { LearningHypothesis } from '../../types/index.ts';

export const MAX_ADAPTATION_WINDOW = 5;
export const DEFAULT_ADAPTATION_WINDOW = 3;

// ─────────────────────────────────────────────────────────────────────────────
// Reflection-aware thresholds
//
// Named constants so they are easy to tune later without hunting through logic.
// ─────────────────────────────────────────────────────────────────────────────

/** Minimum number of sessions with reflection data before reflection rules fire. */
const REFLECTION_MIN_SESSIONS = 2;

/** Pressure level at which a reflection signal is considered meaningfully elevated. */
const REFLECTION_PRESSURE_MODERATE = 0.40;

/** Pressure level at which a reflection signal is considered strong. */
const REFLECTION_PRESSURE_STRONG = 0.65;

/**
 * Handler confidence below this threshold dampens the aggressiveness of any
 * reflection-driven mutation (handler friction rule).
 */
const REFLECTION_LOW_CONFIDENCE_THRESHOLD = 0.45;

/**
 * Average recent success score at or above this level means objective
 * performance is clearly strong — resist reflection-only regression.
 */
const STRONG_OBJECTIVE_SUCCESS_THRESHOLD = 3.8;

/**
 * Maximum number of extra support sessions that may be inserted in a single
 * adaptation event.  Hard cap = 1.
 */
export const MAX_INSERTED_SUPPORT_SESSIONS = 1;

/**
 * A plan is considered dense when the upcoming incomplete session count
 * is already at or above this number.  Insertion is skipped for dense plans.
 */
const DENSE_PLAN_SESSION_THRESHOLD = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Candidate shape
// ─────────────────────────────────────────────────────────────────────────────

export interface AdaptationCandidate {
  type: AdaptationType;
  priority: number;
  reasonCode: string;
  reasonSummary: string;
  targetSkillId?: string | null;
  targetEnvironment?: PlanEnvironment | null;
  sessionCount: number;
  durationDeltaMinutes?: number;
  requiresDateShift?: boolean;
  evidence: Record<string, unknown>;
  /**
   * When set, the compiler should insert one extra support session of this
   * type after the mutated window.  At most one extra session is inserted
   * regardless of how many candidates request it.
   */
  insertSupportSession?: SupportSessionType | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Decision context
// ─────────────────────────────────────────────────────────────────────────────

export interface AdaptationDecisionContext {
  plan: Plan;
  learningState: DogLearningState | null;
  aggregatedSignals: AggregatedRecentSignals;
  recentSessions: SessionLearningSignal[];
  recentWalks: WalkLearningSignal[];
  currentSkill: SkillNode | null;
  upcomingSessions: PlanSession[];
  advanceOptions: SkillNode[];
  regressionOptions: SkillNode[];
  detourOptions: SkillNode[];
  recentAdaptations: PlanAdaptation[];
  now: string;
  /**
   * Current hypotheses derived from the learning state + signals.
   * Provided by adaptationEngine so rules can check hypothesis codes.
   */
  currentHypotheses?: LearningHypothesis[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hoursSince(iso: string, now: string): number {
  return (Date.parse(now) - Date.parse(iso)) / 3600000;
}

function isSameBehaviorWindow(candidate: AdaptationCandidate, recent: PlanAdaptation | undefined): boolean {
  if (!recent) return false;
  return recent.reasonCode === candidate.reasonCode || recent.adaptationType === candidate.type;
}

export function determineLowerEnvironmentTrack(
  currentEnvironment?: PlanEnvironment | null,
): PlanEnvironment | null {
  if (!currentEnvironment) return 'indoors_low_distraction';
  if (currentEnvironment === 'outdoors_high_distraction') return 'outdoors_low_distraction';
  if (currentEnvironment === 'outdoors_moderate_distraction') return 'outdoors_low_distraction';
  if (currentEnvironment === 'outdoors_low_distraction') return 'indoors_low_distraction';
  if (currentEnvironment === 'indoors_moderate_distraction') return 'indoors_low_distraction';
  return 'indoors_low_distraction';
}

/** Returns true if the reflection evidence has enough data and the given pressure clears the threshold. */
function hasReflectionPressure(
  ref: ReflectionEvidence,
  field: keyof Pick<
    ReflectionEvidence,
    | 'understandingPressure'
    | 'distractionPressure'
    | 'durationBreakdownPressure'
    | 'arousalPressure'
    | 'handlerFrictionPressure'
  >,
  threshold: number,
): boolean {
  return ref.sessionsWithReflection >= REFLECTION_MIN_SESSIONS && ref[field] >= threshold;
}

/** True if any hypothesis with the given code is present. */
function hasHypothesis(hypotheses: LearningHypothesis[] | undefined, code: string): boolean {
  return (hypotheses ?? []).some((h) => h.code === code);
}

/** True when objective performance appears clearly strong (resist reflection-only regression). */
function objectivePerformanceStrong(context: AdaptationDecisionContext): boolean {
  const avg = context.aggregatedSignals.summary.avgSessionSuccess;
  return avg !== null && avg >= STRONG_OBJECTIVE_SUCCESS_THRESHOLD;
}

/**
 * True when handler confidence is low enough that we should dampen aggressive
 * plan mutations.
 */
function lowHandlerConfidence(ref: ReflectionEvidence): boolean {
  const conf = ref.avgReflectionConfidence;
  return conf !== null && conf < REFLECTION_LOW_CONFIDENCE_THRESHOLD;
}

// ─────────────────────────────────────────────────────────────────────────────
// Candidate chooser
// ─────────────────────────────────────────────────────────────────────────────

export function chooseAdaptationCandidate(
  context: AdaptationDecisionContext,
): AdaptationCandidate | null {
  const completed = context.recentSessions.filter((session) => session.completed).slice(0, 5);
  const lastThree = completed.slice(0, 3);
  const avgLastThree = average(lastThree.map((session) => session.successScore));
  const allEasy = lastThree.length >= 3 && lastThree.every((session) => session.difficulty === 'easy');
  const consecutiveHard = context.recentSessions
    .slice(0, 2)
    .filter((session) => session.completed && (session.difficulty === 'hard' || session.successScore <= 2))
    .length;
  const outdoorFailures = completed.filter(
    (session) => session.environmentTag.includes('outdoors') && session.successScore <= 2,
  );
  const indoorSuccesses = completed.filter(
    (session) => session.environmentTag.includes('indoors') && session.successScore >= 4,
  );
  const latestApplied = context.recentAdaptations.find((item) => item.status === 'applied');

  const currentEnvironment =
    context.upcomingSessions[0]?.environment ??
    (context.recentSessions[0]?.environmentTag as PlanEnvironment | undefined) ??
    null;

  // reflectionEvidence may be absent in tests or older aggregation paths.
  // Use a safe zero-value default so reflection rules simply don't fire.
  const ref: ReflectionEvidence = context.aggregatedSignals.summary.reflectionEvidence ?? {
    understandingPressure: 0,
    distractionPressure: 0,
    durationBreakdownPressure: 0,
    arousalPressure: 0,
    handlerFrictionPressure: 0,
    sessionsWithReflection: 0,
    avgReflectionConfidence: null,
  };
  const hypotheses = context.currentHypotheses;

  const candidates: AdaptationCandidate[] = [];

  // ──────────────────────────────────────────────────────────────────────────
  // Original rules (priority 100–50) — unchanged logic, unchanged priority
  // ──────────────────────────────────────────────────────────────────────────

  if (outdoorFailures.length >= 2 && indoorSuccesses.length >= 1 && currentEnvironment?.includes('outdoors')) {
    candidates.push({
      type: 'environment_adjustment',
      priority: 100,
      reasonCode: 'outdoor_breakdown',
      reasonSummary: 'Recent results suggest this skill is holding indoors but breaking down outside.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
      sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -2,
      evidence: {
        outdoorFailureCount: outdoorFailures.length,
        indoorSuccessCount: indoorSuccesses.length,
        currentEnvironment,
      },
    });
  }

  if (consecutiveHard >= 2 || avgLastThree <= 2) {
    const detourTarget = context.detourOptions[0] ?? null;
    const regressTarget = context.regressionOptions[0] ?? null;
    const poorConfidence = (context.learningState?.confidenceScore ?? 3) <= 2;
    const highDistraction = (context.learningState?.distractionSensitivity ?? 3) >= 4;

    if ((highDistraction || poorConfidence) && detourTarget?.protocolId) {
      candidates.push({
        type: 'detour',
        priority: 95,
        reasonCode: 'supporting_skill_reset',
        reasonSummary: 'Recent sessions were consistently hard, so the next block shifts to a supporting skill first.',
        targetSkillId: detourTarget.id,
        targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
        sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
        durationDeltaMinutes: -2,
        evidence: {
          consecutiveHard,
          avgLastThree: Number(avgLastThree.toFixed(2)),
          detourSkillId: detourTarget.id,
        },
      });
    } else if (regressTarget?.protocolId) {
      candidates.push({
        type: 'regress',
        priority: 90,
        reasonCode: 'consistency_drop',
        reasonSummary: 'The last few sessions were too difficult, so the next sessions step back to an easier prerequisite.',
        targetSkillId: regressTarget.id,
        targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
        sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
        durationDeltaMinutes: -2,
        evidence: {
          consecutiveHard,
          avgLastThree: Number(avgLastThree.toFixed(2)),
          regressSkillId: regressTarget.id,
        },
      });
    }
  }

  if ((context.learningState?.fatigueRiskScore ?? 3) >= 4) {
    candidates.push({
      type: 'schedule_adjustment',
      priority: 80,
      reasonCode: 'fatigue_risk_high',
      reasonSummary: 'Recent signals suggest fatigue risk is elevated, so the next session is being lightened and spaced out.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
      sessionCount: 1,
      durationDeltaMinutes: -3,
      requiresDateShift: true,
      evidence: {
        fatigueRiskScore: context.learningState?.fatigueRiskScore ?? null,
        recentWalkDelta: context.aggregatedSignals.summary.walkQualityDelta,
      },
    });
  }

  if (
    (context.learningState?.handlerConsistencyScore ?? 3) <= 2 ||
    context.aggregatedSignals.summary.inconsistencyIndex >= 0.45
  ) {
    candidates.push({
      type: 'repeat',
      priority: 70,
      reasonCode: 'handler_consistency_reset',
      reasonSummary: 'The next session will repeat the current foundation to rebuild cleaner timing and consistency.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
      sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -1,
      evidence: {
        handlerConsistencyScore: context.learningState?.handlerConsistencyScore ?? null,
        inconsistencyIndex: Number(context.aggregatedSignals.summary.inconsistencyIndex.toFixed(2)),
      },
    });
  }

  if (
    context.aggregatedSignals.summary.longSessionCount >= 2 &&
    context.aggregatedSignals.summary.motivationDropInLongSessions
  ) {
    candidates.push({
      type: 'difficulty_adjustment',
      priority: 60,
      reasonCode: 'session_load_too_high',
      reasonSummary: 'The next sessions are being shortened slightly to keep motivation up.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: currentEnvironment,
      sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -3,
      evidence: {
        longSessionCount: context.aggregatedSignals.summary.longSessionCount,
        avgSessionDurationMinutes: context.aggregatedSignals.summary.avgSessionDurationMinutes,
      },
    });
  }

  if (
    lastThree.length >= 3 &&
    avgLastThree >= 4 &&
    allEasy &&
    context.advanceOptions[0]?.protocolId
  ) {
    candidates.push({
      type: 'advance',
      priority: 50,
      reasonCode: 'high_consistent_success',
      reasonSummary: 'Recent sessions have been consistently easy and successful, so the next block can advance early.',
      targetSkillId: context.advanceOptions[0].id,
      targetEnvironment: context.upcomingSessions[0]?.environment ?? 'indoors_low_distraction',
      sessionCount: Math.min(2, context.upcomingSessions.length, DEFAULT_ADAPTATION_WINDOW),
      evidence: {
        avgLastThree: Number(avgLastThree.toFixed(2)),
        easySessionCount: lastThree.length,
        advanceSkillId: context.advanceOptions[0].id,
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Reflection-aware rules (priority 45–15)
  //
  // These run only when enough reflection data has accumulated AND the
  // evidence crosses a clear threshold.  They are scored conservatively so
  // they only override objective-data rules in edge cases.
  //
  // All reflection-driven candidates use lower priority than the objective
  // rules above (≤ 45) because objective performance data is more reliable.
  // Exception: when objective performance is mediocre AND a reflection signal
  // is strong, a small priority boost may push the reflection rule above a
  // weaker objective rule.
  // ──────────────────────────────────────────────────────────────────────────

  const upcomingCount = context.upcomingSessions.length;
  const planIsDense = upcomingCount >= DENSE_PLAN_SESSION_THRESHOLD;

  // ── Rule A: Understanding problem ─────────────────────────────────────────
  // Evidence: cue_understanding_gap hypothesis OR understandingPressure strong
  // Behavior: prefer repeat / regress, optionally insert one foundation session
  if (
    !objectivePerformanceStrong(context) &&
    (hasReflectionPressure(ref, 'understandingPressure', REFLECTION_PRESSURE_MODERATE) ||
      hasHypothesis(hypotheses, 'cue_understanding_gap'))
  ) {
    const regressTarget = context.regressionOptions[0] ?? null;
    const strongSignal = hasReflectionPressure(ref, 'understandingPressure', REFLECTION_PRESSURE_STRONG);
    // Only regress when we have a concrete regress target AND strong signal
    const shouldRegress = strongSignal && regressTarget?.protocolId;
    const basePriority = strongSignal ? 45 : 35;

    candidates.push({
      type: shouldRegress ? 'regress' : 'repeat',
      priority: basePriority,
      reasonCode: 'reflection_understanding_gap',
      reasonSummary: shouldRegress
        ? 'Pawly stepped back to an easier foundation because recent logs suggest your dog may not fully understand the cue yet.'
        : 'Pawly added extra repetition at the current level because recent logs suggest your dog may not fully understand the cue yet.',
      targetSkillId: shouldRegress
        ? (regressTarget?.id ?? context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null)
        : (context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null),
      targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
      sessionCount: Math.min(2, upcomingCount, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -2,
      insertSupportSession: !planIsDense ? 'foundation' : null,
      evidence: {
        understandingPressure: Number(ref.understandingPressure.toFixed(3)),
        sessionsWithReflection: ref.sessionsWithReflection,
        avgReflectionConfidence: ref.avgReflectionConfidence,
        hypothesisPresent: hasHypothesis(hypotheses, 'cue_understanding_gap'),
        strongSignal,
      },
    });
  }

  // ── Rule B: Distraction problem ────────────────────────────────────────────
  // Evidence: distraction_recurring_blocker hypothesis OR distractionPressure elevated
  // Behavior: prefer environment adjustment over broad regression
  //           keep skill active if baseline is otherwise okay
  //           insert transition support session when not dense
  if (
    hasReflectionPressure(ref, 'distractionPressure', REFLECTION_PRESSURE_MODERATE) ||
    hasHypothesis(hypotheses, 'distraction_recurring_blocker')
  ) {
    const strongSignal = hasReflectionPressure(ref, 'distractionPressure', REFLECTION_PRESSURE_STRONG);
    // Only push this rule when objective success overall is not clearly strong,
    // OR the signal is strong.  Prevents over-reacting when things are fine.
    const distractionIsMainBlocker =
      !objectivePerformanceStrong(context) || strongSignal;

    if (distractionIsMainBlocker) {
      const lowerEnv = determineLowerEnvironmentTrack(currentEnvironment);
      candidates.push({
        type: 'environment_adjustment',
        priority: strongSignal ? 42 : 30,
        reasonCode: 'reflection_distraction_blocker',
        reasonSummary: 'Pawly added a lower-distraction training window because distraction appears to be the main blocker right now.',
        targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
        targetEnvironment: lowerEnv,
        sessionCount: Math.min(2, upcomingCount, DEFAULT_ADAPTATION_WINDOW),
        durationDeltaMinutes: -1,
        insertSupportSession: !planIsDense ? 'transition' : null,
        evidence: {
          distractionPressure: Number(ref.distractionPressure.toFixed(3)),
          sessionsWithReflection: ref.sessionsWithReflection,
          currentEnvironment,
          targetEnvironment: lowerEnv,
          strongSignal,
          hypothesisPresent: hasHypothesis(hypotheses, 'distraction_recurring_blocker'),
        },
      });
    }
  }

  // ── Rule C: Duration breakdown (near-end failure) ─────────────────────────
  // Evidence: duration_breakdown_pattern hypothesis OR durationBreakdownPressure
  // Behavior: duration tweak only — not cue regression
  //           insert duration_building support session when not dense
  if (
    hasReflectionPressure(ref, 'durationBreakdownPressure', REFLECTION_PRESSURE_MODERATE) ||
    hasHypothesis(hypotheses, 'duration_breakdown_pattern')
  ) {
    candidates.push({
      type: 'difficulty_adjustment',
      priority: 38,
      reasonCode: 'reflection_duration_breakdown',
      reasonSummary: 'Pawly lowered the challenge because breakdowns are happening near the end — same skill, just a shorter target duration.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: currentEnvironment,
      sessionCount: Math.min(2, upcomingCount, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -3,
      insertSupportSession: !planIsDense ? 'duration_building' : null,
      evidence: {
        durationBreakdownPressure: Number(ref.durationBreakdownPressure.toFixed(3)),
        sessionsWithReflection: ref.sessionsWithReflection,
        hypothesisPresent: hasHypothesis(hypotheses, 'duration_breakdown_pattern'),
      },
    });
  }

  // ── Rule D: Over-arousal ───────────────────────────────────────────────────
  // Evidence: arousal_pattern hypothesis OR arousalPressure elevated
  // Behavior: shorten/simplify near-term sessions, insert calm_reset support
  if (
    hasReflectionPressure(ref, 'arousalPressure', REFLECTION_PRESSURE_MODERATE) ||
    hasHypothesis(hypotheses, 'arousal_pattern')
  ) {
    candidates.push({
      type: 'difficulty_adjustment',
      priority: 32,
      reasonCode: 'reflection_over_arousal',
      reasonSummary: 'Pawly shortened and simplified upcoming sessions because over-arousal appears to be getting in the way.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: determineLowerEnvironmentTrack(currentEnvironment),
      sessionCount: Math.min(2, upcomingCount, DEFAULT_ADAPTATION_WINDOW),
      durationDeltaMinutes: -4,
      insertSupportSession: !planIsDense ? 'calm_reset' : null,
      evidence: {
        arousalPressure: Number(ref.arousalPressure.toFixed(3)),
        sessionsWithReflection: ref.sessionsWithReflection,
        hypothesisPresent: hasHypothesis(hypotheses, 'arousal_pattern'),
      },
    });
  }

  // ── Rule E: Handler friction ───────────────────────────────────────────────
  // Evidence: handler_friction_pattern hypothesis OR handlerFrictionPressure
  // Behavior: lower confidence / aggressiveness, prefer conservative changes
  //           may yield explanation-only (repeat with minimal delta)
  //
  // This rule fires at lower priority and produces only a very light touch:
  // a repeat at current level with -1 minute and NO support insertion.
  // Its main effect is that it will win over no-change but lose to most
  // objective-data candidates, and it explicitly reduces mutation scope.
  if (
    hasReflectionPressure(ref, 'handlerFrictionPressure', REFLECTION_PRESSURE_MODERATE) ||
    hasHypothesis(hypotheses, 'handler_friction_pattern')
  ) {
    // If handler confidence in reflection is also low, dampen even further.
    const dampened = lowHandlerConfidence(ref);
    candidates.push({
      type: 'repeat',
      priority: dampened ? 15 : 22,
      reasonCode: 'reflection_handler_friction',
      reasonSummary: dampened
        ? 'Pawly kept changes conservative because recent feedback suggests handler consistency may have affected the result — holding off on bigger changes.'
        : 'Pawly repeated the current level conservatively because recent sessions suggest handler-side factors may be contributing to mixed results.',
      targetSkillId: context.currentSkill?.id ?? context.upcomingSessions[0]?.skillId ?? null,
      targetEnvironment: currentEnvironment,
      sessionCount: 1, // only touch one session when handler friction is the driver
      durationDeltaMinutes: -1,
      // Never insert extra sessions for handler friction — wait for cleaner signal
      insertSupportSession: null,
      evidence: {
        handlerFrictionPressure: Number(ref.handlerFrictionPressure.toFixed(3)),
        sessionsWithReflection: ref.sessionsWithReflection,
        avgReflectionConfidence: ref.avgReflectionConfidence,
        dampened,
        hypothesisPresent: hasHypothesis(hypotheses, 'handler_friction_pattern'),
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Selection: highest priority wins, with cooldown check
  // ──────────────────────────────────────────────────────────────────────────

  candidates.sort((a, b) => b.priority - a.priority);
  const selected = candidates[0] ?? null;
  if (!selected) return null;

  if (
    latestApplied &&
    hoursSince(latestApplied.createdAt, context.now) < 8 &&
    isSameBehaviorWindow(selected, latestApplied) &&
    selected.type !== 'regress' &&
    selected.type !== 'detour'
  ) {
    return null;
  }

  return selected;
}
