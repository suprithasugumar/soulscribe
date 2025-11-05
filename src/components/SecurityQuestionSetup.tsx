import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SecurityQuestionSetupProps {
  question: string;
  answer: string;
  onQuestionChange: (question: string) => void;
  onAnswerChange: (answer: string) => void;
}

const predefinedQuestions = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "In what city did you meet your spouse/partner?",
  "What is the name of your favorite teacher?",
  "Custom question (type your own)"
];

export const SecurityQuestionSetup = ({
  question,
  answer,
  onQuestionChange,
  onAnswerChange
}: SecurityQuestionSetupProps) => {
  const [useCustom, setUseCustom] = useState(false);

  const handleQuestionSelect = (value: string) => {
    if (value === "Custom question (type your own)") {
      setUseCustom(true);
      onQuestionChange("");
    } else {
      setUseCustom(false);
      onQuestionChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Security Question *</Label>
        <Select value={useCustom ? "Custom question (type your own)" : question} onValueChange={handleQuestionSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a security question" />
          </SelectTrigger>
          <SelectContent>
            {predefinedQuestions.map((q) => (
              <SelectItem key={q} value={q}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {useCustom && (
          <Input
            type="text"
            placeholder="Type your custom security question"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            className="mt-2"
          />
        )}
      </div>
      <div className="space-y-2">
        <Label>Security Answer *</Label>
        <Input
          type="text"
          placeholder="Enter your answer"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          This will be required if you ever need to change your secret lock PIN
        </p>
      </div>
    </div>
  );
};
