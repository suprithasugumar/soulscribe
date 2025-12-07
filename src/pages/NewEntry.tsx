import { useState, useEffect } from "react";
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
import { MediaUploader } from "@/components/MediaUploader";
import { TextEnhancer } from "@/components/TextEnhancer";
import { DoodleGenerator } from "@/components/DoodleGenerator";
import { AIReflection } from "@/components/AIReflection";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { TemplateSelector, TemplateType, EntryTemplate } from "@/components/EntryTemplate";

const NewEntry = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [dailyPrompt, setDailyPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [template, setTemplate] = useState<TemplateType>("minimal");

  // Ensure t is always defined
  if (!t) {
    console.error('Translation object is undefined');
    return null;
  }

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

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error(t?.errorSaving || 'Failed to save entry');
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
        media_urls: mediaUrls,
        is_private: isPrivate,
        template: template,
      });

      if (error) throw error;
      toast.success(t?.entrySaved || 'Entry saved!');
      setShowReflection(true);
      setTimeout(() => navigate("/"), 8500);
    } catch (error: any) {
      toast.error(t?.errorSaving || 'Failed to save entry');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <AIReflection show={showReflection} onClose={() => setShowReflection(false)} />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t?.back || 'Back'}
            </Button>
            <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t?.newEntry || 'New Entry'}
            </h1>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? (t?.saving || 'Saving...') : (t?.save || 'Save')}
            </Button>
          </header>

          {dailyPrompt && (
            <Card className="mb-6 shadow-soft backdrop-blur-sm bg-secondary/20 border-none">
              <CardHeader>
                <CardTitle className="text-lg font-inter flex items-center gap-2">
                  ✨ {t?.todaysPrompt || "Today's Prompt"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-inter italic">{dailyPrompt}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <EntryTemplate template={template} className="rounded-xl p-6">
              <div className="space-y-4">
                <Input
                  placeholder={t?.titlePlaceholder || 'Give your entry a title (optional)'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-playfair border-none focus-visible:ring-0 px-0 bg-transparent"
                />
                
                <div className="space-y-2">
                  <Textarea
                    placeholder={t?.contentPlaceholder || "What's on your mind today?"}
                    value={content || ""}
                    onChange={(e) => setContent(e.target.value || "")}
                    maxLength={50000}
                    className="min-h-[300px] resize-none border-none focus-visible:ring-0 px-0 font-inter bg-transparent"
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {(content || "").length.toLocaleString()} / 50,000 {t?.characterCount || 'characters'}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <TextEnhancer text={content} onTextEnhanced={setContent} />
                  </div>
                </div>
              </div>
            </EntryTemplate>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6">
                <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6 space-y-4">
                <TemplateSelector selected={template} onSelect={setTemplate} />
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
                    {t?.markAsPrivate || 'Mark as private'} 🔒
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="pt-6 space-y-4">
                <MediaUploader onMediaUploaded={setMediaUrls} currentUrls={mediaUrls} />
                <DoodleGenerator text={content} onDoodleGenerated={(url) => setMediaUrls([...mediaUrls, url])} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default NewEntry;