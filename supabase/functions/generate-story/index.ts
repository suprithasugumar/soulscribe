import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const { entries, maxLength } = await req.json();
    
    if (!Array.isArray(entries) || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid entries array' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (entries.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Too many entries (max 20)' }),
        { status: 400, headers: corsHeaders }
      );
    }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const entriesText = entries.map((e: any) => 
      `Mood: ${e.mood || 'unspecified'}. ${e.content}`
    ).join('\n\n');

    const lengthInstruction = maxLength === "short" 
      ? "Keep the story to 3-4 short paragraphs maximum (about 150 words)." 
      : "Create a short story (no more than 200 words).";

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Create a short, creative story based on these journal entries:\n\n${entriesText}\n\nMake it inspiring and reflective. ${lengthInstruction}`
        }],
      }),
    });

    const data = await response.json();
    const story = data.choices[0].message.content;

    return new Response(JSON.stringify({ story }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});