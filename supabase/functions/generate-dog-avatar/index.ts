import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageBase64, dogName } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Image is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', result);
      return new Response(
        JSON.stringify({ error: result.error?.message || 'Avatar generation failed' }),
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