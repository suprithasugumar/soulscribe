import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const StoryGenerator = () => {
  const [story, setStory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const { toast } = useToast();

  const generateStory = async () => {
    setLoading(true);
    try {
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("mood, content")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!entries || entries.length === 0) {
        toast({
          title: "No entries found",
          description: "Create some entries first!",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error: functionError } = await supabase.functions.invoke("generate-story", {
        body: { entries },
      });

      if (functionError) throw functionError;

      setStory(data.story || "");
      toast({
        title: "Story generated!",
        description: "Your journal entries have been woven into a story.",
      });
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "Error",
        description: "Failed to generate story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const narrateStory = async () => {
    if (!story) {
      toast({
        title: "No story",
        description: "Generate a story first!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text: story },
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: "audio/mp3" }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        const audio = new Audio(url);
        audio.play();
        setIsPlaying(true);
        
        audio.onended = () => setIsPlaying(false);
        
        toast({
          title: "Playing narration",
          description: "Listen to your story!",
        });
      }
    } catch (error) {
      console.error("Error narrating story:", error);
      toast({
        title: "Error",
        description: "Failed to narrate story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stopNarration = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Story Generator
        </CardTitle>
        <CardDescription>
          Generate a creative story from your journal entries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={generateStory} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Generate Story
              </>
            )}
          </Button>
          
          {story && (
            <Button
              onClick={isPlaying ? stopNarration : narrateStory}
              disabled={loading}
              variant="outline"
            >
              {isPlaying ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {story && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Your Story:</h4>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{story}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
