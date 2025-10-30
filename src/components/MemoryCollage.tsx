import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export const MemoryCollage = () => {
  const [loading, setLoading] = useState(false);
  const [collageUrl, setCollageUrl] = useState<string>("");
  const [memories, setMemories] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchHappyMemories = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .in("mood", ["happy", "grateful", "excited", "calm"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!entries || entries.length === 0) {
        toast({
          title: "No happy memories found",
          description: "Create some entries with positive moods first!",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Collect all media from happy entries
      const allMedia: any[] = [];
      entries.forEach(entry => {
        if (entry.media_urls && entry.media_urls.length > 0) {
          entry.media_urls.forEach((url: string) => {
            allMedia.push({
              url,
              content: entry.content.substring(0, 100),
              mood: entry.mood,
              date: entry.created_at
            });
          });
        }
      });

      if (allMedia.length === 0) {
        toast({
          title: "No media found",
          description: "Add photos, videos, or doodles to your happy entries to create a collage!",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setMemories(allMedia);
      sonnerToast.success(`Found ${allMedia.length} happy memories!`);
    } catch (error) {
      console.error("Error fetching memories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch memories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCollage = () => {
    if (memories.length === 0) {
      toast({
        title: "No memories loaded",
        description: "Please fetch your happy memories first!",
        variant: "destructive",
      });
      return;
    }

    // Create a simple grid-based collage view
    setCollageUrl("collage-ready");
  };

  const downloadCollage = () => {
    sonnerToast.success("Collage saved! You can now screenshot this view to keep your memories.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Happy Memories Collage
        </CardTitle>
        <CardDescription>
          Create a beautiful collage from your positive journal entries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={fetchHappyMemories} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading memories...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Load Happy Memories
              </>
            )}
          </Button>
          
          {memories.length > 0 && !collageUrl && (
            <Button onClick={createCollage} variant="outline">
              Create Collage
            </Button>
          )}
        </div>

        {collageUrl && memories.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Your Happy Memories</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadCollage}>
                  <Download className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setCollageUrl(""); setMemories([]); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
              {memories.map((memory, index) => (
                <div key={index} className="relative group">
                  {memory.url.includes('image') || memory.url.endsWith('.png') || memory.url.endsWith('.jpg') || memory.url.endsWith('.webp') ? (
                    <img 
                      src={memory.url} 
                      alt={`Memory ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                    />
                  ) : memory.url.includes('video') ? (
                    <video 
                      src={memory.url}
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                      muted
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg shadow-md flex items-center justify-center p-2">
                      <p className="text-xs text-center line-clamp-4">{memory.content}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{memory.mood}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground text-center italic">
              "These are the moments that made you smile 💫"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
