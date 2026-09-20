import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { appleConfig, revokeRefreshToken } from '../_shared/apple.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// deno-lint-ignore no-explicit-any
type AdminClient = any;

const LIST_PAGE = 1000;

async function listAll(adminClient: AdminClient, bucket: string, folder: string, search?: string) {
  const names: string[] = [];
  for (let offset = 0; ; offset += LIST_PAGE) {
    const { data, error } = await adminClient.storage
      .from(bucket)
      .list(folder, { limit: LIST_PAGE, offset, search });
    if (error) throw new Error(`list ${bucket}/${folder}: ${error.message}`);
    // Entries without an id are sub-folders; mark them with a trailing slash.
    for (const entry of (data ?? []) as { name: string; id: string | null }[]) {
      names.push(entry.id ? `${folder}/${entry.name}` : `${folder}/${entry.name}/`);
    }
    if (!data || data.length < LIST_PAGE) break;
  }
  return names;
}

async function removeFolder(adminClient: AdminClient, bucket: string, folder: string) {
  const entries = await listAll(adminClient, bucket, folder);
  const files = entries.filter((e) => !e.endsWith('/'));
  for (const sub of entries.filter((e) => e.endsWith('/'))) {
    await removeFolder(adminClient, bucket, sub.slice(0, -1));
  }
  for (let i = 0; i < files.length; i += 100) {
    const { error } = await adminClient.storage.from(bucket).remove(files.slice(i, i + 100));
    if (error) throw new Error(`remove ${bucket}/${folder}: ${error.message}`);
  }
}

const isBucketNotFound = (message: string) => /bucket not found/i.test(message);

/**
 * Best effort: returns what could not be cleaned up instead of throwing. Each
 * location is attempted on its own so one failure doesn't skip the rest.
 */
async function deleteUserStorage(adminClient: AdminClient, userId: string): Promise<string[]> {
  const failures: string[] = [];
  const attempt = async (label: string, task: () => Promise<void>) => {
    try {
      await task();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // pawly-videos was retired with video upload and may have been removed
      // from the dashboard; a bucket that is gone holds nothing to delete.
      if (!isBucketNotFound(message)) failures.push(`${label}: ${message}`);
    }
  };

  // pawly-videos: videos/{userId}/{dogId}/… and thumbnails/{userId}/{dogId}/…
  await attempt('videos', () => removeFolder(adminClient, 'pawly-videos', `videos/${userId}`));
  await attempt('thumbnails', () => removeFolder(adminClient, 'pawly-videos', `thumbnails/${userId}`));

  // avatars: current layout is {userId}/{ts}.png
  await attempt('avatars', () => removeFolder(adminClient, 'avatars', userId));

  // avatars: legacy flat layout avatars/{userId}_{ts}.png
  await attempt('legacy avatars', async () => {
    const legacy = (await listAll(adminClient, 'avatars', 'avatars', userId)).filter((p) =>
      p.startsWith(`avatars/${userId}_`),
    );
    if (legacy.length > 0) {
      const { error } = await adminClient.storage.from('avatars').remove(legacy);
      if (error) throw new Error(`remove legacy avatars: ${error.message}`);
    }
  });

  return failures;
}

/**
 * App Store guideline 5.1.1(v): revoke the Sign in with Apple token with the
 * account. Best effort; the row itself goes with the auth user (FK cascade).
 */
async function revokeAppleToken(adminClient: AdminClient, userId: string) {
  try {
    const { data, error } = await adminClient
      .from('apple_credentials')
      .select('refresh_token')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data?.refresh_token) return;

    const config = appleConfig();
    if (!config) {
      console.warn('delete-account: Apple token stored but APPLE_* secrets are not set; not revoked');
      return;
    }
    await revokeRefreshToken(config, data.refresh_token);
  } catch (err) {
    console.error('delete-account Apple revoke failed:', err);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use the caller's JWT to identify them — never trust a user-supplied ID
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Client with caller's token to verify identity
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── 1. Delete storage objects ────────────────────────────────────────────
    // Storage is not covered by FK cascades, and Apple requires uploaded media
    // to go with the account. Deleting the account matters most though: a
    // storage failure is logged for manual cleanup and never blocks it.
    const storageFailures = await deleteUserStorage(adminClient, userId);
    if (storageFailures.length > 0) {
      console.error(`delete-account storage cleanup incomplete for ${userId}:`, storageFailures.join(' | '));
    }

    // ── 2. Revoke Sign in with Apple ─────────────────────────────────────────
    await revokeAppleToken(adminClient, userId);

    // ── 3. Delete the auth user ───────────────────────────────────────────────
    // Every user table references auth.users or dogs with ON DELETE CASCADE, so
    // this removes all database rows as well.
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('Failed to delete auth user:', deleteAuthError);
      return new Response(JSON.stringify({ error: 'Failed to delete account. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('delete-account error:', err);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
