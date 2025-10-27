import { Button } from "@/components/ui/button";

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😡", label: "Angry", value: "angry" },
  { emoji: "🤗", label: "Grateful", value: "grateful" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "🤩", label: "Excited", value: "excited" },
];

interface MoodSelectorProps {
  selectedMood: string;
  onMoodSelect: (mood: string) => void;
}

export const MoodSelector = ({ selectedMood, onMoodSelect }: MoodSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium font-inter">How are you feeling?</label>
      <div className="grid grid-cols-4 gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            type="button"
            variant={selectedMood === mood.value ? "default" : "outline"}
            className="h-20 flex flex-col gap-1 transition-all hover:scale-105"
            onClick={() => onMoodSelect(mood.value)}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs font-inter">{mood.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};