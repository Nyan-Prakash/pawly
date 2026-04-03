import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Max base64 payload size: ~5 MB base64 ≈ 3.75 MB raw image
const MAX_IMAGE_BASE64_LENGTH = 5_000_000;
// Max avatar generations per user per day (free tier)
const MAX_AVATAR_GENS_PER_DAY = 3;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
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
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  // Max MAX_AVATAR_GENS_PER_DAY avatar generations per user per day
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const { count } = await adminClient
    .from('avatar_generation_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', dayStart.toISOString());

  if ((count ?? 0) >= MAX_AVATAR_GENS_PER_DAY) {
    return jsonResponse(
      { error: `Daily avatar generation limit (${MAX_AVATAR_GENS_PER_DAY}) reached. Try again tomorrow.` },
      429
    );
  }

  try {
    const body = await req.json();
    const { imageBase64, dogName } = body;

    if (!imageBase64) {
      return jsonResponse({ error: 'Image is required' }, 400);
    }

    // ── Input size guard ──────────────────────────────────────────────────
    if (typeof imageBase64 !== 'string' || imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
      return jsonResponse({ error: 'Image too large. Maximum size is ~3.75 MB.' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return jsonResponse({ error: 'OpenAI API key not configured' }, 500);
    }

    // Decode base64 → PNG binary
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });

    // ✅ FLAT ICON HEADSHOT PROMPT
    const prompt = `
Convert this dog photo into a clean, standardized flat cartoon avatar.

Style:
- Flat vector icon style
- No gradients, no shadows, no textures
- Solid color fills only
- Bold, uniform black outlines
- Simple geometric shapes (circles, rounded shapes)
- Limited color palette (4–6 muted pastel colors)
- Consistent line weight across the entire image

Composition:
- Show ONLY the dog's head and upper neck (no body)
- Centered and facing forward (symmetrical)
- Head fills ~70–80% of the frame
- Eyes slightly above center line
- Circular or square centered crop

Background:
- Plain white or very light neutral color
- No patterns, no scenery

Consistency rules:
- Same simplification level across all breeds
- Preserve key breed features (ears, snout shape, colors)
- No accessories, no humans, no text

The result must look like a standardized app avatar (similar to Material Design icon or emoji style).
`;

    const formData = new FormData();
    formData.append('image', blob, 'dog.png');
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    formData.append('size', '1024x1024');
    formData.append('n', '1');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', result?.error?.message ?? 'Unknown error');
      return jsonResponse(
        { error: result.error?.message || 'Avatar generation failed' },
        response.status === 401 ? 500 : 502
      );
    }

    // ── Log successful generation for rate limiting ────────────────────────
    await adminClient.from('avatar_generation_logs').insert({ user_id: user.id });

    return jsonResponse({ avatarBase64: result.data[0].b64_json });
  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
    return jsonResponse({ error: 'Avatar generation failed. Please try again.' }, 500);
  }
});
