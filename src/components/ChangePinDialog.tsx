import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const ChangePinDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"verify" | "newpin" | "forgot">("verify");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const { toast } = useToast();

  const loadSecurityQuestion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("security_question")
        .eq("id", user.id)
        .single();

      if (profile?.security_question) {
        setSecurityQuestion(profile.security_question);
      } else {
        toast({
          title: "Security Question Not Set",
          description: "You need to set up a security question first in settings.",
          variant: "destructive",
        });
        setOpen(false);
      }
    } catch (error) {
      console.error("Error loading security question:", error);
    }
  };

  const handleVerifyAnswer = async () => {
    if (!securityAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please enter your security answer.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Not Authenticated",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Verify security answer server-side
      const { data, error } = await supabase.functions.invoke("verify-security-answer", {
        body: { answer: securityAnswer, deleteOnFailure: true },
      });

      if (error) throw error;

      if (!data.success) {
        // Wrong answer - entries were deleted server-side
        toast({
          title: "Wrong Answer - Data Deleted",
          description: "Incorrect security answer. All secret entries have been permanently deleted for security.",
          variant: "destructive",
        });
        setOpen(false);
        setSecurityAnswer("");
        setStep("verify");
        return;
      }

      // Correct answer - proceed to new PIN
      setStep("newpin");
      toast({
        title: "Verified",
        description: "Security answer verified. You can now set a new PIN.",
      });
    } catch (error) {
      console.error("Error verifying answer:", error);
      toast({
        title: "Error",
        description: "Failed to verify security answer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotAnswer = async () => {
    if (confirmDelete !== "DELETE") {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE to confirm.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all private entries
      const { error: deleteError } = await supabase
        .from("journal_entries")
        .delete()
        .eq("user_id", user.id)
        .eq("is_private", true);

      if (deleteError) throw deleteError;

      // Clear security question and PIN
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          lock_pin_hash: null,
          lock_pin: null,
          security_question: null,
          security_answer_hash: null,
          secret_lock_enabled: false
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Reset Complete",
        description: "All secret entries have been deleted. You can set up a new secret lock in settings.",
      });
      setOpen(false);
      resetState();
    } catch (error) {
      console.error("Error resetting:", error);
      toast({
        title: "Error",
        description: "Failed to reset secret lock.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PINs Don't Match",
        description: "Please make sure both PINs match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const pinHash = await hashString(newPin);

      const { error } = await supabase
        .from("profiles")
        .update({ 
          lock_pin_hash: pinHash,
          lock_pin: null 
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "PIN Changed",
        description: "Your secret lock PIN has been successfully changed.",
      });
      setOpen(false);
      resetState();
    } catch (error) {
      console.error("Error changing PIN:", error);
      toast({
        title: "Error",
        description: "Failed to change PIN.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSecurityAnswer("");
    setNewPin("");
    setConfirmPin("");
    setConfirmDelete("");
    setStep("verify");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) {
        loadSecurityQuestion();
        resetState();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <KeyRound className="mr-2 h-4 w-4" />
          Change Secret Lock PIN
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === "forgot" ? "Reset Secret Lock" : "Change Secret Lock PIN"}
          </DialogTitle>
          <DialogDescription>
            {step === "verify" 
              ? "Answer your security question to proceed" 
              : step === "forgot"
              ? "This will permanently delete all secret entries"
              : "Enter your new 4-digit PIN"}
          </DialogDescription>
        </DialogHeader>

        {step === "verify" ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: If you answer incorrectly, all your secret entries will be permanently deleted.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Security Question</Label>
              <p className="text-sm font-medium bg-muted p-3 rounded-md">
                {securityQuestion}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-answer">Your Answer</Label>
              <Input
                id="security-answer"
                type="text"
                placeholder="Enter your answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
            </div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-destructive"
              onClick={() => setStep("forgot")}
            >
              Forgot your answer?
            </Button>
          </div>
        ) : step === "forgot" ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action will permanently delete ALL your secret entries and reset your secret lock. This cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
              <Input
                id="confirm-delete"
                type="text"
                placeholder="Type DELETE"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                className="uppercase"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-pin">New PIN</Label>
              <Input
                id="new-pin"
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                maxLength={4}
                placeholder="Confirm 4-digit PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => step === "forgot" ? setStep("verify") : setOpen(false)}>
            {step === "forgot" ? "Back" : "Cancel"}
          </Button>
          <Button 
            onClick={step === "verify" ? handleVerifyAnswer : step === "forgot" ? handleForgotAnswer : handleChangePin}
            disabled={loading || (step === "verify" ? !securityAnswer : step === "forgot" ? confirmDelete !== "DELETE" : newPin.length !== 4)}
            variant={step === "forgot" ? "destructive" : "default"}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === "verify" ? "Verify" : step === "forgot" ? "Delete & Reset" : "Change PIN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
