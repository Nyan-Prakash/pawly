import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// RevenueCat → Supabase. Keeps user_profiles.subscription_tier in step with the
// `pawly_pro` entitlement so server-side limits (the coach) follow purchases.
//
// RevenueCat dashboard → Integrations → Webhooks:
//   URL:    https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook
//   Header: Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>
// The same value is set with `supabase secrets set REVENUECAT_WEBHOOK_SECRET=…`.
// verify_jwt is off for this function (config.toml); the shared secret is the auth.

/** Matches PRO_ENTITLEMENT in lib/subscription.ts. */
const PRO_ENTITLEMENT = 'pawly_pro';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Events that mean the entitlement is active until `expiration_at_ms`. */
const GRANTING = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);
// CANCELLATION and BILLING_ISSUE keep access until EXPIRATION arrives.

type RevenueCatEvent = {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  entitlement_ids?: string[] | null;
  expiration_at_ms?: number | null;
  event_timestamp_ms?: number;
  transferred_from?: string[];
  transferred_to?: string[];
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function timingSafeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

/** The Supabase user ids named by an event. The app always logs in with the Supabase id. */
function userIds(ids: (string | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => !!id && UUID.test(id)))];
}

serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[revenuecat-webhook] REVENUECAT_WEBHOOK_SECRET is not set');
    return jsonResponse({ error: 'Not configured' }, 500);
  }
  if (!timingSafeEqual(req.headers.get('Authorization') ?? '', `Bearer ${secret}`)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let event: RevenueCatEvent | undefined;
  try {
    event = (await req.json())?.event;
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }
  if (!event?.type) return jsonResponse({ error: 'Missing event' }, 400);

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const eventAt = new Date(event.event_timestamp_ms ?? Date.now()).toISOString();

  async function apply(ids: string[], tier: 'free' | 'pro', expiresAt: string | null) {
    for (const id of ids) {
      // Skip when a newer event has already been applied.
      const { error } = await adminClient
        .from('user_profiles')
        .update({ subscription_tier: tier, subscription_expires_at: expiresAt, subscription_event_at: eventAt })
        .eq('id', id)
        .or(`subscription_event_at.is.null,subscription_event_at.lte."${eventAt}"`);
      if (error) throw new Error(`update ${id}: ${error.message}`);
    }
  }

  try {
    if (event.type === 'TRANSFER') {
      await apply(userIds(event.transferred_from ?? []), 'free', null);
      await apply(userIds(event.transferred_to ?? []), 'pro', null);
      return jsonResponse({ ok: true });
    }

    const ids = userIds([event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])]);
    const hasPro = (event.entitlement_ids ?? []).includes(PRO_ENTITLEMENT);

    if (event.type === 'EXPIRATION' && hasPro) {
      await apply(ids, 'free', null);
    } else if (GRANTING.has(event.type) && hasPro) {
      const expiresMs = event.expiration_at_ms ?? null;
      const active = expiresMs === null || expiresMs > Date.now();
      await apply(ids, active ? 'pro' : 'free', expiresMs ? new Date(expiresMs).toISOString() : null);
    }
    // Everything else (TEST, CANCELLATION, BILLING_ISSUE, …) is acknowledged unchanged.
    return jsonResponse({ ok: true });
  } catch (err) {
    // Non-2xx makes RevenueCat retry.
    console.error('[revenuecat-webhook]', err);
    return jsonResponse({ error: 'Update failed' }, 500);
  }
});
