
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoteTabContent from "./NoteTabContent";
import { useNotes } from "@/hooks/useNotes";

const NotesSection = () => {
  const { 
    notes, 
    isLoading, 
    handleNoteChange, 
    handleSave, 
    getNoteContent,
    isUpdating 
  } = useNotes();

  if (isLoading) {
    return <div>Loading notes...</div>;
  }

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Notes</h2>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
          <TabsTrigger value="ideas" className="flex-1">Ideas</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <NoteTabContent
            category="general"
            placeholder="Write your general notes here..."
            content={getNoteContent('general')}
            onChange={(content) => handleNoteChange('general', content)}
            onSave={() => handleSave('general')}
            isDisabled={isUpdating}
          />
        </TabsContent>
        <TabsContent value="features">
          <NoteTabContent
            category="features"
            placeholder="Write your feature notes here..."
            content={getNoteContent('features')}
            onChange={(content) => handleNoteChange('features', content)}
            onSave={() => handleSave('features')}
            isDisabled={isUpdating}
          />
        </TabsContent>
        <TabsContent value="ideas">
          <NoteTabContent
            category="ideas"
            placeholder="Write your ideas here..."
            content={getNoteContent('ideas')}
            onChange={(content) => handleNoteChange('ideas', content)}
            onSave={() => handleSave('ideas')}
            isDisabled={isUpdating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesSection;
