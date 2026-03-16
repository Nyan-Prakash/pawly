import type { Plan, PlanSession } from '../../types/index.ts';

export interface PlanDiffResult {
  changedSessionIds: string[];
  changedFields: string[];
  previousSnapshot: Record<string, unknown>;
  newSnapshot: Record<string, unknown>;
}

function pickComparableSession(session: PlanSession) {
  return {
    id: session.id,
    title: session.title,
    exerciseId: session.exerciseId,
    durationMinutes: session.durationMinutes,
    scheduledDate: session.scheduledDate ?? null,
    scheduledTime: session.scheduledTime ?? null,
    environment: session.environment ?? null,
    skillId: session.skillId ?? null,
    parentSkillId: session.parentSkillId ?? null,
    sessionKind: session.sessionKind ?? null,
    adaptationSource: session.adaptationSource ?? null,
    reasoningLabel: session.reasoningLabel ?? null,
  };
}

export function buildPlanDiff(previousPlan: Plan, nextPlan: Plan, trackedSessionIds: string[]): PlanDiffResult {
  const previousSessions = previousPlan.sessions.filter((session) => trackedSessionIds.includes(session.id));
  const nextSessions = nextPlan.sessions.filter((session) => trackedSessionIds.includes(session.id));
  const changedSessionIds: string[] = [];
  const changedFields = new Set<string>();

  for (const prev of previousSessions) {
    const next = nextSessions.find((session) => session.id === prev.id);
    if (!next) continue;

    const prevComparable = pickComparableSession(prev);
    const nextComparable = pickComparableSession(next);
    const keys = Object.keys(prevComparable) as Array<keyof typeof prevComparable>;
    const changedForSession = keys.filter(
      (key) => JSON.stringify(prevComparable[key]) !== JSON.stringify(nextComparable[key]),
    );

    if (changedForSession.length > 0) {
      changedSessionIds.push(prev.id);
      for (const key of changedForSession) {
        changedFields.add(`sessions.${String(key)}`);
      }
    }
  }

  const previousSnapshot = {
    sessions: previousSessions.map(pickComparableSession),
    metadata: previousPlan.metadata ?? {},
  };
  const newSnapshot = {
    sessions: nextSessions.map(pickComparableSession),
    metadata: nextPlan.metadata ?? {},
  };

  return {
    changedSessionIds,
    changedFields: [...changedFields].sort(),
    previousSnapshot,
    newSnapshot,
  };
}
