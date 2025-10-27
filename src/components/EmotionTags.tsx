import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const commonEmotions = [
  "Joy", "Peace", "Love", "Gratitude", "Hope", "Confidence",
  "Sadness", "Anxiety", "Fear", "Anger", "Frustration", "Loneliness",
  "Excitement", "Curiosity", "Wonder", "Inspiration", "Pride", "Relief"
];

interface EmotionTagsProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export const EmotionTags = ({ selectedTags, onTagToggle }: EmotionTagsProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium font-inter">Add emotion tags</label>
      <div className="flex flex-wrap gap-2">
        {commonEmotions.map((emotion) => {
          const isSelected = selectedTags.includes(emotion);
          return (
            <Badge
              key={emotion}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105 font-inter"
              onClick={() => onTagToggle(emotion)}
            >
              {emotion}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};