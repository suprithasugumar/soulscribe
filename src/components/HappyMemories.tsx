import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Volume2, VolumeX, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const HappyMemories = () => {
  const [story, setStory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const generateStory = async () => {
    setLoading(true);
    try {
      // Fetch recent entries with happy moods
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("mood, content")
        .in("mood", ["happy", "grateful", "excited", "calm"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!entries || entries.length === 0) {
        toast({
          title: "No happy entries found",
          description: "Create some entries with positive moods first!",
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
        description: "Your happy memories have been woven into a story.",
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
    if (!story) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(story);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
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
          <Sparkles className="h-5 w-5" />
          Happy Memories
        </CardTitle>
        <CardDescription>
          Generate an inspiring story from your positive journal entries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={generateStory} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating story...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
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
