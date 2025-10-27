import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TextEnhancerProps {
  text: string;
  onTextEnhanced: (enhancedText: string) => void;
}

export const TextEnhancer = ({ text, onTextEnhanced }: TextEnhancerProps) => {
  const [enhancing, setEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!text.trim()) {
      toast.error("Please write something first");
      return;
    }

    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-text', {
        body: { text }
      });

      if (error) throw error;
      if (data?.enhancedText) {
        onTextEnhanced(data.enhancedText);
        toast.success("Text enhanced!");
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.error("Failed to enhance text");
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleEnhance}
      disabled={enhancing || !text.trim()}
    >
      {enhancing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      Enhance Text
    </Button>
  );
};
