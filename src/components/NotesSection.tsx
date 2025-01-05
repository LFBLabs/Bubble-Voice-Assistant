import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import NoteTabContent from "./NoteTabContent";

const NotesSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localNotes, setLocalNotes] = useState<{ [key: string]: string }>({});

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ category, content }: { category: string, content: string }) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      const existingNote = notes?.find(note => note.category === category);
      
      if (existingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ content })
          .eq('id', existingNote.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{ 
            category, 
            content,
            user_id: user.id 
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: "Note saved successfully",
        description: "Your note has been saved to the database.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving note",
        description: "There was an error saving your note. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving note:", error);
    },
  });

  const handleNoteChange = (category: string, content: string) => {
    setLocalNotes(prev => ({ ...prev, [category]: content }));
  };

  const handleSave = async (category: string) => {
    const content = localNotes[category] || getNoteContent(category);
    updateNoteMutation.mutate({ category, content });
  };

  const getNoteContent = (category: string) => {
    if (category in localNotes) {
      return localNotes[category];
    }
    return notes?.find(note => note.category === category)?.content || '';
  };

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-300">Loading notes...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-8 mb-8">
      <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">Notes</h2>
      <Tabs defaultValue="data_types" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data_types">Data Types</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>
        <TabsContent value="data_types">
          <NoteTabContent
            category="Data Types"
            placeholder="Take notes about Bubble.io data types here..."
            content={getNoteContent('data_types')}
            onChange={(content) => handleNoteChange('data_types', content)}
            onSave={() => handleSave('data_types')}
            isDisabled={updateNoteMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="workflows">
          <NoteTabContent
            category="Workflows"
            placeholder="Take notes about Bubble.io workflows here..."
            content={getNoteContent('workflows')}
            onChange={(content) => handleNoteChange('workflows', content)}
            onSave={() => handleSave('workflows')}
            isDisabled={updateNoteMutation.isPending}
          />
        </TabsContent>
        <TabsContent value="design">
          <NoteTabContent
            category="Design"
            placeholder="Take notes about Bubble.io design here..."
            content={getNoteContent('design')}
            onChange={(content) => handleNoteChange('design', content)}
            onSave={() => handleSave('design')}
            isDisabled={updateNoteMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesSection;