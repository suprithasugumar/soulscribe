import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface AIReflectionProps {
  show: boolean;
  onClose: () => void;
}

export const AIReflection = ({ show, onClose }: AIReflectionProps) => {
  const [reflection, setReflection] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      generateReflection();
      // Auto-close after 8 seconds
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const generateReflection = async () => {
    setLoading(true);
    try {
      const { data: entries } = await supabase
        .from("journal_entries")
        .select("mood, emotion_tags, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data } = await supabase.functions.invoke("ai-reflection", {
        body: { recentEntries: entries || [] },
      });

      setReflection(data?.reflection || "Thank you for sharing your thoughts today!");
    } catch (error) {
      console.error("Error generating reflection:", error);
      setReflection("Thank you for sharing your thoughts today! Keep up the great journaling habit.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl animate-in fade-in zoom-in duration-300">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-semibold text-lg">AI Reflection</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <p className="text-foreground/80 leading-relaxed">{reflection}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
