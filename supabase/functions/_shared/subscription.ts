// The one server-side Pro rule. Mirrored in SQL by public.is_pro_user()
// (launch_hardening migration); keep the two in step.

export interface SubscriptionProfile {
  subscription_tier?: string | null;
  subscription_expires_at?: string | null;
}

export const PROFILE_SUBSCRIPTION_COLUMNS = 'subscription_tier, subscription_expires_at';

// Covers a late RENEWAL webhook and the stores' billing-retry period, so a
// paying user is never dropped to free because an event arrived late.
const EXPIRY_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * True only for a paid tier whose expiry is unset (lifetime) or no more than
 * the grace period in the past. A missing profile row is free.
 */
export function isProProfile(profile: SubscriptionProfile | null | undefined, now = Date.now()): boolean {
  if (!profile?.subscription_tier || profile.subscription_tier === 'free') return false;
  if (!profile.subscription_expires_at) return true;
  const expiresAt = Date.parse(profile.subscription_expires_at);
  // An unreadable expiry on a paid row is treated as active rather than locking out a payer.
  if (Number.isNaN(expiresAt)) return true;
  return expiresAt > now - EXPIRY_GRACE_MS;
}
