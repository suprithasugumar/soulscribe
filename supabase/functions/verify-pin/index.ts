import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for PIN verification (bcrypt would be better but requires dependencies)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

    const { pin } = await req.json();
    
    if (!pin || typeof pin !== 'string' || pin.length !== 4) {
      return new Response(
        JSON.stringify({ error: 'Invalid PIN format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Get user profile with PIN hash
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('lock_pin_hash, secret_lock_enabled')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    if (!profile.secret_lock_enabled) {
      return new Response(
        JSON.stringify({ error: 'Secret lock not enabled' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Hash the provided PIN and compare
    const hashedPin = await hashPin(pin);
    
    if (hashedPin !== profile.lock_pin_hash) {
      return new Response(
        JSON.stringify({ error: 'Invalid PIN' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Generate a time-limited access token (30 minutes)
    const expiresAt = Date.now() + (30 * 60 * 1000);
    const accessToken = await hashPin(`${user.id}-${expiresAt}`);

    return new Response(JSON.stringify({ 
      success: true,
      accessToken,
      expiresAt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in verify-pin:', error);
    return new Response(JSON.stringify({ 
      error: 'PIN verification failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
