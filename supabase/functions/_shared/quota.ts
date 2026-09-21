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

/**
 * Hands back the newest unit for a rule consumed by consumeQuota, for when the
 * metered call failed before the user got anything. Best effort.
 */
export async function releaseQuota(
  adminClient: AdminClient,
  rule: Pick<QuotaRule, 'subject' | 'feature'>,
): Promise<void> {
  const { error } = await adminClient.rpc('release_ai_quota', {
    p_subject: rule.subject,
    p_feature: rule.feature,
  });
  if (error) console.error('[quota] release_ai_quota failed:', error.message);
}

export const userSubject = (userId: string) => `user:${userId}`;

/**
 * Best available client IP. cf-connecting-ip is set by the edge and cannot be
 * supplied by the caller. x-forwarded-for can: a client may send its own value
 * and proxies only append to it, so the first entry is attacker-controlled and
 * the last one (added by the nearest trusted proxy) is the one to use.
 */
function clientIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf;
  const hops = (req.headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((hop) => hop.trim())
    .filter(Boolean);
  return hops[hops.length - 1] ?? 'unknown';
}

export async function ipSubject(req: Request): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clientIp(req)));
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ip:${hex.slice(0, 32)}`;
}
