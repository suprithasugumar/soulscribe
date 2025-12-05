import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/AuthGuard";

const PIN_SESSION_KEY = 'pin_verified_until';

const SecretEntries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  useEffect(() => {
    // Check if already unlocked from a valid session
    const sessionExpiry = localStorage.getItem(PIN_SESSION_KEY);
    if (sessionExpiry && Date.now() < parseInt(sessionExpiry, 10)) {
      setIsUnlocked(true);
      loadSecretEntries();
    }
  }, []);

  const verifyPin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("secret_lock_enabled")
        .eq("id", user.id)
        .single();

      if (!profile?.secret_lock_enabled) {
        toast({
          title: "Secret lock not enabled",
          description: "Please enable secret lock in settings first.",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      // Call secure verify-pin edge function
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('verify-pin', {
        body: { pin },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to verify PIN.",
          variant: "destructive",
        });
        setPin("");
        return;
      }

      // Handle rate limiting
      if (data?.locked) {
        setIsLocked(true);
        toast({
          title: "Account Locked",
          description: data.error || "Too many failed attempts. Please try again later.",
          variant: "destructive",
        });
        setPin("");
        return;
      }

      // Handle wrong PIN with attempts remaining
      if (data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(data.attemptsRemaining);
        toast({
          title: "Wrong PIN",
          description: data.error || `${data.attemptsRemaining} attempt(s) remaining.`,
          variant: "destructive",
        });
        setPin("");
        return;
      }

      if (!data?.success) {
        toast({
          title: "Wrong PIN",
          description: data?.error || "Please try again.",
          variant: "destructive",
        });
        setPin("");
        return;
      }

      // Store PIN session expiry in localStorage
      if (data.expiresAt) {
        localStorage.setItem(PIN_SESSION_KEY, data.expiresAt.toString());
      }

      setIsUnlocked(true);
      setAttemptsRemaining(null);
      loadSecretEntries();
      toast({
        title: "Unlocked!",
        description: "Access granted to private entries.",
      });
    } catch (error) {
      console.error("Error verifying PIN:", error);
      toast({
        title: "Error",
        description: "Failed to verify PIN.",
        variant: "destructive",
      });
    }
  };

  const loadSecretEntries = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_private", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error loading entries:", error);
      toast({
        title: "Error",
        description: "Failed to load entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4 && !isLocked) {
      verifyPin();
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Lock className="h-8 w-8" />
              Secret Entries
            </h1>
          </div>

          {!isUnlocked ? (
            <Card>
              <CardHeader>
                <CardTitle>Enter PIN to unlock</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-2xl tracking-widest"
                    disabled={isLocked}
                  />
                  {attemptsRemaining !== null && attemptsRemaining > 0 && (
                    <p className="text-sm text-destructive text-center">
                      {attemptsRemaining} attempt(s) remaining
                    </p>
                  )}
                  {isLocked && (
                    <p className="text-sm text-destructive text-center">
                      Account temporarily locked. Please try again later.
                    </p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={pin.length !== 4 || isLocked}
                  >
                    Unlock
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <p>Loading entries...</p>
              ) : entries.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No private entries yet.</p>
                  </CardContent>
                </Card>
              ) : (
                entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/entry/${entry.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {entry.title || "Untitled Entry"}
                        <Lock className="h-4 w-4" />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3">{entry.content}</p>
                      {entry.mood && (
                        <p className="mt-2 text-sm">
                          Mood: <span className="capitalize">{entry.mood}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default SecretEntries;
