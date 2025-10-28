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

      // Simple PDF generation using browser print
      const printWindow = window.open("", "_blank");
      if (!printWindow) throw new Error("Failed to open print window");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>SoulScribe Journal - ${format(startDate, "PP")} to ${format(endDate, "PP")}</title>
            <style>
              body { font-family: serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              h1 { text-align: center; color: #333; }
              .entry { margin-bottom: 30px; page-break-inside: avoid; }
              .entry-date { color: #666; font-size: 14px; }
              .entry-mood { display: inline-block; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; margin: 8px 0; }
              .entry-content { line-height: 1.6; margin-top: 10px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <h1>SoulScribe Journal</h1>
            <p style="text-align: center; color: #666;">
              ${format(startDate, "PP")} - ${format(endDate, "PP")}
            </p>
            ${entries?.map(entry => `
              <div class="entry">
                <div class="entry-date">${format(new Date(entry.created_at), "PPP")}</div>
                ${entry.title ? `<h2>${entry.title}</h2>` : ""}
                ${entry.mood ? `<span class="entry-mood">Mood: ${entry.mood}</span>` : ""}
                <div class="entry-content">${entry.content}</div>
              </div>
            `).join("") || "<p>No entries found for this date range.</p>"}
            <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">
              Print/Save as PDF
            </button>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      toast({
        title: "PDF ready",
        description: "Your journal entries are ready to print or save as PDF.",
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
