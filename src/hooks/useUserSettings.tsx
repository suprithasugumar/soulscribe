import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserSettings = () => {
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("theme_preference, font_preference")
          .eq("id", user.id)
          .single();

        if (data) {
          // Apply theme
          const html = document.documentElement;
          if (data.theme_preference === "dark") {
            html.classList.add("dark");
          } else if (data.theme_preference === "light") {
            html.classList.remove("dark");
          } else {
            // Default: use system preference
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
              html.classList.add("dark");
            } else {
              html.classList.remove("dark");
            }
          }

          // Apply font
          html.classList.remove("font-serif", "font-mono");
          if (data.font_preference === "serif") {
            html.classList.add("font-serif");
          } else if (data.font_preference === "mono") {
            html.classList.add("font-mono");
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadSettings();
    });

    return () => subscription.unsubscribe();
  }, []);
};
