import { supabase } from '@/lib/supabase';

/**
 * Apple requires the app to revoke its Sign in with Apple token when the
 * account is deleted. The one-time authorization code is only available at
 * sign-in, so it is exchanged for a refresh token server-side now and revoked
 * by `delete-account` later. Never blocks or fails the sign-in.
 */
export function storeAppleAuthorizationCode(authorizationCode: string | null | undefined) {
  if (!authorizationCode) return;
  supabase.functions
    .invoke('apple-token-exchange', { body: { authorizationCode } })
    .catch(() => {});
}
