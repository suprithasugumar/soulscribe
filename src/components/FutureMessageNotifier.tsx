import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const FutureMessageNotifier = () => {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkMessages();
    const interval = setInterval(checkMessages, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkMessages = async () => {
    if (checking) return;
    setChecking(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString();
      
      const { data: messages, error } = await supabase
        .from("future_messages")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_sent", false)
        .lte("scheduled_date", now);

      if (error) throw error;

      if (messages && messages.length > 0) {
        for (const message of messages) {
          toast.success("Message from your past self!", {
            description: message.message,
            duration: 10000,
          });

          // Mark as sent
          await supabase
            .from("future_messages")
            .update({ is_sent: true })
            .eq("id", message.id);
        }
      }
    } catch (error) {
      console.error("Error checking future messages:", error);
    } finally {
      setChecking(false);
    }
  };

  return null;
};
