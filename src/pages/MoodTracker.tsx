import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const MoodTracker = () => {
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("mood")
        .not("mood", "is", null);

      if (error) throw error;

      const moodCounts: Record<string, number> = {};
      data?.forEach((entry) => {
        if (entry.mood) {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        }
      });

      setMoodData(moodCounts);
    } catch (error: any) {
      toast.error("Failed to load mood data");
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      happy: "😊",
      sad: "😔",
      calm: "😌",
      anxious: "😰",
      angry: "😡",
      grateful: "🤗",
      tired: "😴",
      excited: "🤩",
    };
    return moodMap[mood] || "📝";
  };

  const maxCount = Math.max(...Object.values(moodData), 1);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mood Tracker
            </h1>
            <div className="w-20" />
          </header>

          <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
            <CardHeader>
              <CardTitle className="font-playfair">Your Emotional Journey</CardTitle>
              <CardDescription className="font-inter">
                Track how you've been feeling over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground font-inter">Loading mood data...</p>
                </div>
              ) : Object.keys(moodData).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground font-inter">
                    No mood data yet. Start tracking your moods by creating entries!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(moodData)
                    .sort(([, a], [, b]) => b - a)
                    .map(([mood, count]) => {
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={mood} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-inter">
                              <span className="text-2xl">{getMoodEmoji(mood)}</span>
                              <span className="capitalize">{mood}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-inter">
                              {count} {count === 1 ? "entry" : "entries"}
                            </span>
                          </div>
                          <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MoodTracker;