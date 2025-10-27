import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Heart, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";

const AIFeatures = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState("");
  const [happyMemories, setHappyMemories] = useState<any[]>([]);

  const generateStory = async () => {
    setLoading(true);
    try {
      const { data: entries, error: fetchError } = await supabase
        .from("journal_entries")
        .select("content, mood, emotion_tags")
        .order("created_at", { ascending: false })
        .limit(5);

      if (fetchError) throw fetchError;
      if (!entries || entries.length === 0) {
        toast.error("You need at least one journal entry to generate a story");
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-story", {
        body: { entries },
      });

      if (error) throw error;
      setGeneratedStory(data.story);
      toast.success("Story generated!");
    } catch (error: any) {
      toast.error("Failed to generate story");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const findHappyMemories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .in("mood", ["happy", "grateful", "excited", "calm"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.info("No happy memories found yet. Keep journaling!");
        return;
      }

      setHappyMemories(data);
      toast.success(`Found ${data.length} happy memories!`);
    } catch (error: any) {
      toast.error("Failed to find happy memories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
              AI Features
            </h1>
            <div className="w-20" />
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardHeader>
                <CardTitle className="font-playfair flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Story Generator
                </CardTitle>
                <CardDescription className="font-inter">
                  Transform your recent entries into a creative story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generateStory}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loading ? "Generating..." : "Generate Story"}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardHeader>
                <CardTitle className="font-playfair flex items-center gap-2">
                  <Heart className="h-5 w-5 text-secondary" />
                  Happy Memories
                </CardTitle>
                <CardDescription className="font-inter">
                  Rediscover your joyful moments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={findHappyMemories}
                  disabled={loading}
                  variant="outline"
                  className="w-full transition-all hover:scale-105"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {loading ? "Searching..." : "Find Happy Memories"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {generatedStory && (
            <Card className="mt-8 shadow-medium backdrop-blur-sm bg-card/80 border-none">
              <CardHeader>
                <CardTitle className="font-playfair">Your Generated Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-inter whitespace-pre-wrap leading-relaxed">
                  {generatedStory}
                </p>
              </CardContent>
            </Card>
          )}

          {happyMemories.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-playfair font-semibold">Your Happy Memories</h2>
              {happyMemories.map((memory) => (
                <Card
                  key={memory.id}
                  className="cursor-pointer transition-all hover:scale-[1.02] shadow-soft backdrop-blur-sm bg-card/80 border-none"
                  onClick={() => navigate(`/entry/${memory.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-inter flex items-center gap-2">
                      <span className="text-2xl">
                        {memory.mood === "happy" ? "😊" : memory.mood === "grateful" ? "🤗" : memory.mood === "excited" ? "🤩" : "😌"}
                      </span>
                      {memory.title || "Untitled Entry"}
                    </CardTitle>
                    <CardDescription className="font-inter">
                      {new Date(memory.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 font-inter">
                      {memory.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default AIFeatures;