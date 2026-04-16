import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // ── 1. Fetch dog IDs owned by this user ──────────────────────────────────
    const { data: dogs } = await adminClient
      .from('dogs')
      .select('id')
      .eq('owner_id', userId);

    const dogIds = (dogs ?? []).map((d: { id: string }) => d.id);

    // ── 2. Delete avatar storage objects ─────────────────────────────────────
    if (dogIds.length > 0) {
      // List and delete files in the avatars bucket under each dog ID prefix
      for (const dogId of dogIds) {
        const { data: avatarFiles } = await adminClient.storage
          .from('avatars')
          .list(dogId);

        if (avatarFiles && avatarFiles.length > 0) {
          const paths = avatarFiles.map((f: { name: string }) => `${dogId}/${f.name}`);
          await adminClient.storage.from('avatars').remove(paths);
        }
      }
    }

    // ── 3. Delete video storage objects ──────────────────────────────────────
    const { data: videos } = await adminClient
      .from('training_videos')
      .select('storage_path')
      .eq('user_id', userId);

    if (videos && videos.length > 0) {
      const paths = videos
        .map((v: { storage_path: string | null }) => v.storage_path)
        .filter(Boolean) as string[];

      if (paths.length > 0) {
        await adminClient.storage.from('training-videos').remove(paths);
      }
    }

    // ── 4. Delete all user data (cascade order) ───────────────────────────────
    // Plans cascade-delete sessions, schedule slots, and adaptations via FK constraints.
    // Explicit deletions here for tables without cascades.

    if (dogIds.length > 0) {
      // Fetch plan IDs for this user's dogs
      const { data: plans } = await adminClient
        .from('plans')
        .select('id')
        .in('dog_id', dogIds);

      const planIds = (plans ?? []).map((p: { id: string }) => p.id);

      if (planIds.length > 0) {
        await adminClient.from('session_logs').delete().in('plan_id', planIds);
        await adminClient.from('plan_adaptations').delete().in('plan_id', planIds);
        await adminClient.from('plan_sessions').delete().in('plan_id', planIds);
        await adminClient.from('plans').delete().in('id', planIds);
      }

      await adminClient.from('walk_logs').delete().in('dog_id', dogIds);
      await adminClient.from('milestones').delete().in('dog_id', dogIds);
      await adminClient.from('dog_learning_state').delete().in('dog_id', dogIds);
      await adminClient.from('learning_state_signals').delete().in('dog_id', dogIds);
      await adminClient.from('learning_hypotheses').delete().in('dog_id', dogIds);
      await adminClient.from('dogs').delete().in('id', dogIds);
    }

    // Coach conversations & messages
    const { data: convos } = await adminClient
      .from('coach_conversations')
      .select('id')
      .eq('user_id', userId);

    const convoIds = (convos ?? []).map((c: { id: string }) => c.id);
    if (convoIds.length > 0) {
      await adminClient.from('coach_messages').delete().in('conversation_id', convoIds);
      await adminClient.from('coach_conversations').delete().in('id', convoIds);
    }

    // Training videos metadata
    await adminClient.from('training_videos').delete().eq('user_id', userId);

    // Notifications
    await adminClient.from('in_app_notifications').delete().eq('user_id', userId);

    // User feedback
    await adminClient.from('user_feedback').delete().eq('user_id', userId);

    // User profile
    await adminClient.from('user_profiles').delete().eq('id', userId);

    // ── 5. Delete the auth user ───────────────────────────────────────────────
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
