import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";

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
    return <div>Loading notes...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-primary mb-6">Notes</h2>
      <Tabs defaultValue="data_types" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data_types">Data Types</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>
        <TabsContent value="data_types" className="space-y-4">
          <Textarea
            placeholder="Take notes about Bubble.io data types here..."
            className="min-h-[200px]"
            value={getNoteContent('data_types')}
            onChange={(e) => handleNoteChange('data_types', e.target.value)}
          />
          <Button 
            onClick={() => handleSave('data_types')}
            className="w-full"
            disabled={updateNoteMutation.isPending}
          >
            <Save className="mr-2" />
            Save Data Types Notes
          </Button>
        </TabsContent>
        <TabsContent value="workflows" className="space-y-4">
          <Textarea
            placeholder="Take notes about Bubble.io workflows here..."
            className="min-h-[200px]"
            value={getNoteContent('workflows')}
            onChange={(e) => handleNoteChange('workflows', e.target.value)}
          />
          <Button 
            onClick={() => handleSave('workflows')}
            className="w-full"
            disabled={updateNoteMutation.isPending}
          >
            <Save className="mr-2" />
            Save Workflows Notes
          </Button>
        </TabsContent>
        <TabsContent value="design" className="space-y-4">
          <Textarea
            placeholder="Take notes about Bubble.io design here..."
            className="min-h-[200px]"
            value={getNoteContent('design')}
            onChange={(e) => handleNoteChange('design', e.target.value)}
          />
          <Button 
            onClick={() => handleSave('design')}
            className="w-full"
            disabled={updateNoteMutation.isPending}
          >
            <Save className="mr-2" />
            Save Design Notes
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesSection;