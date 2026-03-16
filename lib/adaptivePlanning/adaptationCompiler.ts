import type { Plan, PlanEnvironment, PlanMetadata, PlanSession, SkillNode, Weekday } from '../../types/index.ts';
import { DEFAULT_ADAPTATION_WINDOW, MAX_ADAPTATION_WINDOW, type AdaptationCandidate } from './adaptationRules.ts';

export interface CompileAdaptationInput {
  plan: Plan;
  candidate: AdaptationCandidate;
  targetSkill: SkillNode | null;
  now: string;
}

export interface CompiledAdaptation {
  nextPlan: Plan;
  touchedSessionIds: string[];
}

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
  };
}
