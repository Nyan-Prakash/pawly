import { isSessionLockedForUser } from '@/lib/proGate';
import { usePlanStore } from '@/stores/planStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

/**
 * `isSessionLockedForUser` for render. proGate reads the stores imperatively,
 * so nothing re-renders when its inputs change; subscribing to those inputs
 * here is what makes a lock marker disappear the moment Pro turns on (or
 * appear when the free sessions run out).
 */
export function useSessionLock(): (planId: string | null | undefined, sessionId: string) => boolean {
  useSubscriptionStore((s) => s.tier);
  usePlanStore((s) => s.plansById);
  usePlanStore((s) => s.activePlan);
  useProgressStore((s) => s.totalSessionsCompleted);
  return isSessionLockedForUser;
}

/** Spoken after a locked session's own label. */
export const PRO_LOCK_LABEL = 'needs Pro';
/** What tapping a locked session does. */
export const PRO_LOCK_HINT = 'Opens Pawly Pro';
