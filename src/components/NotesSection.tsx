import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoteTabContent from "./NoteTabContent";
import { useNotes } from "@/hooks/useNotes";

const NotesSection = () => {
  const {
    isLoading,
    handleNoteChange,
    handleSave,
    getNoteContent,
    isUpdating
  } = useNotes();

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-300">Loading notes...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-4 sm:p-8 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-white mb-6">Notes</h2>
      <Tabs defaultValue="data_types" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <TabsTrigger 
            value="data_types" 
            className="w-full px-3 py-2 text-sm sm:text-base"
          >
            Data
          </TabsTrigger>
          <TabsTrigger 
            value="workflows" 
            className="w-full px-3 py-2 text-sm sm:text-base"
          >
            Workflow
          </TabsTrigger>
          <TabsTrigger 
            value="design" 
            className="w-full px-3 py-2 text-sm sm:text-base"
          >
            Design
          </TabsTrigger>
        </TabsList>
        <TabsContent value="data_types">
          <NoteTabContent
            category="Data Types"
            placeholder="Take notes about Bubble.io data types here..."
            content={getNoteContent('data_types')}
            onChange={(content) => handleNoteChange('data_types', content)}
            onSave={() => handleSave('data_types')}
            isDisabled={isUpdating}
          />
        </TabsContent>
        <TabsContent value="workflows">
          <NoteTabContent
            category="Workflows"
            placeholder="Take notes about Bubble.io workflows here..."
            content={getNoteContent('workflows')}
            onChange={(content) => handleNoteChange('workflows', content)}
            onSave={() => handleSave('workflows')}
            isDisabled={isUpdating}
          />
        </TabsContent>
        <TabsContent value="design">
          <NoteTabContent
            category="Design"
            placeholder="Take notes about Bubble.io design here..."
            content={getNoteContent('design')}
            onChange={(content) => handleNoteChange('design', content)}
            onSave={() => handleSave('design')}
            isDisabled={isUpdating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesSection;