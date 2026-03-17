import type {
  Plan,
  PlanEnvironment,
  PlanMetadata,
  PlanSession,
  SkillNode,
  SupportSessionType,
  Weekday,
} from '../../types/index.ts';
import {
  DEFAULT_ADAPTATION_WINDOW,
  MAX_ADAPTATION_WINDOW,
  MAX_INSERTED_SUPPORT_SESSIONS,
  type AdaptationCandidate,
} from './adaptationRules.ts';

export interface CompileAdaptationInput {
  plan: Plan;
  candidate: AdaptationCandidate;
  targetSkill: SkillNode | null;
  now: string;
}

export interface CompiledAdaptation {
  nextPlan: Plan;
  touchedSessionIds: string[];
  /** ID of the inserted support session, or null when none was inserted. */
  insertedSupportSessionId: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Support-session definitions
//
// Each type maps to a deterministic title, duration delta, and environment
// preference.  We do NOT invent new protocol families — instead we reuse the
// current skill's protocol and flag the session via insertedByAdaptation.
// ─────────────────────────────────────────────────────────────────────────────

interface SupportSessionSpec {
  title: (baseTitle: string) => string;
  durationDeltaMinutes: number;
  preferLowerEnvironment: boolean;
  sessionKind: PlanSession['sessionKind'];
}

const SUPPORT_SESSION_SPECS: Record<SupportSessionType, SupportSessionSpec> = {
  foundation: {
    title: (base) => `${base} — Foundation Reinforcement`,
    durationDeltaMinutes: -3,
    preferLowerEnvironment: true,
    sessionKind: 'repeat',
  },
  transition: {
    title: (base) => `${base} — Distraction Transition`,
    durationDeltaMinutes: -2,
    preferLowerEnvironment: true,
    sessionKind: 'repeat',
  },
  duration_building: {
    title: (base) => `${base} — Duration Builder`,
    durationDeltaMinutes: -4,
    preferLowerEnvironment: false,
    sessionKind: 'repeat',
  },
  calm_reset: {
    title: (base) => `${base} — Calm Reset`,
    durationDeltaMinutes: -5,
    preferLowerEnvironment: true,
    sessionKind: 'repeat',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function clampDuration(current: number, deltaMinutes = 0) {
  return Math.max(4, current + deltaMinutes);
}

function getWeekdayFromDate(date: Date): Weekday {
  const days: Weekday[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[date.getDay()] ?? 'monday';
}

function chooseTimeForDay(day: Weekday, fallbackTime?: string) {
  const defaults: Record<Weekday, string> = {
    sunday: '10:00',
    monday: '19:00',
    tuesday: '19:00',
    wednesday: '19:00',
    thursday: '19:00',
    friday: '18:00',
    saturday: '10:00',
  };
  return fallbackTime ?? defaults[day] ?? '19:00';
}

function getUpcomingIncompleteSessions(plan: Plan, limit = MAX_ADAPTATION_WINDOW): PlanSession[] {
  return plan.sessions.filter((session) => !session.isCompleted).slice(0, limit);
}

function applySkillMutation(
  session: PlanSession,
  candidate: AdaptationCandidate,
  targetSkill: SkillNode | null,
): PlanSession {
  const protocolId = targetSkill?.protocolId ?? session.exerciseId;
  return {
    ...session,
    title: targetSkill?.title ?? session.title,
    exerciseId: protocolId,
    skillId: targetSkill?.id ?? session.skillId,
    parentSkillId: session.skillId ?? session.parentSkillId ?? null,
    environment: candidate.targetEnvironment ?? session.environment,
    sessionKind:
      candidate.type === 'environment_adjustment' ||
      candidate.type === 'difficulty_adjustment' ||
      candidate.type === 'schedule_adjustment'
        ? 'repeat'
        : candidate.type,
    adaptationSource: 'adaptation_engine',
    reasoningLabel: candidate.reasonSummary,
    durationMinutes: clampDuration(session.durationMinutes, candidate.durationDeltaMinutes),
  };
}

function shiftSessionDate(plan: Plan, session: PlanSession): PlanSession {
  if (!session.scheduledDate) return session;

  const occupied = new Set(
    plan.sessions
      .filter((item) => !item.isCompleted && item.id !== session.id && item.scheduledDate)
      .map((item) => item.scheduledDate!),
  );

  let candidateDate = new Date(`${session.scheduledDate}T12:00:00`);
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    candidateDate.setDate(candidateDate.getDate() + 1);
    const nextDay = getWeekdayFromDate(candidateDate);
    const nextDate = candidateDate.toISOString().split('T')[0]!;
    if (
      plan.metadata?.preferredDays?.length &&
      !plan.metadata.preferredDays.includes(nextDay)
    ) {
      continue;
    }
    if (occupied.has(nextDate)) {
      continue;
    }

    return {
      ...session,
      scheduledDate: nextDate,
      scheduledDay: nextDay,
      scheduledTime: chooseTimeForDay(nextDay, session.scheduledTime),
      autoRescheduledFrom: session.scheduledDate,
      schedulingReason: 'adaptation_schedule_adjustment',
      adaptationSource: 'adaptation_engine',
      reasoningLabel: 'We shifted this session slightly to keep the workload manageable.',
    };
  }

  return session;
}

function buildMetadata(plan: Plan, candidate: AdaptationCandidate, targetSkill: SkillNode | null, now: string): PlanMetadata {
  return {
    ...(plan.metadata ?? {}),
    adaptationCount: (plan.metadata?.adaptationCount ?? 0) + 1,
    lastAdaptedAt: now,
    lastAdaptationSummary: candidate.reasonSummary,
    activeSkillFocus: targetSkill?.title ?? plan.metadata?.activeSkillFocus ?? null,
    currentEnvironmentTrack: candidate.targetEnvironment ?? plan.metadata?.currentEnvironmentTrack ?? null,
  };
}

/**
 * Finds a good insertion date for the support session: the first preferred day
 * after the last touched session's date, or the day after the last touched
 * session if no preferred day is available within 7 days.
 */
function findInsertionDate(
  plan: Plan,
  afterSession: PlanSession,
): { date: string; day: Weekday; time: string } | null {
  const baseDate = afterSession.scheduledDate;
  if (!baseDate) return null;

  const occupied = new Set(
    plan.sessions
      .filter((s) => !s.isCompleted && s.scheduledDate)
      .map((s) => s.scheduledDate!),
  );

  let candidate = new Date(`${baseDate}T12:00:00`);
  for (let offset = 1; offset <= 10; offset++) {
    candidate.setDate(candidate.getDate() + 1);
    const day = getWeekdayFromDate(candidate);
    const date = candidate.toISOString().split('T')[0]!;
    if (occupied.has(date)) continue;
    if (
      plan.metadata?.preferredDays?.length &&
      !plan.metadata.preferredDays.includes(day)
    ) {
      // Allow anyway after 7 days if nothing else found
      if (offset <= 7) continue;
    }
    return { date, day, time: chooseTimeForDay(day, afterSession.scheduledTime) };
  }

  return null;
}

/**
 * Builds a new support PlanSession to be inserted after the adapted window.
 * Returns null when a suitable date cannot be found.
 */
function buildSupportSession(
  candidate: AdaptationCandidate,
  supportType: SupportSessionType,
  targetSkill: SkillNode | null,
  referenceSession: PlanSession,
  plan: Plan,
  now: string,
): PlanSession | null {
  const spec = SUPPORT_SESSION_SPECS[supportType];
  const dateSlot = findInsertionDate(plan, referenceSession);
  if (!dateSlot) return null;

  const baseTitle = targetSkill?.title ?? referenceSession.title ?? 'Session';
  const protocolId = targetSkill?.protocolId ?? referenceSession.exerciseId;
  const skillId = targetSkill?.id ?? referenceSession.skillId;
  const env = spec.preferLowerEnvironment
    ? (candidate.targetEnvironment ?? referenceSession.environment ?? 'indoors_low_distraction')
    : (referenceSession.environment ?? candidate.targetEnvironment ?? 'indoors_low_distraction');

  const id = `inserted_${supportType}_${now.replace(/[^0-9]/g, '').slice(0, 14)}`;

  return {
    id,
    exerciseId: protocolId,
    weekNumber: referenceSession.weekNumber,
    dayNumber: referenceSession.dayNumber + 1,
    title: spec.title(baseTitle),
    durationMinutes: clampDuration(referenceSession.durationMinutes, spec.durationDeltaMinutes),
    isCompleted: false,
    scheduledDay: dateSlot.day,
    scheduledTime: dateSlot.time,
    scheduledDate: dateSlot.date,
    isReschedulable: true,
    skillId,
    parentSkillId: referenceSession.skillId ?? null,
    environment: env as PlanEnvironment,
    sessionKind: spec.sessionKind,
    adaptationSource: 'adaptation_engine',
    reasoningLabel: candidate.reasonSummary,
    insertedByAdaptation: true,
    supportSessionType: supportType,
    insertionReasonCode: candidate.reasonCode,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main compiler
// ─────────────────────────────────────────────────────────────────────────────

export function compileAdaptation(input: CompileAdaptationInput): CompiledAdaptation | null {
  const upcoming = getUpcomingIncompleteSessions(input.plan, MAX_ADAPTATION_WINDOW);
  if (upcoming.length === 0) return null;

  const touched = upcoming.slice(0, Math.min(input.candidate.sessionCount || DEFAULT_ADAPTATION_WINDOW, MAX_ADAPTATION_WINDOW));
  const touchedIds = touched.map((session) => session.id);

  const nextSessions = input.plan.sessions.map((session) => {
    if (!touchedIds.includes(session.id)) return session;
    let next = applySkillMutation(session, input.candidate, input.targetSkill);
    if (input.candidate.type === 'schedule_adjustment' && session.id === touchedIds[0]) {
      next = shiftSessionDate(input.plan, next);
    }
    return next;
  });

  // ── Support session insertion ─────────────────────────────────────────────
  let insertedSupportSessionId: string | null = null;

  if (
    input.candidate.insertSupportSession &&
    MAX_INSERTED_SUPPORT_SESSIONS >= 1
  ) {
    const supportType = input.candidate.insertSupportSession;
    // Use the last touched session as the anchor for date placement.
    const lastTouchedSession = nextSessions.find(
      (s) => s.id === touchedIds[touchedIds.length - 1],
    ) ?? nextSessions[nextSessions.length - 1];

    if (lastTouchedSession) {
      // Build the support session against the updated plan (with touched sessions already mutated)
      const planWithMutations: Plan = {
        ...input.plan,
        sessions: nextSessions,
      };

      const supportSession = buildSupportSession(
        input.candidate,
        supportType,
        input.targetSkill,
        lastTouchedSession,
        planWithMutations,
        input.now,
      );

      if (supportSession) {
        nextSessions.push(supportSession);
        insertedSupportSessionId = supportSession.id;
      }
    }
  }

  const currentStage = input.targetSkill
    ? `Stage ${input.targetSkill.stage} — ${input.targetSkill.kind.charAt(0).toUpperCase()}${input.targetSkill.kind.slice(1)}`
    : input.plan.currentStage;

  return {
    nextPlan: {
      ...input.plan,
      currentStage,
      metadata: buildMetadata(input.plan, input.candidate, input.targetSkill, input.now),
      sessions: nextSessions,
    },
    touchedSessionIds: touchedIds,
    insertedSupportSessionId,
  };
}
