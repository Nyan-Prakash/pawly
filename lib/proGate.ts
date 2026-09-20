import { isSessionLocked } from '@/lib/subscription';
import { usePlanStore } from '@/stores/planStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

/** Completed sessions across every course, whichever store knows more. */
function completedSessionCount(): number {
  const inPlans = Object.values(usePlanStore.getState().plansById).reduce(
    (sum, plan) => sum + plan.sessions.filter((s) => s.isCompleted).length,
    0,
  );
  return Math.max(inPlans, useProgressStore.getState().totalSessionsCompleted);
}

export function isSessionLockedForUser(planId: string | null | undefined, sessionId: string): boolean {
  const { plansById, activePlan } = usePlanStore.getState();
  const plan = (planId ? plansById[planId] : null) ?? activePlan;
  const session = plan?.sessions.find((s) => s.id === sessionId);
  if (!session) return false;
  return isSessionLocked(session, completedSessionCount(), useSubscriptionStore.getState().tier);
}

/**
 * Call before navigating to a session. Returns false and opens the paywall
 * when the session needs Pro.
 */
export function guardSessionStart(planId: string | null | undefined, sessionId: string): boolean {
  if (!isSessionLockedForUser(planId, sessionId)) return true;
  useSubscriptionStore.getState().openPaywall('plan');
  return false;
}
