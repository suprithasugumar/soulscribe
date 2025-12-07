import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { X, Calendar, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createSignedUrl } from "@/lib/storage-utils";

interface TimelineEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  created_at: string;
  media_urls: string[] | null;
}

const moodColors: Record<string, string> = {
  happy: "bg-yellow-400",
  sad: "bg-blue-400",
  anxious: "bg-purple-400",
  excited: "bg-orange-400",
  calm: "bg-green-400",
  grateful: "bg-pink-400",
  angry: "bg-red-400",
  neutral: "bg-gray-400",
};

const moodGradients: Record<string, string> = {
  happy: "from-yellow-400/20 to-yellow-600/20",
  sad: "from-blue-400/20 to-blue-600/20",
  anxious: "from-purple-400/20 to-purple-600/20",
  excited: "from-orange-400/20 to-orange-600/20",
  calm: "from-green-400/20 to-green-600/20",
  grateful: "from-pink-400/20 to-pink-600/20",
  angry: "from-red-400/20 to-red-600/20",
  neutral: "from-gray-400/20 to-gray-600/20",
};

interface MemoryTimelineProps {
  onClose: () => void;
}

export const MemoryTimeline = ({ onClose }: MemoryTimelineProps) => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedMediaUrls, setSignedMediaUrls] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, title, content, mood, created_at, media_urls")
        .eq("user_id", user.id)
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setEntries(data || []);
      
      // Create signed URLs for all media
      const signedUrls: Record<string, string> = {};
      for (const entry of data || []) {
        if (entry.media_urls && entry.media_urls.length > 0) {
          const firstMediaUrl = entry.media_urls[0];
          signedUrls[firstMediaUrl] = await createSignedUrl(firstMediaUrl);
        }
      }
      setSignedMediaUrls(signedUrls);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupEntriesByMonth = () => {
    const grouped: Record<string, TimelineEntry[]> = {};
    entries.forEach((entry) => {
      const monthYear = format(new Date(entry.created_at), "MMMM yyyy");
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(entry);
    });
    return grouped;
  };

  const groupedEntries = groupEntriesByMonth();

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-playfair font-bold">Memory Timeline</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : entries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No entries yet. Start journaling to see your memory timeline!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/50" />

            {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
              <div key={monthYear} className="mb-8">
                {/* Month header */}
                <div className="flex items-center gap-4 mb-6 relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg z-10">
                    <span className="text-xs font-bold text-primary-foreground text-center leading-tight">
                      {format(new Date(monthEntries[0].created_at), "MMM")}<br/>
                      {format(new Date(monthEntries[0].created_at), "yyyy")}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{monthYear}</h2>
                </div>

                {/* Entries for this month */}
                <div className="space-y-4 ml-8">
                  {monthEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="relative pl-8 cursor-pointer group"
                      onClick={() => navigate(`/entry/${entry.id}`)}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-4 w-4 h-4 rounded-full ${moodColors[entry.mood || "neutral"]} border-2 border-background shadow-md z-10 group-hover:scale-125 transition-transform`} />
                      
                      {/* Entry card */}
                      <Card className={`ml-4 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02] bg-gradient-to-br ${moodGradients[entry.mood || "neutral"]}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Preview image */}
                            {entry.media_urls && entry.media_urls.length > 0 && (
                              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={signedMediaUrls[entry.media_urls[0]] || entry.media_urls[0]}
                                  alt="Entry media"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(entry.created_at), "EEE, MMM d 'at' h:mm a")}
                                </span>
                                {entry.mood && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${moodColors[entry.mood]} text-white`}>
                                    {entry.mood}
                                  </span>
                                )}
                              </div>
                              
                              {entry.title && (
                                <h3 className="font-semibold text-foreground mb-1 truncate">
                                  {entry.title}
                                </h3>
                              )}
                              
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {entry.content}
                              </p>
                              
                              {entry.media_urls && entry.media_urls.length > 1 && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                  <ImageIcon className="h-3 w-3" />
                                  <span>+{entry.media_urls.length - 1} more</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
