import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: string;
  emotion_tags: string[];
  created_at: string;
  is_private: boolean;
  media_urls?: string[];
}

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEntry(data);
    } catch (error: any) {
      toast.error("Failed to load entry");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Entry deleted successfully");
      navigate("/");
    } catch (error: any) {
      toast.error("Failed to delete entry");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20 p-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-inter">Loading entry...</p>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>

          <Card className="shadow-medium backdrop-blur-sm bg-card/80 border-none">
            <CardHeader>
              <CardTitle className="text-2xl font-playfair">
                {entry.title || "Untitled Entry"}
              </CardTitle>
              <CardDescription className="font-inter">
                {new Date(entry.created_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {entry.mood && (
                  <span className="ml-2">
                    • Mood: <span className="capitalize">{entry.mood}</span>
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-lg max-w-none font-inter">
                <p className="whitespace-pre-wrap">{entry.content}</p>
              </div>

              {entry.emotion_tags && entry.emotion_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.emotion_tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary font-inter text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {entry.media_urls && entry.media_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {entry.media_urls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="rounded-lg shadow-soft w-full h-auto"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default EntryDetail;
