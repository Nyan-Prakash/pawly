import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appleConfig, exchangeAuthorizationCode } from '../_shared/apple.ts';
import { consumeQuota, DAY_SECONDS, userSubject } from '../_shared/quota.ts';

// Called once after Sign in with Apple. Swaps the one-time authorization code
// for a refresh token and stores it, so delete-account can revoke it later
// (App Store guideline 5.1.1(v)).
//
// Secrets: APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (.p8 contents) and
// optionally APPLE_CLIENT_ID (defaults to the bundle id). Until they are set
// this answers 200 { stored: false, reason: 'not_configured' } so sign-in never
// breaks on it.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_CODE_CHARS = 2048;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // verify_jwt is off for this function, so the user token check here is the
  // only gate in front of service-role writes. It must never be optional.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(token);

  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body: { authorizationCode?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const authorizationCode = body?.authorizationCode;
  if (
    typeof authorizationCode !== 'string' ||
    authorizationCode.length === 0 ||
    authorizationCode.length > MAX_CODE_CHARS
  ) {
    return jsonResponse({ error: 'authorizationCode is required' }, 400);
  }

  const config = appleConfig();
  if (!config) {
    return jsonResponse({ stored: false, reason: 'not_configured' });
  }

  // One exchange per sign-in is the legitimate rate; this only stops a loop.
  const exhausted = await consumeQuota(adminClient, [
    { subject: userSubject(user.id), feature: 'apple_token', limit: 20, windowSeconds: DAY_SECONDS },
  ]);
  if (exhausted) {
    return jsonResponse({ stored: false, reason: 'rate_limited' }, 429);
  }

  let refreshToken: string;
  try {
    refreshToken = await exchangeAuthorizationCode(config, authorizationCode);
  } catch (err) {
    // Codes are single-use and expire after five minutes, so a replay lands here.
    console.error('[apple-token-exchange] exchange failed:', err);
    return jsonResponse({ stored: false, reason: 'exchange_failed' });
  }

  const { error: storeError } = await adminClient
    .from('apple_credentials')
    .upsert(
      { user_id: user.id, refresh_token: refreshToken, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  if (storeError) {
    console.error('[apple-token-exchange] store failed:', storeError.message);
    return jsonResponse({ stored: false, reason: 'store_failed' }, 500);
  }

  return jsonResponse({ stored: true });
});
