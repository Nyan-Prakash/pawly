import type { Plan } from '../types';

function upcomingScheduleFingerprint(plan: Plan): string {
  return plan.sessions
    .filter((session) => !session.isCompleted)
    .slice(0, 5)
    .map((session) => `${session.id}:${session.scheduledDate ?? ''}:${session.scheduledTime ?? ''}`)
    .join('|');
}

export function didUpcomingScheduleChange(previousPlan: Plan | null | undefined, nextPlan: Plan | null | undefined): boolean {
  if (!previousPlan || !nextPlan) return Boolean(previousPlan || nextPlan);
  return upcomingScheduleFingerprint(previousPlan) !== upcomingScheduleFingerprint(nextPlan);
}
