import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserSettings } from "./hooks/useUserSettings";
import { FutureMessageNotifier } from "./components/FutureMessageNotifier";

// Eagerly load critical pages
import Auth from "./pages/Auth";
import Home from "./pages/Home";

// Lazy load non-critical pages for faster initial load
const NewEntry = lazy(() => import("./pages/NewEntry"));
const EntryDetail = lazy(() => import("./pages/EntryDetail"));
const AIFeatures = lazy(() => import("./pages/AIFeatures"));
const Statistics = lazy(() => import("./pages/Statistics"));
const MoodTracker = lazy(() => import("./pages/MoodTracker"));
const Settings = lazy(() => import("./pages/Settings"));
const SecretEntries = lazy(() => import("./pages/SecretEntries"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
              <Route path="/" element={session ? <Home /> : <Navigate to="/auth" />} />
              <Route path="/new-entry" element={<NewEntry />} />
              <Route path="/entry/:id" element={<EntryDetail />} />
              <Route path="/ai-features" element={<AIFeatures />} />
              <Route path="/mood-tracker" element={<MoodTracker />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/settings" element={session ? <Settings /> : <Navigate to="/auth" />} />
              <Route path="/secret-entries" element={session ? <SecretEntries /> : <Navigate to="/auth" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
