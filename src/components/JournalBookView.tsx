import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSignedUrls } from "@/lib/storage-utils";

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  emotion_tags: string[];
  created_at: string;
  media_urls?: string[];
}

interface JournalBookViewProps {
  onClose: () => void;
}

export const JournalBookView = ({ onClose }: JournalBookViewProps) => {
  const [weekEntries, setWeekEntries] = useState<JournalEntry[]>([]);
  const [monthEntries, setMonthEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedMediaUrls, setSignedMediaUrls] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: weekData, error: weekError } = await supabase
        .from("journal_entries")
        .select("*")
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: true });

      const { data: monthData, error: monthError } = await supabase
        .from("journal_entries")
        .select("*")
        .gte("created_at", oneMonthAgo.toISOString())
        .order("created_at", { ascending: true });

      if (weekError) throw weekError;
      if (monthError) throw monthError;

      setWeekEntries(weekData || []);
      setMonthEntries(monthData || []);
      
      // Create signed URLs for all media
      const allEntries = [...(weekData || []), ...(monthData || [])];
      const signedUrls: Record<string, string[]> = {};
      
      for (const entry of allEntries) {
        if (entry.media_urls && entry.media_urls.length > 0) {
          const urls = await createSignedUrls(entry.media_urls.slice(0, 3));
          signedUrls[entry.id] = urls;
        }
      }
      setSignedMediaUrls(signedUrls);
    } catch (error) {
      toast.error("Failed to load journal entries");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood?: string) => {
    const moodMap: Record<string, string> = {
      happy: "😊", sad: "😔", calm: "😌", anxious: "😰",
      angry: "😡", grateful: "🤗", tired: "😴", excited: "🤩",
    };
    return moodMap[mood || ""] || "✨";
  };

  const getDoodlePattern = (index: number) => {
    const patterns = ["🌸", "🌟", "🎨", "🦋", "🌈", "☀️", "🌙", "💫", "🍃", "🎭"];
    return patterns[index % patterns.length];
  };

  const JournalPage = ({ entries }: { entries: JournalEntry[] }) => (
    <div className="space-y-8">
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-handwriting text-lg">
            No entries yet for this period. Start writing to see your beautiful journal!
          </p>
        </div>
      ) : (
        entries.map((entry, index) => (
          <Card
            key={entry.id}
            className="relative overflow-hidden bg-gradient-to-br from-background via-card to-secondary/10 border-2 border-dashed border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform hover:scale-[1.02] transition-all duration-300"
            style={{
              transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)`,
            }}
          >
            {/* Decorative corner doodles */}
            <div className="absolute top-2 left-2 text-2xl opacity-40">
              {getDoodlePattern(index)}
            </div>
            <div className="absolute top-2 right-2 text-2xl opacity-40">
              {getDoodlePattern(index + 1)}
            </div>
            <div className="absolute bottom-2 left-2 text-2xl opacity-40">
              {getDoodlePattern(index + 2)}
            </div>
            <div className="absolute bottom-2 right-2 text-2xl opacity-40">
              {getDoodlePattern(index + 3)}
            </div>

            {/* Tape effect */}
            <div className="absolute top-0 left-1/4 w-20 h-8 bg-primary/10 border-t-2 border-b-2 border-primary/20 transform -translate-y-1/2 rotate-[-5deg]" />
            <div className="absolute top-0 right-1/4 w-20 h-8 bg-accent/10 border-t-2 border-b-2 border-accent/20 transform -translate-y-1/2 rotate-[5deg]" />

            <CardContent className="p-8 space-y-4">
              {/* Date ribbon */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 px-4 py-2 rounded-full border-2 border-primary/30">
                  <span className="font-handwriting text-sm text-primary font-bold">
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span className="text-4xl">{getMoodEmoji(entry.mood)}</span>
              </div>

              {/* Title with handwritten style */}
              {entry.title && (
                <h3 className="text-2xl font-handwriting font-bold text-foreground border-b-2 border-dashed border-primary/20 pb-2">
                  {entry.title}
                </h3>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <p className="font-handwriting text-base leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {entry.content.length > 300 ? entry.content.slice(0, 300) + "..." : entry.content}
                </p>
              </div>

              {/* Media gallery with polaroid style */}
              {signedMediaUrls[entry.id] && signedMediaUrls[entry.id].length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6">
                  {signedMediaUrls[entry.id].map((url, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-card p-2 pb-8 shadow-[0_4px_20px_rgba(0,0,0,0.1)] transform hover:scale-110 transition-all"
                      style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
                    >
                      <img
                        src={url}
                        alt={`Memory ${i + 1}`}
                        className="w-32 h-32 object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Emotion tags with sticker style */}
              {entry.emotion_tags && entry.emotion_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {entry.emotion_tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-foreground font-handwriting text-sm border-2 border-primary/30 shadow-sm transform hover:scale-110 transition-transform"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-handwriting">Creating your journal book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKDI2MiA4MyUgNTglIC8gMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] bg-gradient-to-br from-background via-muted to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onClose} className="gap-2 font-handwriting">
            <ArrowLeft className="h-4 w-4" />
            Back to Entries
          </Button>
          <h1 className="text-4xl font-playfair font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Journal Book
          </h1>
          <Button variant="outline" className="gap-2 font-handwriting">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </header>

        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card/80 backdrop-blur-sm">
            <TabsTrigger value="week" className="font-handwriting text-base">
              📅 Past Week
            </TabsTrigger>
            <TabsTrigger value="month" className="font-handwriting text-base">
              📆 Past Month
            </TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="mt-0">
            <JournalPage entries={weekEntries} />
          </TabsContent>

          <TabsContent value="month" className="mt-0">
            <JournalPage entries={monthEntries} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};