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
    classic: "bg-card border-2 border-primary/50 shadow-medium ring-1 ring-primary/20",
    scrapbook: "bg-gradient-to-br from-pink-100/40 via-card to-purple-100/40 dark:from-pink-900/20 dark:to-purple-900/20 border-4 border-dashed border-primary/40 shadow-lg rotate-[-1deg] transform",
    vintage: "bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/30 border-8 border-double border-amber-600/50 dark:border-amber-500/40 shadow-xl sepia-[0.15]",
    handwritten: "bg-[repeating-linear-gradient(transparent,transparent_31px,hsl(var(--primary)/0.15)_31px,hsl(var(--primary)/0.15)_32px)] bg-card border-l-4 border-red-400/60 shadow-soft pl-8 ml-4",
    polaroid: "bg-white dark:bg-slate-100 p-6 pb-16 shadow-[0_8px_30px_rgba(0,0,0,0.2)] rotate-[2deg] hover:rotate-0 transition-all duration-300 dark:text-slate-900",
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