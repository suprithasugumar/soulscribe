import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const PDFExport = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!entries || entries.length === 0) {
        toast({
          title: "No entries found",
          description: "No journal entries found in the selected date range.",
        });
        setLoading(false);
        return;
      }

      // Generate HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>SoulScribe Journal - ${format(startDate, "PP")} to ${format(endDate, "PP")}</title>
            <style>
              body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
              h1 { text-align: center; color: #333; margin-bottom: 10px; }
              .subtitle { text-align: center; color: #666; margin-bottom: 40px; }
              .entry { margin-bottom: 40px; page-break-inside: avoid; padding: 20px; border-bottom: 1px solid #eee; }
              .entry-date { color: #888; font-size: 14px; margin-bottom: 10px; }
              .entry-title { font-size: 20px; font-weight: bold; margin: 10px 0; color: #222; }
              .entry-mood { display: inline-block; background: #f0f0f0; padding: 6px 12px; border-radius: 20px; margin: 10px 0; font-size: 13px; }
              .entry-content { margin-top: 15px; white-space: pre-wrap; color: #333; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <h1>SoulScribe Journal</h1>
            <p class="subtitle">${format(startDate, "PP")} - ${format(endDate, "PP")}</p>
            ${entries.map(entry => `
              <div class="entry">
                <div class="entry-date">${format(new Date(entry.created_at), "PPPP")}</div>
                ${entry.title ? `<div class="entry-title">${entry.title}</div>` : ""}
                ${entry.mood ? `<span class="entry-mood">Mood: ${entry.mood}</span>` : ""}
                <div class="entry-content">${entry.content}</div>
              </div>
            `).join("")}
          </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `journal-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export complete",
        description: "Your journal has been exported. Open the HTML file and use Print to save as PDF.",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export to PDF. Please try again.",
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
          <Download className="h-5 w-5" />
          Export to PDF
        </CardTitle>
        <CardDescription>
          Export your journal entries within a date range
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button onClick={exportToPDF} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
