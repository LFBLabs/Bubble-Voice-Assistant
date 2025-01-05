import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Youtube } from "lucide-react";

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
    return <div className="text-gray-600 dark:text-gray-300">Loading knowledge base...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-8 mb-8">
      <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">Knowledge Base</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-200">Documentation</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="dark:text-gray-300">Title</TableHead>
                <TableHead className="dark:text-gray-300">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.filter(entry => entry.type === 'documentation').map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="dark:text-gray-300">{entry.title}</TableCell>
                  <TableCell>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Docs
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-200">Video Tutorials</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="dark:text-gray-300">Title</TableHead>
                <TableHead className="dark:text-gray-300">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.filter(entry => entry.type === 'video').map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="dark:text-gray-300">{entry.title}</TableCell>
                  <TableCell>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Youtube className="w-4 h-4 mr-1" />
                      Watch Video
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;