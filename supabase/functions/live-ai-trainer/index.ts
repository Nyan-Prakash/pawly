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

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Missing auth header' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !user) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { dogId, frames, userUtterance, stepContext, samplingMode } = body;

  // 1. Fetch Dog Context
  const { data: dog } = await adminClient
    .from('dogs')
    .select('name, breed, age_months')
    .eq('id', dogId)
    .single();

  const dogName = dog?.name || 'your dog';

  // 2. Prepare Multimodal Messages
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
