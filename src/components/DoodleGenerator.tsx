import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Paintbrush, Loader2, X, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  const downloadDoodle = async () => {
    if (!doodleUrl) return;
    
    try {
      const response = await fetch(doodleUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `doodle-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Doodle downloaded!");
    } catch (error) {
      toast.error("Failed to download doodle");
    }
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
        <div className="relative group space-y-2">
          <img src={doodleUrl} alt="Generated doodle" className="w-full max-h-64 object-contain rounded-lg" />
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Your Doodle</DialogTitle>
                </DialogHeader>
                <img src={doodleUrl} alt="Generated doodle" className="w-full h-auto" />
              </DialogContent>
            </Dialog>
            <Button type="button" variant="outline" size="sm" onClick={downloadDoodle} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={removeDoodle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
