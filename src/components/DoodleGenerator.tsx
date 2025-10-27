import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Paintbrush, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface DoodleGeneratorProps {
  text: string;
  onDoodleGenerated: (imageUrl: string) => void;
}

export const DoodleGenerator = ({ text, onDoodleGenerated }: DoodleGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [doodleUrl, setDoodleUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please write something first");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-doodle', {
        body: { text }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setDoodleUrl(data.imageUrl);
        onDoodleGenerated(data.imageUrl);
        toast.success("Doodle generated!");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate doodle");
    } finally {
      setGenerating(false);
    }
  };

  const removeDoodle = () => {
    setDoodleUrl(null);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={generating || !text.trim()}
      >
        {generating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Paintbrush className="h-4 w-4 mr-2" />
        )}
        Generate Doodle
      </Button>
      
      {doodleUrl && (
        <div className="relative group">
          <img src={doodleUrl} alt="Generated doodle" className="w-full max-h-64 object-contain rounded-lg" />
          <button
            type="button"
            onClick={removeDoodle}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
