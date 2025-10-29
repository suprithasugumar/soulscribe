import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Entry {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  created_at: string;
  media_urls?: string[];
  voice_note_url?: string;
}

export const GratitudeFlashback = () => {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if we should show a flashback (random chance, once per session)
    const hasShownToday = sessionStorage.getItem('flashback_shown');
    if (!hasShownToday && Math.random() > 0.5) {
      fetchRandomPositiveEntry();
      sessionStorage.setItem('flashback_shown', 'true');
    }
  }, []);

  const fetchRandomPositiveEntry = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .in("mood", ["happy", "grateful", "excited", "calm"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data && data.length > 0) {
        // Pick a random entry from the results
        const randomEntry = data[Math.floor(Math.random() * data.length)];
        setEntry(randomEntry);
        setShow(true);
      }
    } catch (error) {
      console.error("Error fetching flashback:", error);
    }
  };

  if (!show || !entry) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Card className="mb-6 shadow-medium backdrop-blur-sm bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5 fill-current" />
            Gratitude Flashback
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShow(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          A positive memory from {formatDate(entry.created_at)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {entry.title && (
          <h3 className="font-semibold text-lg">{entry.title}</h3>
        )}
        <p className="text-sm text-foreground/80 line-clamp-4">{entry.content}</p>
        
        {entry.media_urls && entry.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {entry.media_urls.slice(0, 4).map((url, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden">
                {url.includes('.mp4') || url.includes('.webm') ? (
                  <video src={url} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {entry.voice_note_url && (
          <audio controls className="w-full">
            <source src={entry.voice_note_url} type="audio/webm" />
          </audio>
        )}
      </CardContent>
    </Card>
  );
};
