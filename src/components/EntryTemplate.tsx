import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TemplateType = "minimal" | "classic" | "scrapbook" | "vintage" | "handwritten" | "polaroid";

interface EntryTemplateProps {
  template: TemplateType;
  children: ReactNode;
  className?: string;
}

export const EntryTemplate = ({ template, children, className }: EntryTemplateProps) => {
  const templates = {
    minimal: "bg-card border-none shadow-soft",
    classic: "bg-card border-2 border-border shadow-medium",
    scrapbook: "bg-gradient-to-br from-secondary/20 via-card to-accent/20 border-4 border-dashed border-primary/30 shadow-medium rotate-[-0.5deg]",
    vintage: "bg-[linear-gradient(to_bottom,hsl(var(--card)),hsl(var(--muted)))] border-8 border-double border-primary/40 shadow-glow",
    handwritten: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJoc2woMjYyIDgzJSA1OCUgLyAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-card border border-primary/20 shadow-soft",
    polaroid: "bg-white dark:bg-card p-4 pb-12 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rotate-[1deg] hover:rotate-0 transition-transform",
  };

  return (
    <div className={cn(templates[template], "transition-all duration-300", className)}>
      {children}
    </div>
  );
};

export const TemplateSelector = ({ selected, onSelect }: { selected: TemplateType; onSelect: (template: TemplateType) => void }) => {
  const templates: { type: TemplateType; name: string; emoji: string }[] = [
    { type: "minimal", name: "Minimal", emoji: "✨" },
    { type: "classic", name: "Classic", emoji: "📖" },
    { type: "scrapbook", name: "Scrapbook", emoji: "🎨" },
    { type: "vintage", name: "Vintage", emoji: "📜" },
    { type: "handwritten", name: "Handwritten", emoji: "✍️" },
    { type: "polaroid", name: "Polaroid", emoji: "📸" },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Choose Entry Template</label>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {templates.map((template) => (
          <button
            key={template.type}
            onClick={() => onSelect(template.type)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all hover:scale-105",
              selected === template.type
                ? "border-primary bg-primary/10 shadow-medium"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <span className="text-2xl">{template.emoji}</span>
            <span className="text-xs font-medium">{template.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};