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

    const { recentEntries } = await req.json();
    
    if (recentEntries && !Array.isArray(recentEntries)) {
      return new Response(
        JSON.stringify({ error: 'Invalid entries format' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (recentEntries && recentEntries.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Too many entries (max 20)' }),
        { status: 400, headers: corsHeaders }
      );
    }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!recentEntries || recentEntries.length === 0) {
      return new Response(JSON.stringify({ 
        reflection: "Great start! Keep journaling to build your self-awareness journey." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const entriesSummary = recentEntries.map((e: any) => 
      `Date: ${new Date(e.created_at).toLocaleDateString()}, Mood: ${e.mood || 'unspecified'}, Tags: ${e.emotion_tags?.join(', ') || 'none'}`
    ).join('\n');

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
          content: `Based on these recent journal entries, provide a brief, encouraging reflection (2-3 sentences max) about their mood trends:\n\n${entriesSummary}\n\nBe warm, supportive, and insightful. Focus on positive patterns or gentle encouragement.`
        }],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status);
      return new Response(JSON.stringify({ 
        reflection: "Thank you for sharing your thoughts today! Keep up the great journaling habit." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const reflection = data.choices[0].message.content;

    return new Response(JSON.stringify({ reflection }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in ai-reflection:', error);
    return new Response(JSON.stringify({ 
      reflection: "Thank you for sharing your thoughts today! Keep up the great journaling habit." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
