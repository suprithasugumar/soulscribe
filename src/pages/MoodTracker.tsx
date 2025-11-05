import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfDay } from "date-fns";

interface MoodEntry {
  mood: string;
  created_at: string;
}

const MoodTracker = () => {
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState<Record<string, number>>({});
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodData();
    fetchRecentMoods();
    fetchWeeklyTrend();
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

  const fetchRecentMoods = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("mood, created_at")
        .not("mood", "is", null)
        .order("created_at", { ascending: false })
        .limit(7);

      if (error) throw error;
      setRecentMoods(data || []);
    } catch (error: any) {
      console.error("Failed to load recent moods:", error);
    }
  };

  const fetchWeeklyTrend = async () => {
    try {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
      const { data, error } = await supabase
        .from("journal_entries")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      if (error) throw error;

      const dailyCounts = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
        dailyCounts.set(date, 0);
      }

      data?.forEach((entry) => {
        const date = format(new Date(entry.created_at), "yyyy-MM-dd");
        dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
      });

      const trendData = Array.from(dailyCounts.entries()).map(([date, count]) => ({
        date,
        count,
      }));

      setWeeklyTrend(trendData);
    } catch (error: any) {
      console.error("Failed to load weekly trend:", error);
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

  const getMostFrequentMood = () => {
    if (Object.keys(moodData).length === 0) return null;
    return Object.entries(moodData).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const getTrendDirection = () => {
    if (recentMoods.length < 2) return "neutral";
    const positiveMoods = ["happy", "excited", "grateful", "calm"];
    const recentPositive = recentMoods.slice(0, 3).filter((m) => positiveMoods.includes(m.mood)).length;
    const olderPositive = recentMoods.slice(3, 6).filter((m) => positiveMoods.includes(m.mood)).length;
    
    if (recentPositive > olderPositive) return "up";
    if (recentPositive < olderPositive) return "down";
    return "neutral";
  };

  const maxCount = Math.max(...Object.values(moodData), 1);
  const mostFrequentMood = getMostFrequentMood();
  const trendDirection = getTrendDirection();
  const maxWeeklyCount = Math.max(...weeklyTrend.map(d => d.count), 1);

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

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardHeader className="pb-3">
                <CardDescription>Total Entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.values(moodData).reduce((a, b) => a + b, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardHeader className="pb-3">
                <CardDescription>Most Frequent Mood</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">
                  {mostFrequentMood ? (
                    <div className="flex items-center gap-2">
                      {getMoodEmoji(mostFrequentMood)}
                      <span className="capitalize text-xl">{mostFrequentMood}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No data</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardHeader className="pb-3">
                <CardDescription>Recent Trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {trendDirection === "up" ? (
                    <>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <span className="text-xl font-semibold text-green-500">Improving</span>
                    </>
                  ) : trendDirection === "down" ? (
                    <>
                      <TrendingDown className="h-8 w-8 text-orange-500" />
                      <span className="text-xl font-semibold text-orange-500">Declining</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xl font-semibold text-muted-foreground">Stable</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardHeader>
                <CardTitle className="font-playfair">7-Day Activity</CardTitle>
                <CardDescription className="font-inter">
                  Your journaling activity over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyTrend.map(({ date, count }) => (
                    <div key={date} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-inter">{format(new Date(date), "EEE, MMM d")}</span>
                        <span className="text-muted-foreground font-inter">
                          {count} {count === 1 ? "entry" : "entries"}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${(count / maxWeeklyCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
      </div>
    </AuthGuard>
  );
};

export default MoodTracker;