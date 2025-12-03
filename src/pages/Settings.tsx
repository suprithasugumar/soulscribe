import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, ChevronDown, Palette, Shield, Bell, Database, 
  Bookmark, User, Info, Download, Upload, Trash2, HelpCircle,
  FileText, LogOut, Eye, EyeOff
} from "lucide-react";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { SecurityQuestionSetup } from "@/components/SecurityQuestionSetup";
import { ChangePinDialog } from "@/components/ChangePinDialog";

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingsSection = ({ title, icon, children, defaultOpen = false }: SettingsSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
              <span className="font-semibold">{title}</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-4 border-t">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

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
    font_size: "medium",
    security_question: "",
    security_answer: "",
    has_security_question: false
  });
  const [showPin, setShowPin] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadSettings();
    loadUserEmail();
  }, []);

  const loadUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email || "");
  };

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
          font_size: data.font_size || "medium",
          security_question: data.security_question || "",
          security_answer: "",
          has_security_question: !!data.security_question
        });
        
        applyTheme(data.theme_preference || "default");
        applyFont(data.font_preference || "default");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const applyTheme = (theme: string) => {
    const html = document.documentElement;
    html.classList.remove("dark", "theme-midnight", "theme-sunset", "theme-forest", "theme-ocean");
    
    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "midnight") {
      html.classList.add("dark", "theme-midnight");
    } else if (theme === "sunset") {
      html.classList.add("theme-sunset");
    } else if (theme === "forest") {
      html.classList.add("dark", "theme-forest");
    } else if (theme === "ocean") {
      html.classList.add("dark", "theme-ocean");
    } else if (theme === "default") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add("dark");
      }
    }
  };

  const applyFont = (font: string) => {
    const html = document.documentElement;
    html.classList.remove("font-serif", "font-mono", "font-handwriting");
    if (font === "serif") html.classList.add("font-serif");
    else if (font === "mono") html.classList.add("font-mono");
    else if (font === "handwriting") html.classList.add("font-handwriting");
  };

  const hashString = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const updateData: any = {
        theme_preference: settings.theme_preference,
        font_preference: settings.font_preference,
        language_preference: settings.language_preference,
        notifications_enabled: settings.notifications_enabled,
        secret_lock_enabled: settings.secret_lock_enabled,
        theme_variant: settings.theme_variant,
        font_size: settings.font_size
      };

      if (settings.secret_lock_enabled && !settings.has_security_question) {
        if (!settings.security_question || !settings.security_answer) {
          toast({ title: "Security Question Required", description: "Please set up a security question to enable secret lock.", variant: "destructive" });
          setLoading(false);
          return;
        }
        updateData.security_question = settings.security_question;
        updateData.security_answer_hash = await hashString(settings.security_answer);
      }

      if (settings.secret_lock_enabled && settings.lock_pin) {
        if (settings.lock_pin.length !== 4 || !/^\d{4}$/.test(settings.lock_pin)) {
          toast({ title: "Invalid PIN", description: "PIN must be exactly 4 digits.", variant: "destructive" });
          setLoading(false);
          return;
        }
        updateData.lock_pin_hash = await hashString(settings.lock_pin);
        updateData.lock_pin = null;
      } else if (!settings.secret_lock_enabled) {
        updateData.lock_pin_hash = null;
        updateData.lock_pin = null;
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id);
      if (error) throw error;

      toast({ title: "Settings saved", description: "Your preferences have been updated." });
      applyTheme(settings.theme_preference);
      applyFont(settings.font_preference);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* 1. Personalization */}
        <SettingsSection title="Personalization" icon={<Palette className="h-5 w-5" />} defaultOpen>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Theme / Appearance</Label>
              <Select value={settings.theme_preference} onValueChange={(value) => setSettings({ ...settings, theme_preference: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>Font Style</Label>
              <Select value={settings.font_preference} onValueChange={(value) => setSettings({ ...settings, font_preference: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Sans Serif (Default)</SelectItem>
                  <SelectItem value="serif">Serif (Classic)</SelectItem>
                  <SelectItem value="mono">Monospace (Code)</SelectItem>
                  <SelectItem value="handwriting">Handwriting (Casual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={settings.font_size} onValueChange={(value) => setSettings({ ...settings, font_size: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        {/* 2. Privacy & Security */}
        <SettingsSection title="Privacy & Security" icon={<Shield className="h-5 w-5" />}>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Secret Lock</Label>
                <p className="text-sm text-muted-foreground">Require PIN to view private entries</p>
              </div>
              <Switch checked={settings.secret_lock_enabled} onCheckedChange={(checked) => setSettings({ ...settings, secret_lock_enabled: checked })} />
            </div>

            {settings.secret_lock_enabled && (
              <>
                {!settings.has_security_question && (
                  <div className="p-4 bg-muted rounded-lg space-y-4">
                    <p className="text-sm font-medium">Security Question Setup</p>
                    <SecurityQuestionSetup
                      question={settings.security_question}
                      answer={settings.security_answer}
                      onQuestionChange={(q) => setSettings({ ...settings, security_question: q })}
                      onAnswerChange={(a) => setSettings({ ...settings, security_answer: a })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Lock PIN (4 digits)</Label>
                  <div className="relative">
                    <Input
                      type={showPin ? "text" : "password"}
                      maxLength={4}
                      placeholder="Enter 4-digit PIN"
                      value={settings.lock_pin}
                      onChange={(e) => setSettings({ ...settings, lock_pin: e.target.value.replace(/\D/g, "") })}
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {settings.has_security_question && <ChangePinDialog />}
              </>
            )}

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded-lg px-2">
                <span className="text-sm font-medium">Change Password</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <PasswordChangeForm />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </SettingsSection>

        {/* 3. Backup & Sync */}
        <SettingsSection title="Backup & Sync" icon={<Database className="h-5 w-5" />}>
          <div className="space-y-3 pt-4">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/")}>
              <Download className="h-4 w-4" /> Export Entries (PDF)
            </Button>
            <p className="text-sm text-muted-foreground">Your data is automatically synced to the cloud.</p>
          </div>
        </SettingsSection>

        {/* 4. Notifications & Reminders */}
        <SettingsSection title="Notifications & Reminders" icon={<Bell className="h-5 w-5" />}>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive reminders for future messages</p>
              </div>
              <Switch checked={settings.notifications_enabled} onCheckedChange={(checked) => setSettings({ ...settings, notifications_enabled: checked })} />
            </div>
          </div>
        </SettingsSection>

        {/* 5. Journal Features */}
        <SettingsSection title="Journal Features" icon={<FileText className="h-5 w-5" />}>
          <div className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">Daily prompts, mood tracking, voice-to-text, and entry templates are enabled by default.</p>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/secret-entries")}>
              View Secret Entries
            </Button>
          </div>
        </SettingsSection>

        {/* 6. Data & Storage */}
        <SettingsSection title="Data & Storage" icon={<Trash2 className="h-5 w-5" />}>
          <div className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">Manage your data and storage preferences.</p>
          </div>
        </SettingsSection>

        {/* 7. Tags & Organization */}
        <SettingsSection title="Tags & Organization" icon={<Bookmark className="h-5 w-5" />}>
          <div className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">Manage tags and categories for better organization.</p>
          </div>
        </SettingsSection>

        {/* 8. Account Settings */}
        <SettingsSection title="Account Settings" icon={<User className="h-5 w-5" />}>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={userEmail} disabled className="bg-muted" />
            </div>
            <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </SettingsSection>

        {/* 9. App Information */}
        <SettingsSection title="App Information & Support" icon={<Info className="h-5 w-5" />}>
          <div className="space-y-3 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2">
              <HelpCircle className="h-4 w-4" /> Help & FAQs
            </Button>
          </div>
        </SettingsSection>

        <Button onClick={saveSettings} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
