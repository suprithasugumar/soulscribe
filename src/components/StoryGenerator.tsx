import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2, Volume2, VolumeX, X } from "lucide-react";
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
        body: { entries, maxLength: "short" },
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

  const narrateStory = () => {
    if (!story) {
      toast({
        title: "No story",
        description: "Generate a story first!",
        variant: "destructive",
      });
      return;
    }

    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(story);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        toast({
          title: "Playing narration",
          description: "Listen to your story!",
        });
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Error",
          description: "Failed to narrate story.",
          variant: "destructive",
        });
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const stopNarration = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Your Story:</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStory("")}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{story}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
