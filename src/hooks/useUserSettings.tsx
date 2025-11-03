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
          .select("theme_preference, font_preference, language_preference")
          .eq("id", user.id)
          .single();

        if (data) {
          // Apply theme
          const html = document.documentElement;
          html.classList.remove("dark", "theme-midnight", "theme-sunset", "theme-forest", "theme-ocean");
          
          const theme = data.theme_preference;
          if (theme === "dark") {
            html.classList.add("dark");
          } else if (theme === "light") {
            // Light mode - no additional classes
          } else if (theme === "midnight") {
            html.classList.add("dark", "theme-midnight");
          } else if (theme === "sunset") {
            html.classList.add("theme-sunset");
          } else if (theme === "forest") {
            html.classList.add("dark", "theme-forest");
          } else if (theme === "ocean") {
            html.classList.add("dark", "theme-ocean");
          } else {
            // Default: use system preference
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
              html.classList.add("dark");
            }
          }

          // Apply font
          html.classList.remove("font-serif", "font-mono", "font-handwriting");
          if (data.font_preference === "serif") {
            html.classList.add("font-serif");
          } else if (data.font_preference === "mono") {
            html.classList.add("font-mono");
          } else if (data.font_preference === "handwriting") {
            html.classList.add("font-handwriting");
          }
          
          // Apply language
          if (data.language_preference) {
            html.lang = data.language_preference;
            // Set direction for RTL languages
            if (data.language_preference === 'ar') {
              html.dir = 'rtl';
            } else {
              html.dir = 'ltr';
            }
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
