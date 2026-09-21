import type { SubscriptionTier } from '../types/index.ts';

/**
 * Pure subscription logic: no React Native or SDK imports, so it runs under
 * `node --test`. The RevenueCat calls live in `lib/revenuecat.ts`.
 */

/** The one entitlement configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT = 'pawly_pro';

export type Feature =
  | 'full_plan'
  | 'unlimited_sessions'
  | 'coach_unlimited'
  | 'progress_history';

/** Everything listed here needs Pro. A feature that is not listed is free. */
const PRO_FEATURES: ReadonlySet<Feature> = new Set<Feature>([
  'full_plan',
  'unlimited_sessions',
  'coach_unlimited',
  'progress_history',
]);

/**
 * What the free tier gets. Tune here; the coach limit is mirrored in
 * `supabase/functions/ai-coach-message` (FREE_DAILY_MESSAGES), which enforces it.
 */
export const FREE_LIMITS = {
  /** Completed sessions across all courses before new ones need Pro. */
  sessions: 3,
  coachMessagesPerDay: 3,
  /** Weekly bars shown on Progress. Pro sees PRO_PROGRESS_WEEKS. */
  progressWeeks: 2,
} as const;

export const PRO_PROGRESS_WEEKS = 8;

export function canAccess(feature: Feature, tier: SubscriptionTier): boolean {
  return tier === 'pro' || !PRO_FEATURES.has(feature);
}

/**
 * A session a free user cannot start. Completed sessions stay open so they can
 * be repeated; everything else locks once the free sessions are used up.
 */
export function isSessionLocked(
  session: { isCompleted: boolean },
  completedSessions: number,
  tier: SubscriptionTier,
): boolean {
  if (canAccess('unlimited_sessions', tier) || session.isCompleted) return false;
  return completedSessions >= FREE_LIMITS.sessions;
}

export function progressWeeksFor(tier: SubscriptionTier): number {
  return canAccess('progress_history', tier) ? PRO_PROGRESS_WEEKS : FREE_LIMITS.progressWeeks;
}

type EntitlementSource = {
  entitlements: { active: Record<string, unknown> };
};

export function tierFromCustomerInfo(info: EntitlementSource | null | undefined): SubscriptionTier {
  return info?.entitlements.active[PRO_ENTITLEMENT] ? 'pro' : 'free';
}

/** Whole-percent saving of the annual plan against twelve monthly payments. */
export function annualSavingsPercent(monthlyPrice: number, annualPrice: number): number | null {
  if (!(monthlyPrice > 0) || !(annualPrice > 0)) return null;
  const percent = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100);
  return percent > 0 ? percent : null;
}

type IntroPrice = {
  price: number;
  periodUnit: string;
  periodNumberOfUnits: number;
};

/** "7-day", "1-month". Null unless the intro offer is a free trial. */
export function freeTrialLength(intro: IntroPrice | null | undefined): string | null {
  if (!intro || intro.price !== 0 || !(intro.periodNumberOfUnits > 0)) return null;
  let count = intro.periodNumberOfUnits;
  let unit = intro.periodUnit.toLowerCase();
  if (unit === 'week') {
    count *= 7;
    unit = 'day';
  }
  if (!['day', 'month', 'year'].includes(unit)) return null;
  return `${count}-${unit}`;
}
