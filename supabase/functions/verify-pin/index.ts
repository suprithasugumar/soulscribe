import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

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
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pin } = await req.json();
    
    if (!pin || typeof pin !== 'string' || pin.length !== 4) {
      return new Response(
        JSON.stringify({ error: 'Invalid PIN format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile with PIN hash and rate limiting fields
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('lock_pin_hash, secret_lock_enabled, pin_failed_attempts, pin_locked_until')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.secret_lock_enabled) {
      return new Response(
        JSON.stringify({ error: 'Secret lock not enabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if account is locked
    if (profile.pin_locked_until) {
      const lockedUntil = new Date(profile.pin_locked_until);
      const now = new Date();
      
      if (now < lockedUntil) {
        const remainingMinutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / (1000 * 60));
        console.log(`PIN verification blocked - account locked for user ${user.id}`);
        return new Response(
          JSON.stringify({ 
            error: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
            locked: true,
            lockedUntil: profile.pin_locked_until
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Hash the provided PIN and compare
    const hashedPin = await hashPin(pin);
    
    if (hashedPin !== profile.lock_pin_hash) {
      // Increment failed attempts
      const newFailedAttempts = (profile.pin_failed_attempts || 0) + 1;
      const updateData: Record<string, unknown> = { pin_failed_attempts: newFailedAttempts };
      
      // Lock account if max attempts exceeded
      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
        updateData.pin_locked_until = lockUntil.toISOString();
        console.log(`Account locked for user ${user.id} after ${newFailedAttempts} failed PIN attempts`);
      }
      
      // Update failed attempts using service role (bypasses RLS)
      const serviceSupabase = createClient(supabaseUrl, supabaseKey);
      await serviceSupabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      const attemptsRemaining = MAX_FAILED_ATTEMPTS - newFailedAttempts;
      
      if (attemptsRemaining <= 0) {
        return new Response(
          JSON.stringify({ 
            error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
            locked: true
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Invalid PIN. ${attemptsRemaining} attempt(s) remaining.`,
          attemptsRemaining
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reset failed attempts on successful verification
    const serviceSupabase = createClient(supabaseUrl, supabaseKey);
    await serviceSupabase
      .from('profiles')
      .update({ pin_failed_attempts: 0, pin_locked_until: null })
      .eq('id', user.id);

    // Generate a time-limited access token (30 minutes)
    const expiresAt = Date.now() + (30 * 60 * 1000);
    const accessToken = await hashPin(`${user.id}-${expiresAt}`);

    console.log(`PIN verified successfully for user ${user.id}`);
    
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
