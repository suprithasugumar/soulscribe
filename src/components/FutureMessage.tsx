import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Send } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const FutureMessage = () => {
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSchedule = async () => {
    if (!message || !date) {
      toast({
        title: "Missing information",
        description: "Please provide both a message and a date.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Combine date and time
      const [hours, minutes] = time.split(":");
      const scheduledDate = new Date(date);
      scheduledDate.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase.from("future_messages").insert({
        user_id: user.id,
        message,
        scheduled_date: scheduledDate.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Message scheduled",
        description: `Your message will be delivered on ${format(scheduledDate, "PPP")} at ${time}`,
      });

      setMessage("");
      setDate(undefined);
      setTime("12:00");
    } catch (error) {
      console.error("Error scheduling message:", error);
      toast({
        title: "Error",
        description: "Failed to schedule message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Message to Future Self
        </CardTitle>
        <CardDescription>
          Schedule a message to be delivered at a future date
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="message">Your Message</Label>
          <Textarea
            id="message"
            placeholder="Write a message to your future self..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Delivery Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSchedule} disabled={loading} className="w-full">
          {loading ? "Scheduling..." : "Schedule Message"}
        </Button>
      </CardContent>
    </Card>
  );
};
