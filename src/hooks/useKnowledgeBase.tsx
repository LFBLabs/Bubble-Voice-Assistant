
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  type: string;
  active: boolean;
  url?: string | null;
  created_at: string;
  updated_at: string;
}

export const useKnowledgeBase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: knowledgeBase, isLoading } = useQuery({
    queryKey: ['knowledgeBase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching knowledge base:', error);
        toast({
          title: "Error fetching knowledge base",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as KnowledgeBaseEntry[];
    },
  });

  const addEntry = useMutation({
    mutationFn: async (entry: Omit<KnowledgeBaseEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert([entry])
        .select()
        .single();

      if (error) {
        console.error('Error adding knowledge base entry:', error);
        toast({
          title: "Error adding entry",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      toast({
        title: "Success",
        description: "Knowledge base entry added successfully",
      });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...entry }: Partial<KnowledgeBaseEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .update(entry)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating knowledge base entry:', error);
        toast({
          title: "Error updating entry",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      toast({
        title: "Success",
        description: "Knowledge base entry updated successfully",
      });
    },
  });

  const toggleEntryStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .update({ active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling knowledge base entry status:', error);
        toast({
          title: "Error updating status",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      toast({
        title: "Success",
        description: "Entry status updated successfully",
      });
    },
  });

  return {
    knowledgeBase,
    isLoading,
    addEntry,
    updateEntry,
    toggleEntryStatus,
  };
};
