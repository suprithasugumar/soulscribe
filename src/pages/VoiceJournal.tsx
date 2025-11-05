import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { MoodSelector } from "@/components/MoodSelector";
import { EmotionTags } from "@/components/EmotionTags";
import { VoiceJournalRecorder } from "@/components/VoiceJournalRecorder";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";

const VoiceJournal = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleEmotionToggle = (tag: string) => {
    setEmotionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleTranscriptionComplete = (transcription: string, audioUrl: string) => {
    setContent(transcription);
    setVoiceNoteUrl(audioUrl);
  };

  const saveEntry = async () => {
    if (!content.trim()) {
      toast.error("Please add some content to your entry");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: title || null,
        content: content,
        mood: mood || null,
        emotion_tags: emotionTags,
        voice_note_url: voiceNoteUrl || null,
        is_private: isPrivate,
      });

      if (error) throw error;

      toast.success(t.entrySaved);
      navigate("/");
    } catch (error: any) {
      console.error("Error saving entry:", error);
      toast.error(t.errorSaving);
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
              {t.back}
            </Button>
            <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Voice Journal
            </h1>
            <Button onClick={saveEntry} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? t.saving : t.save}
            </Button>
          </header>

          <div className="space-y-6">
            <VoiceJournalRecorder onTranscriptionComplete={handleTranscriptionComplete} />

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Input
                    placeholder={t.titlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-playfair border-none focus-visible:ring-0 px-0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Textarea
                    placeholder="Your transcribed voice entry will appear here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px] resize-none border-none focus-visible:ring-0 px-0 font-inter"
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {content.length.toLocaleString()} {t.characterCount}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6">
                <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6 space-y-4">
                <EmotionTags
                  selectedTags={emotionTags}
                  onTagToggle={handleEmotionToggle}
                />
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Switch
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                  <Label htmlFor="private" className="cursor-pointer">
                    {t.markAsPrivate} 🔒
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default VoiceJournal;
