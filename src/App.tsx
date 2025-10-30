import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserSettings } from "./hooks/useUserSettings";
import { FutureMessageNotifier } from "./components/FutureMessageNotifier";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import NewEntry from "./pages/NewEntry";
import EntryDetail from "./pages/EntryDetail";
import AIFeatures from "./pages/AIFeatures";
import MoodTracker from "./pages/MoodTracker";
import Settings from "./pages/Settings";
import SecretEntries from "./pages/SecretEntries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useUserSettings();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-accent/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {session && <FutureMessageNotifier />}
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
            <Route path="/" element={session ? <Home /> : <Navigate to="/auth" />} />
            <Route path="/new-entry" element={<NewEntry />} />
            <Route path="/entry/:id" element={<EntryDetail />} />
            <Route path="/ai-features" element={<AIFeatures />} />
            <Route path="/mood-tracker" element={<MoodTracker />} />
            <Route path="/settings" element={session ? <Settings /> : <Navigate to="/auth" />} />
            <Route path="/secret-entries" element={session ? <SecretEntries /> : <Navigate to="/auth" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
