import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.log("Invalid token or user not found:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { answer, deleteOnFailure } = await req.json();

    if (!answer || typeof answer !== "string") {
      console.log("Invalid answer provided");
      return new Response(
        JSON.stringify({ success: false, error: "Answer is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's security answer hash from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("security_answer_hash")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.log("Failed to fetch profile:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.security_answer_hash) {
      console.log("No security answer set for user");
      return new Response(
        JSON.stringify({ success: false, error: "No security answer configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the provided answer and compare server-side
    const providedAnswerHash = await hashString(answer);
    const isCorrect = providedAnswerHash === profile.security_answer_hash;

    console.log(`Security answer verification for user ${user.id}: ${isCorrect ? "correct" : "incorrect"}`);

    // If incorrect and deleteOnFailure is true, delete private entries
    if (!isCorrect && deleteOnFailure) {
      console.log(`Deleting private entries for user ${user.id} due to incorrect security answer`);
      const { error: deleteError } = await supabase
        .from("journal_entries")
        .delete()
        .eq("user_id", user.id)
        .eq("is_private", true);

      if (deleteError) {
        console.error("Error deleting private entries:", deleteError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: isCorrect,
        deleted: !isCorrect && deleteOnFailure 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-security-answer:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
