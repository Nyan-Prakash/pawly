import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─────────────────────────────────────────────────────────────────────────────
// notify-expert-review
//
// Triggered by the app (via supabase.functions.invoke) when a user requests an
// expert review.  Sends an email to the trainer queue admin via Resend.
//
// Required Supabase secrets:
//   RESEND_API_KEY      — your Resend API key
//   TRAINER_QUEUE_EMAIL — destination email for the trainer inbox
// ─────────────────────────────────────────────────────────────────────────────

interface RequestBody {
  videoId: string;
  userId: string;
}

interface VideoRow {
  id: string;
  user_id: string;
  dog_id: string;
  storage_path: string;
  context: string;
  behavior_context: string | null;
  before_context: string | null;
  goal_context: string | null;
  duration_seconds: number;
  uploaded_at: string;
}

interface DogRow {
  name: string;
  breed: string | null;
  age_months: number | null;
  sex: string | null;
  behavior_goals: string[];
  training_experience: string | null;
}

interface ReviewRow {
  id: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

  // ── Validate JWT ───────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const trainerEmail = Deno.env.get('TRAINER_QUEUE_EMAIL') ?? 'trainers@pawlyapp.com';

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { videoId, userId } = body;
  if (!videoId || !userId) {
    return jsonResponse({ error: 'videoId and userId are required' }, 400);
  }

  // ── Fetch video, dog, and review data ─────────────────────────────────────
  const [videoResult, reviewResult] = await Promise.all([
    adminClient
      .from('videos')
      .select('id, user_id, dog_id, storage_path, context, behavior_context, before_context, goal_context, duration_seconds, uploaded_at')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single(),

    adminClient
      .from('expert_reviews')
      .select('id')
      .eq('video_id', videoId)
      .single(),
  ]);

  if (videoResult.error || !videoResult.data) {
    return jsonResponse({ error: 'Video not found' }, 404);
  }

  const video = videoResult.data as VideoRow;
  const review = reviewResult.data as ReviewRow | null;

  // Fetch dog profile
  const { data: dog } = await adminClient
    .from('dogs')
    .select('name, breed, age_months, sex, behavior_goals, training_experience')
    .eq('id', video.dog_id)
    .single();

  const dogData = dog as DogRow | null;

  // ── Build email ───────────────────────────────────────────────────────────
  const supabaseProjectRef = supabaseUrl.replace('https://', '').split('.')[0];
  const videoAdminUrl = `https://supabase.com/dashboard/project/${supabaseProjectRef}/storage/buckets/pawly-videos`;

  const ageLabel = dogData?.age_months
    ? `${dogData.age_months} months`
    : 'Age unknown';

  const emailHtml = `
<h2>New Expert Review Request</h2>
<p><strong>Review ID:</strong> ${review?.id ?? 'pending'}</p>
<p><strong>Video ID:</strong> ${videoId}</p>
<p><strong>Requested at:</strong> ${new Date().toUTCString()}</p>

<h3>Dog Profile</h3>
<ul>
  <li><strong>Name:</strong> ${dogData?.name ?? 'Unknown'}</li>
  <li><strong>Breed:</strong> ${dogData?.breed ?? 'Unknown'}</li>
  <li><strong>Age:</strong> ${ageLabel}</li>
  <li><strong>Sex:</strong> ${dogData?.sex ?? 'Unknown'}</li>
  <li><strong>Behavior goals:</strong> ${dogData?.behavior_goals?.join(', ') ?? 'Not specified'}</li>
  <li><strong>Training experience:</strong> ${dogData?.training_experience ?? 'Unknown'}</li>
</ul>

<h3>Video Context</h3>
<ul>
  <li><strong>Category:</strong> ${video.behavior_context?.replace(/_/g, ' ') ?? video.context}</li>
  <li><strong>Duration:</strong> ${video.duration_seconds}s</li>
  ${video.before_context ? `<li><strong>What happened before:</strong> ${video.before_context}</li>` : ''}
  ${video.goal_context ? `<li><strong>Owner's goal:</strong> ${video.goal_context}</li>` : ''}
</ul>

<h3>Access</h3>
<p>
  View the video in Supabase Storage:<br/>
  <a href="${videoAdminUrl}">${videoAdminUrl}</a>
</p>
<p>Storage path: <code>${video.storage_path}</code></p>

<hr/>
<p><em>To submit your review, use the complete-expert-review Edge Function or update the expert_reviews table directly in Supabase Studio.</em></p>
  `.trim();

  // ── Send email via Resend ─────────────────────────────────────────────────
  if (!resendApiKey) {
    // No Resend key configured — log and return success (non-blocking)
    console.warn('RESEND_API_KEY not set — skipping email notification');
    return jsonResponse({ ok: true, emailSent: false });
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Pawly Reviews <noreply@pawlyapp.com>',
      to: [trainerEmail],
      subject: `[Pawly] New review request — ${dogData?.name ?? 'Dog'} (${video.behavior_context?.replace(/_/g, ' ') ?? video.context})`,
      html: emailHtml,
    }),
  });

  if (!emailRes.ok) {
    console.error('Resend email delivery failed, status:', emailRes.status);
    // Non-fatal — review record was already created
    return jsonResponse({ ok: true, emailSent: false, emailError: `Email delivery failed (${emailRes.status})` });
  }

  return jsonResponse({ ok: true, emailSent: true });
});
