// Sign in with Apple server-to-server calls (token exchange + revocation).
// App Store guideline 5.1.1(v) requires revoking the user's Apple token when
// the account is deleted. apple-token-exchange stores the refresh token at sign
// in; delete-account revokes it.

import { importPKCS8, SignJWT } from 'https://esm.sh/jose@5.9.6';

const APPLE_AUDIENCE = 'https://appleid.apple.com';
const APPLE_TIMEOUT_MS = 10_000;
/** Native sign-in uses the bundle id as the client id. */
const DEFAULT_CLIENT_ID = 'com.nyan.prakash.pawly';

export interface AppleConfig {
  teamId: string;
  keyId: string;
  privateKey: string;
  clientId: string;
}

/** Null until APPLE_TEAM_ID, APPLE_KEY_ID and APPLE_PRIVATE_KEY are all set. */
export function appleConfig(): AppleConfig | null {
  const teamId = Deno.env.get('APPLE_TEAM_ID')?.trim();
  const keyId = Deno.env.get('APPLE_KEY_ID')?.trim();
  // `supabase secrets set` from a one-line value leaves literal "\n" in the PEM.
  const privateKey = Deno.env.get('APPLE_PRIVATE_KEY')?.replace(/\\n/g, '\n').trim();
  if (!teamId || !keyId || !privateKey) return null;
  return { teamId, keyId, privateKey, clientId: Deno.env.get('APPLE_CLIENT_ID')?.trim() || DEFAULT_CLIENT_ID };
}

/** Short-lived ES256 client secret, signed with the .p8 key. */
async function clientSecret(config: AppleConfig): Promise<string> {
  const key = await importPKCS8(config.privateKey, 'ES256');
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: config.keyId })
    .setIssuer(config.teamId)
    .setSubject(config.clientId)
    .setAudience(APPLE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(key);
}

async function applePost(config: AppleConfig, path: 'token' | 'revoke', params: Record<string, string>) {
  return await fetch(`${APPLE_AUDIENCE}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: await clientSecret(config),
      ...params,
    }),
    signal: AbortSignal.timeout(APPLE_TIMEOUT_MS),
  });
}

/** Exchanges a one-time authorization code for a refresh token. Throws on failure. */
export async function exchangeAuthorizationCode(config: AppleConfig, authorizationCode: string): Promise<string> {
  const res = await applePost(config, 'token', { grant_type: 'authorization_code', code: authorizationCode });
  const json = await res.json().catch(() => null);
  if (!res.ok || typeof json?.refresh_token !== 'string') {
    // Apple's error body is { error, error_description }; it carries no secrets.
    throw new Error(`Apple token exchange failed (${res.status}): ${json?.error ?? 'no refresh_token'}`);
  }
  return json.refresh_token;
}

/** Revokes a refresh token. Throws on failure. */
export async function revokeRefreshToken(config: AppleConfig, refreshToken: string): Promise<void> {
  const res = await applePost(config, 'revoke', { token: refreshToken, token_type_hint: 'refresh_token' });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(`Apple revoke failed (${res.status}): ${json?.error ?? 'unknown'}`);
  }
}
