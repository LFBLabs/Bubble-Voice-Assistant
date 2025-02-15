
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

  const [selectedTab, setSelectedTab] = React.useState("general");

  if (isLoading) {
    return <div>Loading notes...</div>;
  }

  const getTabDisplayName = (category: string) => {
    switch (category) {
      case "general": return "Data";
      case "features": return "Workflows";
      case "ideas": return "Design";
      default: return category;
    }
  };

  return <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Notes</h2>
      <Tabs 
        defaultValue="general" 
        className="w-full"
        onValueChange={setSelectedTab}
      >
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">Data</TabsTrigger>
          <TabsTrigger value="features" className="flex-1">Workflows</TabsTrigger>
          <TabsTrigger value="ideas" className="flex-1">Design</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <NoteTabContent 
            category="general" 
            placeholder="Write your data notes here..." 
            content={getNoteContent('general')} 
            onChange={content => handleNoteChange('general', content)} 
            onSave={() => handleSave('general')} 
            isDisabled={isUpdating}
            displayName={getTabDisplayName('general')}
          />
        </TabsContent>
        <TabsContent value="features">
          <NoteTabContent 
            category="features" 
            placeholder="Write your workflow notes here..." 
            content={getNoteContent('features')} 
            onChange={content => handleNoteChange('features', content)} 
            onSave={() => handleSave('features')} 
            isDisabled={isUpdating}
            displayName={getTabDisplayName('features')}
          />
        </TabsContent>
        <TabsContent value="ideas">
          <NoteTabContent 
            category="ideas" 
            placeholder="Write your design notes here..." 
            content={getNoteContent('ideas')} 
            onChange={content => handleNoteChange('ideas', content)} 
            onSave={() => handleSave('ideas')} 
            isDisabled={isUpdating}
            displayName={getTabDisplayName('ideas')}
          />
        </TabsContent>
      </Tabs>
    </div>;
};

export default NotesSection;
