import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface NoteTabContentProps {
  category: string;
  placeholder: string;
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  isDisabled: boolean;
}

const NoteTabContent = ({
  category,
  placeholder,
  content,
  onChange,
  onSave,
  isDisabled,
}: NoteTabContentProps) => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder={placeholder}
        className="min-h-[200px]"
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button 
        onClick={onSave}
        className="w-full"
        disabled={isDisabled}
      >
        <Save className="mr-2" />
        Save {category} Notes
      </Button>
    </div>
  );
};

export default NoteTabContent;