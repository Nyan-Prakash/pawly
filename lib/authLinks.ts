/**
 * Return path for the links in Supabase auth emails (password reset, email
 * confirmation). The email opens `pawly://…` with the tokens in the URL
 * fragment, or with `?code=` when the project uses the PKCE flow.
 *
 * The `pawly://` URLs must be on the redirect allow-list in the Supabase
 * dashboard (Authentication → URL Configuration).
 */

import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const PASSWORD_RESET_REDIRECT = Linking.createURL('reset-password');
export const EMAIL_CONFIRM_REDIRECT = Linking.createURL('/');

function readParams(url: string): URLSearchParams {
  const params = new URLSearchParams();
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.split('?')[1] ?? '';
  for (const part of [query, hash]) {
    new URLSearchParams(part).forEach((value, key) => params.set(key, value));
  }
  return params;
}

export type AuthLinkResult = 'recovery' | 'signed_in' | 'error' | null;

/** Returns null when the URL is not an auth link, so other deep links pass through. */
export async function handleAuthLink(url: string | null): Promise<AuthLinkResult> {
  if (!url) return null;
  const params = readParams(url);
  const isRecovery = params.get('type') === 'recovery' || url.includes('reset-password');

  if (params.get('error') || params.get('error_code')) {
    // Expired or already-used link.
    return 'error';
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const code = params.get('code');
  if (!code && !(accessToken && refreshToken)) return null;

  // Set before the session lands so the routing gate never sends a recovering
  // user to the tabs.
  if (isRecovery) useAuthStore.setState({ isPasswordRecovery: true });

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.setSession({ access_token: accessToken!, refresh_token: refreshToken! });

  if (error) {
    useAuthStore.setState({ isPasswordRecovery: false });
    return 'error';
  }
  return isRecovery ? 'recovery' : 'signed_in';
}
