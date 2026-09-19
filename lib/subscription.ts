import type { SubscriptionTier } from '../types/index.ts';

/**
 * Pure subscription logic: no React Native or SDK imports, so it runs under
 * `node --test`. The RevenueCat calls live in `lib/revenuecat.ts`.
 */

/** The one entitlement configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT = 'pro';

export type Feature =
  | 'full_plan'
  | 'unlimited_sessions'
  | 'coach_unlimited'
  | 'video_upload_unlimited'
  | 'progress_history';

/** Everything listed here needs Pro. A feature that is not listed is free. */
const PRO_FEATURES: ReadonlySet<Feature> = new Set<Feature>([
  'full_plan',
  'unlimited_sessions',
  'coach_unlimited',
  'video_upload_unlimited',
  'progress_history',
]);

export function canAccess(feature: Feature, tier: SubscriptionTier): boolean {
  return tier === 'pro' || !PRO_FEATURES.has(feature);
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
