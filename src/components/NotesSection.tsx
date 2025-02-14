
import React from "react";
import { Button } from "@/components/ui/button";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const NotesSection = () => {
  const { knowledgeBase, isLoading } = useKnowledgeBase();
  const { data: subscription } = useSubscriptionStatus();

  const isStarterPlan = !subscription?.plan_type || subscription.plan_type === 'starter';

  if (isLoading) {
    return <div>Loading knowledge base...</div>;
  }

  const activeCount = knowledgeBase?.filter(item => item.active).length || 0;

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Knowledge Base
          {isStarterPlan && (
            <span className="text-sm font-normal text-gray-500">
              ({activeCount} knowledge base entries active)
            </span>
          )}
        </h2>
        <Button
          variant="outline"
          onClick={() => window.open("https://bubble.io/documentation", "_blank")}
        >
          Add From Bubble.io Docs
        </Button>
      </div>
      
      {knowledgeBase?.map(item => (
        <div key={item.id} className="mb-2">
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.content}</p>
        </div>
      ))}
    </div>
  );
};

export default NotesSection;
