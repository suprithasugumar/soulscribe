import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MusicSuggestionsProps {
  mood?: string;
}

export const MusicSuggestions = ({ mood }: MusicSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const { toast } = useToast();

  const getSuggestions = async () => {
    if (!mood) {
      toast({
        title: "No mood selected",
        description: "Please select a mood first to get music suggestions.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-music", {
        body: { mood, language },
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error getting music suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to get music suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Music Suggestions
        </CardTitle>
        <CardDescription>
          Get personalized music recommendations based on your mood
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={getSuggestions} disabled={loading || !mood} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting suggestions...
            </>
          ) : (
            "Suggest Music"
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recommended for your {mood} mood:</h4>
            <ul className="space-y-2">
              {suggestions.map((song, index) => {
                const spotifySearch = `https://open.spotify.com/search/${encodeURIComponent(song)}`;
                const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`;
                
                return (
                  <li key={index} className="text-sm p-3 bg-muted rounded-md space-y-2">
                    <div className="font-medium">{song}</div>
                    <div className="flex gap-2">
                      <a
                        href={spotifySearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        🎵 Open in Spotify
                      </a>
                      <span className="text-xs text-muted-foreground">•</span>
                      <a
                        href={youtubeSearch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        ▶️ Search on YouTube
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
