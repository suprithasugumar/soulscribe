import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogOut, Sparkles, TrendingUp, Settings, Search, Filter, BarChart3, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { GratitudeFlashback } from "@/components/GratitudeFlashback";
import { AppLogo } from "@/components/AppLogo";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { JournalBookView } from "@/components/JournalBookView";
import { MemoryTimeline } from "@/components/MemoryTimeline";

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  emotion_tags: string[];
  created_at: string;
}

const Home = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showJournalBook, setShowJournalBook] = useState(false);
  const [showMemoryTimeline, setShowMemoryTimeline] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      let query = supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (filterMood !== "all") {
        query = query.eq("mood", filterMood);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let filteredData = data || [];
      
      // Apply keyword search
      if (searchKeyword) {
        filteredData = filteredData.filter(entry => 
          entry.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }
      
      // Apply emotion tag filter
      if (filterTag !== "all") {
        filteredData = filteredData.filter(entry => 
          entry.emotion_tags?.includes(filterTag)
        );
      }
      
      setEntries(filteredData);
    } catch (error: any) {
      toast.error("Failed to load entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [searchKeyword, filterMood, filterTag]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const getMoodEmoji = (mood?: string) => {
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
    return moodMap[mood || ""] || "📝";
  };

  if (showJournalBook) {
    return <JournalBookView onClose={() => setShowJournalBook(false)} />;
  }

  if (showMemoryTimeline) {
    return <MemoryTimeline onClose={() => setShowMemoryTimeline(false)} />;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <AppLogo />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/statistics")}
                className="transition-all hover:scale-105"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/settings")}
                className="transition-all hover:scale-105"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/mood-tracker")}
                className="transition-all hover:scale-105"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="transition-all hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <Card className="mb-8 shadow-medium backdrop-blur-sm bg-card/80 border-none">
            <CardHeader>
              <CardTitle className="font-playfair">Your Mindful Journey</CardTitle>
              <CardDescription className="font-inter">
                Capture your thoughts, track your moods, and reflect on your day
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                onClick={() => navigate("/new-entry")}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/ai-features")}
                className="transition-all hover:scale-105"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Features
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowJournalBook(true)}
                className="transition-all hover:scale-105"
              >
                📖 Journal Book
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMemoryTimeline(true)}
                className="transition-all hover:scale-105"
              >
                🗓️ Timeline
              </Button>
            </CardContent>
          </Card>

          <GratitudeFlashback />

          <Card className="mb-6 shadow-medium backdrop-blur-sm bg-card/80 border-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries by keyword..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filter by Mood</label>
                    <Select value={filterMood} onValueChange={setFilterMood}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Moods</SelectItem>
                        <SelectItem value="happy">😊 Happy</SelectItem>
                        <SelectItem value="sad">😔 Sad</SelectItem>
                        <SelectItem value="calm">😌 Calm</SelectItem>
                        <SelectItem value="anxious">😰 Anxious</SelectItem>
                        <SelectItem value="angry">😡 Angry</SelectItem>
                        <SelectItem value="grateful">🤗 Grateful</SelectItem>
                        <SelectItem value="tired">😴 Tired</SelectItem>
                        <SelectItem value="excited">🤩 Excited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filter by Emotion Tag</label>
                    <Select value={filterTag} onValueChange={setFilterTag}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        <SelectItem value="Joy">Joy</SelectItem>
                        <SelectItem value="Peace">Peace</SelectItem>
                        <SelectItem value="Love">Love</SelectItem>
                        <SelectItem value="Gratitude">Gratitude</SelectItem>
                        <SelectItem value="Sadness">Sadness</SelectItem>
                        <SelectItem value="Anxiety">Anxiety</SelectItem>
                        <SelectItem value="Fear">Fear</SelectItem>
                        <SelectItem value="Anger">Anger</SelectItem>
                        <SelectItem value="Loneliness">Loneliness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {(searchKeyword || filterMood !== "all" || filterTag !== "all") && (
                <div className="flex gap-2 flex-wrap">
                  {searchKeyword && (
                    <Badge variant="secondary" className="gap-1">
                      Keyword: {searchKeyword}
                    </Badge>
                  )}
                  {filterMood !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Mood: {filterMood}
                    </Badge>
                  )}
                  {filterTag !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Tag: {filterTag}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-playfair font-semibold">
              {searchKeyword || filterMood !== "all" || filterTag !== "all" ? "Filtered Entries" : "Recent Entries"}
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground font-inter">Loading entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <Card className="shadow-soft backdrop-blur-sm bg-card/80 border-none">
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground font-inter mb-4">
                    No entries yet. Start your journey by creating your first entry!
                  </p>
                  <Button onClick={() => navigate("/new-entry")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="cursor-pointer transition-all hover:scale-105 hover:shadow-medium shadow-soft backdrop-blur-sm bg-card/80 border-none"
                    onClick={() => navigate(`/entry/${entry.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                        <CardTitle className="text-lg font-inter truncate">
                          {entry.title || "Untitled Entry"}
                        </CardTitle>
                      </div>
                      <CardDescription className="font-inter">
                        {new Date(entry.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 font-inter">
                        {entry.content}
                      </p>
                      {entry.emotion_tags && entry.emotion_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {entry.emotion_tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-inter"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Home;