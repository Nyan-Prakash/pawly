import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { consumeQuota, DAY_SECONDS, ipSubject, userSubject } from '../_shared/quota.ts';

// Onboarding calls this before the account exists, so a user JWT is optional.
// Spend is bounded by quotas instead: per user when signed in, per IP when not,
// plus a global daily ceiling as a circuit breaker.
const USER_DAILY_LIMIT = 6;
const IP_DAILY_LIMIT = 4;
const GLOBAL_DAILY_LIMIT = 500;
// Client sends a 1024px JPEG (~0.5 MB base64); anything near this cap is abuse.
const MAX_IMAGE_BASE64_CHARS = 3_000_000;
const OPENAI_TIMEOUT_MS = 90_000;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { imageBase64 } = await req.json();

    if (
      typeof imageBase64 !== 'string' ||
      imageBase64.length === 0 ||
      imageBase64.length > MAX_IMAGE_BASE64_CHARS ||
      !BASE64_RE.test(imageBase64)
    ) {
      return new Response(JSON.stringify({ error: 'A valid image is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // A signed-in caller is metered per user; the anon key (no session) fails
    // getUser and falls through to per-IP metering.
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: authData } = token
      ? await adminClient.auth.getUser(token)
      : { data: { user: null } };
    const callerRule = authData?.user
      ? { subject: userSubject(authData.user.id), limit: USER_DAILY_LIMIT }
      : { subject: await ipSubject(req), limit: IP_DAILY_LIMIT };

    const exhausted = await consumeQuota(adminClient, [
      { ...callerRule, feature: 'avatar', windowSeconds: DAY_SECONDS },
      { subject: 'global', feature: 'avatar', limit: GLOBAL_DAILY_LIMIT, windowSeconds: DAY_SECONDS },
    ]);
    if (exhausted) {
      return new Response(
        JSON.stringify({ error: 'Avatar limit reached for today. Try again tomorrow.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
- Show ONLY the dog’s head and upper neck (no body)
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
      signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', result);
      return new Response(
        JSON.stringify({ error: 'Avatar generation failed. Please try again.' }),
        {
          status: response.status === 401 ? 500 : 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ avatarBase64: result.data[0].b64_json }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Avatar generation failed. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});