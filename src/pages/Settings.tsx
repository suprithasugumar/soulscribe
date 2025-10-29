import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme_preference: "default",
    font_preference: "default",
    language_preference: "en",
    notifications_enabled: true,
    secret_lock_enabled: false,
    lock_pin: "",
    theme_variant: "default",
    font_size: "medium"
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          theme_preference: data.theme_preference || "default",
          font_preference: data.font_preference || "default",
          language_preference: data.language_preference || "en",
          notifications_enabled: data.notifications_enabled ?? true,
          secret_lock_enabled: data.secret_lock_enabled ?? false,
          lock_pin: data.lock_pin || "",
          theme_variant: data.theme_variant || "default",
          font_size: data.font_size || "medium"
        });
        
        // Apply settings immediately on load
        applyTheme(data.theme_preference || "default");
        applyFont(data.font_preference || "default");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const applyTheme = (theme: string) => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "light") {
      html.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  };

  const applyFont = (font: string) => {
    const html = document.documentElement;
    html.classList.remove("font-serif", "font-mono", "font-handwriting");
    if (font === "serif") {
      html.classList.add("font-serif");
    } else if (font === "mono") {
      html.classList.add("font-mono");
    } else if (font === "handwriting") {
      html.classList.add("font-handwriting");
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update(settings)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });

      applyTheme(settings.theme_preference);
      applyFont(settings.font_preference);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how SoulScribe looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme_preference}
                onValueChange={(value) => setSettings({ ...settings, theme_preference: value })}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">System Default</SelectItem>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="midnight">Midnight Blue</SelectItem>
                  <SelectItem value="sunset">Sunset Orange</SelectItem>
                  <SelectItem value="forest">Forest Green</SelectItem>
                  <SelectItem value="ocean">Ocean Blue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font">Font</Label>
              <Select
                value={settings.font_preference}
                onValueChange={(value) => setSettings({ ...settings, font_preference: value })}
              >
                <SelectTrigger id="font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Sans Serif (Default)</SelectItem>
                  <SelectItem value="serif">Serif (Classic)</SelectItem>
                  <SelectItem value="mono">Monospace (Code)</SelectItem>
                  <SelectItem value="handwriting">Handwriting (Casual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>Manage your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="secret-lock">Secret Lock</Label>
                <p className="text-sm text-muted-foreground">
                  Require PIN to view private entries
                </p>
              </div>
              <Switch
                id="secret-lock"
                checked={settings.secret_lock_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, secret_lock_enabled: checked })
                }
              />
            </div>

            {settings.secret_lock_enabled && (
              <div className="space-y-2">
                <Label htmlFor="pin">Lock PIN (4 digits)</Label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN"
                  value={settings.lock_pin}
                  onChange={(e) =>
                    setSettings({ ...settings, lock_pin: e.target.value.replace(/\D/g, "") })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders for future messages
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifications_enabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.language_preference}
              onValueChange={(value) => setSettings({ ...settings, language_preference: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
                <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={saveSettings} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Settings"}
          </Button>
          <Button
            onClick={() => navigate("/secret-entries")}
            variant="outline"
            className="flex-1"
          >
            View Secret Entries
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
