import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MusicSuggestions } from "@/components/MusicSuggestions";
import { FutureMessage } from "@/components/FutureMessage";
import { PDFExport } from "@/components/PDFExport";
import { HappyMemories } from "@/components/HappyMemories";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";

const AIFeatures = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [currentMood, setCurrentMood] = useState<string>();

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("language_preference")
        .eq("id", user.id)
        .single();

      if (data) {
        setLanguage(data.language_preference || "en");
      }

      // Load the most recent entry's mood
      const { data: recentEntry } = await supabase
        .from("journal_entries")
        .select("mood")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (recentEntry?.mood) {
        setCurrentMood(recentEntry.mood);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Features
            </h1>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <MusicSuggestions mood={currentMood} language={language} />
            <FutureMessage />
            <HappyMemories />
          </div>

          <PDFExport />
        </div>
      </div>
    </AuthGuard>
  );
};

export default AIFeatures;
