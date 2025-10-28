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
    lock_pin: ""
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
          lock_pin: data.lock_pin || ""
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
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
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
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
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
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
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button onClick={saveSettings} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
