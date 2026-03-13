import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─────────────────────────────────────────────────────────────────────────────
// complete-expert-review
//
// Called by the admin / trainer tooling when a review is finished.
// This function is intentionally protected by an admin API key (not user JWT)
// so it cannot be called by end users.
//
// Input:
//   { reviewId: string, feedback: string, timestamps: [{time: number, note: string}] }
//
// Actions:
//   1. Update expert_reviews row (status → complete, feedback, timestamps, completed_at)
//   2. Send push notification to the user via Expo Push API
//
// Required Supabase secrets:
//   ADMIN_API_KEY — a strong secret; must be sent in X-Admin-Key header
//   EXPO_PUSH_ACCESS_TOKEN — optional; needed to send push notifications
//
// NOTE: A simple admin interface for trainers to view the queue and submit
// reviews will be needed separately (e.g. a Next.js admin panel or direct
// Supabase Studio access).  Full admin panel is out of scope for this PR.
// ─────────────────────────────────────────────────────────────────────────────

interface TimestampMarker {
  time: number;   // seconds into the video
  note: string;
}

interface RequestBody {
  reviewId: string;
  trainerName: string;
  feedback: string;
  timestamps?: TimestampMarker[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

  // ── Admin key auth ────────────────────────────────────────────────────────
  // This endpoint is for trainers / admin tooling, not end users.
  const adminApiKey = Deno.env.get('ADMIN_API_KEY');
  if (adminApiKey) {
    const providedKey = req.headers.get('X-Admin-Key');
    if (!providedKey || providedKey !== adminApiKey) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { reviewId, trainerName, feedback, timestamps = [] } = body;
  if (!reviewId || !feedback) {
    return jsonResponse({ error: 'reviewId and feedback are required' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const expoPushToken = Deno.env.get('EXPO_PUSH_ACCESS_TOKEN');

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // ── 1. Update expert_reviews record ──────────────────────────────────────
  const { data: review, error: updateError } = await adminClient
    .from('expert_reviews')
    .update({
      status: 'complete',
      trainer_name: trainerName,
      feedback,
      timestamps,
      completed_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select('id, user_id, video_id')
    .single();

  if (updateError || !review) {
    console.error('Update error:', updateError);
    return jsonResponse({ error: 'Review not found or update failed' }, 404);
  }

  // ── 2. Look up Expo push token for the user ───────────────────────────────
  // Push tokens are stored in users table as expo_push_token (to be added in
  // a future PR when push notification infrastructure is set up).
  const { data: userRow } = await adminClient
    .from('users')
    .select('expo_push_token')
    .eq('id', review.user_id)
    .single();

  const pushToken = userRow?.expo_push_token as string | null;

  // ── 3. Send Expo push notification ───────────────────────────────────────
  if (pushToken && pushToken.startsWith('ExponentPushToken[')) {
    const pushPayload = {
      to: pushToken,
      title: 'Your video review is ready',
      body: `${trainerName} has reviewed your training clip. Tap to see the feedback.`,
      data: { reviewId, videoId: review.video_id },
      sound: 'default',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (expoPushToken) {
      headers['Authorization'] = `Bearer ${expoPushToken}`;
    }

    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(pushPayload),
    });

    if (!pushRes.ok) {
      console.warn('Push notification failed (non-fatal):', await pushRes.text());
    }
  } else {
    console.info('No push token for user', review.user_id, '— skipping notification');
  }

  return jsonResponse({ ok: true, reviewId: review.id });
});
