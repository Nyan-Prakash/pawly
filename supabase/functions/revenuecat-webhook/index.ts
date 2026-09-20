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
//
// Optional secrets:
//   REVENUECAT_SECRET_API_KEY  sk_… key; lets TRANSFER look up the real expiry.
//   REVENUECAT_IGNORE_SANDBOX  'true' drops sandbox / Test Store events. Leave it
//                              unset for launch: App Review and TestFlight buy
//                              in the sandbox, and a reviewer who subscribes
//                              must get Pro server-side too. Sandbox purchases
//                              need a TestFlight or development build, so the
//                              exposure is invited testers only. Set it once
//                              the app is live if testers should stay free.

/** Matches PRO_ENTITLEMENT in lib/subscription.ts. */
const PRO_ENTITLEMENT = 'pawly_pro';

/** TRANSFER carries no expiry. Without the REST key, grant this long; RENEWAL then extends it. */
const TRANSFER_FALLBACK_MS = 35 * 24 * 60 * 60 * 1000;

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
  environment?: 'SANDBOX' | 'PRODUCTION';
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

type Grant = { tier: 'free' | 'pro'; expiresAt: string | null };

/**
 * What a TRANSFER recipient actually holds, read from the RevenueCat REST API.
 * Falls back to a bounded grant when the key is unset or the lookup fails, so a
 * transfer is never "Pro forever".
 */
async function transferredGrant(appUserId: string): Promise<Grant> {
  const fallback: Grant = { tier: 'pro', expiresAt: new Date(Date.now() + TRANSFER_FALLBACK_MS).toISOString() };
  const apiKey = Deno.env.get('REVENUECAT_SECRET_API_KEY');
  if (!apiKey) return fallback;

  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entitlement = (await res.json())?.subscriber?.entitlements?.[PRO_ENTITLEMENT];
    if (!entitlement) return { tier: 'free', expiresAt: null };

    // expires_date is null for a lifetime entitlement.
    const expiresDate: string | null = entitlement.expires_date ?? null;
    if (expiresDate === null) return { tier: 'pro', expiresAt: null };
    const expiresMs = Date.parse(expiresDate);
    if (Number.isNaN(expiresMs)) return fallback;
    return { tier: expiresMs > Date.now() ? 'pro' : 'free', expiresAt: new Date(expiresMs).toISOString() };
  } catch (err) {
    console.error('[revenuecat-webhook] subscriber lookup failed; using bounded grant:', err);
    return fallback;
  }
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

  // 200, not an error: RevenueCat retries anything else.
  if (event.environment === 'SANDBOX' && Deno.env.get('REVENUECAT_IGNORE_SANDBOX') === 'true') {
    return jsonResponse({ ok: true, ignored: 'sandbox' });
  }

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const eventAt = new Date(event.event_timestamp_ms ?? Date.now()).toISOString();

  async function apply(ids: string[], tier: 'free' | 'pro', expiresAt: string | null) {
    for (const id of ids) {
      // The row normally exists (handle_new_user trigger); create it if not, or
      // the update below would match nothing and the purchase would be lost.
      const { error: insertError } = await adminClient
        .from('user_profiles')
        .upsert({ id }, { onConflict: 'id', ignoreDuplicates: true });
      if (insertError) {
        // 23503: no such auth user (account deleted). Retrying can't fix that.
        if (insertError.code === '23503') {
          console.warn(`[revenuecat-webhook] no auth user for ${id}; skipped`);
          continue;
        }
        throw new Error(`upsert ${id}: ${insertError.message}`);
      }

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
      for (const id of userIds(event.transferred_to ?? [])) {
        const grant = await transferredGrant(id);
        await apply([id], grant.tier, grant.expiresAt);
      }
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
