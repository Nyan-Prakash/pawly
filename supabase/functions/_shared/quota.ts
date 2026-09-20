// DB-backed AI usage quotas. Backed by public.consume_ai_quota() which checks
// the window and records the use atomically, so limits hold across isolates.

// deno-lint-ignore no-explicit-any
type AdminClient = any;

export interface QuotaRule {
  subject: string;
  feature: string;
  limit: number;
  windowSeconds: number;
}

export const DAY_SECONDS = 86_400;

/**
 * Consumes one unit against every rule, in order. Returns the first rule that
 * is exhausted, or null when all passed. Fails closed: if the quota RPC errors
 * we refuse the request rather than spend money unmetered.
 */
export async function consumeQuota(
  adminClient: AdminClient,
  rules: QuotaRule[],
): Promise<QuotaRule | null> {
  for (const rule of rules) {
    const { data, error } = await adminClient.rpc('consume_ai_quota', {
      p_subject: rule.subject,
      p_feature: rule.feature,
      p_limit: rule.limit,
      p_window_seconds: rule.windowSeconds,
    });
    if (error) {
      console.error('[quota] consume_ai_quota failed:', error.message);
      return rule;
    }
    if (data !== true) return rule;
  }
  return null;
}

export const userSubject = (userId: string) => `user:${userId}`;

export async function ipSubject(req: Request): Promise<string> {
  const forwarded = req.headers.get('x-forwarded-for') ?? '';
  const ip =
    req.headers.get('cf-connecting-ip') ??
    forwarded.split(',')[0]?.trim() ??
    'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip || 'unknown'));
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ip:${hex.slice(0, 32)}`;
}
