import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Clock, FileText, Calendar, Flame } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { toast } from "sonner";

interface Stats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  averageLength: number;
  mostActiveHour: number;
  mostActiveDay: string;
}

const Statistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageLength: 0,
    mostActiveHour: 0,
    mostActiveDay: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!entries || entries.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate statistics
      const totalEntries = entries.length;

      // Calculate average length
      const totalLength = entries.reduce((sum, entry) => sum + entry.content.length, 0);
      const averageLength = Math.round(totalLength / totalEntries);

      // Calculate streaks
      const dates = entries.map(e => new Date(e.created_at).toDateString());
      const uniqueDates = [...new Set(dates)].sort();
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;
      
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      for (let i = uniqueDates.length - 1; i >= 0; i--) {
        if (uniqueDates[i] === today || uniqueDates[i] === yesterday) {
          currentStreak = 1;
          for (let j = i - 1; j >= 0; j--) {
            const date1 = new Date(uniqueDates[j + 1]);
            const date2 = new Date(uniqueDates[j]);
            const diffDays = Math.floor((date1.getTime() - date2.getTime()) / 86400000);
            
            if (diffDays === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
          break;
        }
      }

      for (let i = 1; i < uniqueDates.length; i++) {
        const date1 = new Date(uniqueDates[i]);
        const date2 = new Date(uniqueDates[i - 1]);
        const diffDays = Math.floor((date1.getTime() - date2.getTime()) / 86400000);
        
        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Calculate most active hour
      const hours = entries.map(e => new Date(e.created_at).getHours());
      const hourCounts = hours.reduce((acc: Record<number, number>, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});
      const mostActiveHour = parseInt(
        Object.keys(hourCounts).reduce((a, b) => hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b)
      );

      // Calculate most active day
      const days = entries.map(e => new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'long' }));
      const dayCounts = days.reduce((acc: Record<string, number>, day) => {
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      const mostActiveDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);

      setStats({
        totalEntries,
        currentStreak,
        longestStreak,
        averageLength,
        mostActiveHour,
        mostActiveDay,
      });
    } catch (error: any) {
      toast.error("Failed to load statistics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Statistics Dashboard
            </h1>
            <div className="w-20" />
          </header>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Calculating statistics...</p>
            </div>
          ) : stats.totalEntries === 0 ? (
            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No entries yet. Start journaling to see your statistics!
                </p>
                <Button onClick={() => navigate("/new-entry")}>Create First Entry</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalEntries}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep up the great work!
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.currentStreak}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.currentStreak > 0 ? "Days in a row" : "Start writing to build a streak"}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.longestStreak}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your personal best
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Entry Length</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.averageLength}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Characters per entry
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Active Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatHour(stats.mostActiveHour)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your peak writing hour
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Active Day</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.mostActiveDay}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You write most on this day
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Statistics;
