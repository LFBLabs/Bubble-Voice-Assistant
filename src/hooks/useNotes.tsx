import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useNotes = () => {
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

  return {
    notes,
    isLoading,
    localNotes,
    handleNoteChange,
    handleSave,
    getNoteContent,
    isUpdating: updateNoteMutation.isPending
  };
};