import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const KnowledgeBase = () => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['knowledge_base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div>Loading knowledge base...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-primary mb-6">Knowledge Base</h2>
      <div className="space-y-4">
        {entries?.map((entry) => (
          <div key={entry.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">{entry.title}</h3>
            {entry.content && (
              <p className="text-gray-600">{entry.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;