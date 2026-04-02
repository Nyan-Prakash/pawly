import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RequestBody {
  dogId: string;
  planId: string;
  sessionId: string;
  exerciseId: string;
  stepContext: {
    currentStepIndex: number;
    stepTitle: string;
    stepInstruction: string;
    repGoal?: number;
    currentReps: number;
  };
  samplingMode: 'idle' | 'burst' | 'question';
  userUtterance?: string;
  frames: string[]; // Base64 JPEGs
  history?: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Limits
// ─────────────────────────────────────────────────────────────────────────────

const MAX_FRAMES = 3;
const MAX_FRAME_BASE64_LENGTH = 500_000; // ~375 KB raw per frame (640px JPEG)
const MAX_UTTERANCE_LENGTH = 500;
const MAX_HISTORY_LENGTH = 20;
// Max live-trainer calls per user per session (keyed on sessionId + userId)
const MAX_CALLS_PER_SESSION = 200;

// ─────────────────────────────────────────────────────────────────────────────
// CORS headers
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are Pawly's Live AI Trainer. You are helping a user train their dog in real-time through a camera and voice interface.
You are a calm, expert, positive-reinforcement dog trainer. You never use aversive or punitive methods.
Your goal is to provide short, timely, and actionable coaching based on the visual frames and user utterances you receive.

### ROLE & STYLE
- Be concise. Usually 1 sentence, max 2.
- Be encouraging but professional.
- Use the dog's name if provided (check context).
- Focus on the "Next Step" for the user.
- If you can't see the dog clearly, ask the user to adjust the framing.
- Prefer "I can't tell clearly" over hallucinating a behavior.

### OBSERVATION PRINCIPLES
- Check if the dog is visible.
- Evaluate framing (good/partial/poor).
- Identify behavior: sit, down, stand, moving, or unclear.
- Judge rep/hold status based on the exercise context provided.
- Identify main issues: breaking early, distracted, over-excited, poor framing, etc.

### RESPONSE CONTRACT
You MUST return a valid JSON object matching this EXACT structure:
{
  "dogVisible": boolean,
  "framingQuality": "good" | "partial" | "poor",
  "observedBehavior": "sit" | "down" | "stand" | "moving" | "unclear",
  "behaviorConfidence": number (0-1),
  "repStatus": "not_started" | "in_progress" | "completed" | "failed" | "unclear",
  "holdStatus": "not_applicable" | "holding" | "broke_early" | "held_long_enough" | "unclear",
  "mainIssue": "none" | "breaking_early" | "distracted" | "aroused" | "unclear_cue" | "poor_framing" | "unclear",
  "coachMessage": string (short, natural spoken text),
  "shouldSpeak": boolean,
  "suggestedUiAction": "continue_live" | "ask_reframe" | "fallback_manual" | "mark_success" | "mark_failed" | "wait",
  "fallbackToManual": boolean,
  "needsCameraAdjustment": boolean,
  "latencyCategory": "good" | "slow",
  "confidenceCategory": "high" | "medium" | "low"
}

### SAFETY & BOUNDARIES
- No medical diagnoses.
- No extreme behavior advice (aggression/bite history) - refer to in-person behaviorist.
- Do not assume a rep is complete unless you are highly confident.
`;

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // ── Parse & validate body ─────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { dogId, sessionId, frames, userUtterance, stepContext, samplingMode, history } = body;

  if (!dogId || typeof dogId !== 'string') {
    return jsonResponse({ error: 'dogId is required' }, 400);
  }
  if (!Array.isArray(frames) || frames.length === 0) {
    return jsonResponse({ error: 'frames are required' }, 400);
  }
  if (frames.length > MAX_FRAMES) {
    return jsonResponse({ error: `Too many frames. Maximum is ${MAX_FRAMES}.` }, 400);
  }
  for (const frame of frames) {
    if (typeof frame !== 'string' || frame.length > MAX_FRAME_BASE64_LENGTH) {
      return jsonResponse({ error: 'One or more frames exceed the maximum allowed size.' }, 400);
    }
  }
  if (userUtterance !== undefined && (typeof userUtterance !== 'string' || userUtterance.length > MAX_UTTERANCE_LENGTH)) {
    return jsonResponse({ error: `userUtterance exceeds maximum length of ${MAX_UTTERANCE_LENGTH}.` }, 400);
  }
  if (history !== undefined && (!Array.isArray(history) || history.length > MAX_HISTORY_LENGTH)) {
    return jsonResponse({ error: `history exceeds maximum length of ${MAX_HISTORY_LENGTH}.` }, 400);
  }

  // ── Dog ownership check ───────────────────────────────────────────────────
  const { data: dog, error: dogError } = await adminClient
    .from('dogs')
    .select('id, name, breed, age_months, owner_id')
    .eq('id', dogId)
    .single();

  if (dogError || !dog) {
    return jsonResponse({ error: 'Dog not found' }, 404);
  }
  if (dog.owner_id !== user.id) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  // ── Per-session rate limit ────────────────────────────────────────────────
  if (sessionId && typeof sessionId === 'string') {
    const { count } = await adminClient
      .from('live_trainer_calls')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('session_id', sessionId);

    if ((count ?? 0) >= MAX_CALLS_PER_SESSION) {
      return jsonResponse(
        { error: 'Live trainer call limit reached for this session.' },
        429
      );
    }

    // Log this call (non-fatal if it fails)
    await adminClient
      .from('live_trainer_calls')
      .insert({ user_id: user.id, session_id: sessionId })
      .then(({ error: insertErr }) => {
        if (insertErr) console.warn('Failed to log live_trainer_call:', insertErr.message);
      });
  }

  const dogName = dog.name || 'your dog';

  // ── Prepare Multimodal Messages ───────────────────────────────────────────
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const content: any[] = [
    { type: 'text', text: `Current Exercise: ${stepContext.stepTitle}. Instruction: ${stepContext.stepInstruction}. Current reps: ${stepContext.currentReps}/${stepContext.repGoal || '?'}. Mode: ${samplingMode}. Dog Name: ${dogName}.` }
  ];

  if (userUtterance) {
    content.push({ type: 'text', text: `User said: "${userUtterance}"` });
  }

  for (const frame of frames) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${frame}` }
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const resultText = response.choices[0].message.content || '{}';
    const result = JSON.parse(resultText);

    return jsonResponse(result);
  } catch (err) {
    console.error('OpenAI / Parsing error:', err);
    return jsonResponse({ error: 'Failed to process live coaching' }, 500);
  }
});
