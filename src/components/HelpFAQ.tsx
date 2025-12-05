import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mail, Send } from "lucide-react";

const faqs = [
  {
    question: "How do I create a new journal entry?",
    answer: "Tap the '+' button on the home screen or navigate to 'New Entry' from the menu. You can write text, add photos, record voice notes, and select your mood."
  },
  {
    question: "What are Secret Entries and how do I use them?",
    answer: "Secret Entries are private journal entries protected by a 4-digit PIN. Enable 'Secret Lock' in Settings > Privacy & Security, set up a security question, and create your PIN. Mark any entry as private when creating it."
  },
  {
    question: "How do I recover my PIN if I forget it?",
    answer: "Go to Settings > Privacy & Security > Change PIN. You'll need to answer your security question correctly. Warning: If you answer incorrectly, all private entries will be permanently deleted for security."
  },
  {
    question: "Can I export my journal entries?",
    answer: "Yes! Go to Settings > Backup & Sync and tap 'Export Entries (PDF)'. You can also use the PDF Export feature from the AI Features page to export entries within a specific date range."
  },
  {
    question: "What AI features are available?",
    answer: "SoulScribe offers AI-powered text enhancement, mood-based music suggestions, story generation from your entries, AI reflection coaching, voice-to-text transcription, and doodle generation."
  },
  {
    question: "How does mood tracking work?",
    answer: "When creating an entry, select your current mood from the mood selector. View your mood trends and statistics in the Mood Tracker and Statistics pages to gain insights about your emotional patterns."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes! Your data is encrypted and stored securely in the cloud. Only you can access your entries with your login credentials. Private entries have an additional layer of PIN protection."
  },
  {
    question: "How do I change my theme or font?",
    answer: "Go to Settings > Personalization. Choose from themes like Midnight Blue, Sunset Orange, Forest Green, or Ocean Blue. You can also select different font styles and sizes."
  }
];

export const HelpFAQ = () => {
  const { toast } = useToast();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    
    setSending(true);
    // Simulate sending - in production, this would call an edge function
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ 
      title: "Message Sent", 
      description: "We'll get back to you within 24-48 hours." 
    });
    setContactForm({ subject: "", message: "" });
    setShowContactForm(false);
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-sm">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="border-t pt-4 mt-4">
        <p className="text-sm text-muted-foreground mb-3">
          Can't find what you're looking for?
        </p>
        
        {!showContactForm ? (
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => setShowContactForm(true)}
          >
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </Button>
        ) : (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="What do you need help with?"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or question..."
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowContactForm(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 gap-2"
                onClick={handleSendMessage}
                disabled={sending}
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-3 text-center">
          <a 
            href="mailto:support@soulscribe.app" 
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            support@soulscribe.app
          </a>
        </div>
      </div>
    </div>
  );
};
