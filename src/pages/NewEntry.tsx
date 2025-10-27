import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { MoodSelector } from "@/components/MoodSelector";
import { EmotionTags } from "@/components/EmotionTags";
import { VoiceRecorder } from "@/components/VoiceRecorder";

const NewEntry = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [dailyPrompt, setDailyPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDailyPrompt();
  }, []);

  const fetchDailyPrompt = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_prompts")
        .select("*")
        .limit(1)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setDailyPrompt(data.prompt_text);
      }
    } catch (error) {
      console.error("Failed to fetch daily prompt", error);
    }
  };

  const handleEmotionToggle = (tag: string) => {
    setEmotionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleTranscription = (text: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Please write something before saving");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: title || null,
        content,
        mood: mood || null,
        emotion_tags: emotionTags,
      });

      if (error) throw error;
      toast.success("Entry saved!");
      navigate("/");
    } catch (error: any) {
      toast.error("Failed to save entry");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              New Entry
            </h1>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </header>

          {dailyPrompt && (
            <Card className="mb-6 shadow-soft backdrop-blur-sm bg-secondary/20 border-none">
              <CardHeader>
                <CardTitle className="text-lg font-inter flex items-center gap-2">
                  ✨ Today's Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-inter italic">{dailyPrompt}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Input
                    placeholder="Give your entry a title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-playfair border-none focus-visible:ring-0 px-0"
                  />
                </div>
                
                <div className="flex gap-2 items-start">
                  <Textarea
                    placeholder="What's on your mind today?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px] resize-none border-none focus-visible:ring-0 px-0 font-inter"
                  />
                  <VoiceRecorder onTranscription={handleTranscription} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6">
                <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6">
                <EmotionTags
                  selectedTags={emotionTags}
                  onTagToggle={handleEmotionToggle}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default NewEntry;