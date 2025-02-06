import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export const useVoiceInteraction = () => {
  const [isLimitReached, setIsLimitReached] = useState(false);
  const { toast } = useToast();
  const { data: subscription } = useSubscriptionStatus();

  const checkInteractionLimit = async () => {
    console.log('Checking interaction limit');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please sign in to continue.');
      }

      // Check subscription status for unlimited interactions
      if (subscription && ['pro', 'annual'].includes(subscription.plan_type)) {
        console.log('User has unlimited interactions');
        return true;
      }

      const { data, error } = await supabase.rpc('get_daily_interaction_count', {
        user_id: session.user.id
      });

      if (error) {
        console.error("Error checking interaction limit:", error);
        throw error;
      }

      console.log("Daily interaction count:", data);

      if (data >= 10) {
        setIsLimitReached(true);
        toast({
          title: "Daily Limit Reached",
          description: "You've reached your daily limit of 10 interactions. Upgrade to Pro for unlimited interactions.",
          variant: "destructive",
          action: (
            <button
              onClick={() => window.location.href = '/payment'}
              className="bg-primary text-white px-3 py-1 rounded-md text-sm"
            >
              Upgrade
            </button>
          ),
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking interaction limit:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check interaction limit. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const recordInteraction = async () => {
    console.log('Recording interaction');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        return;
      }

      const { error } = await supabase
        .from('voice_interactions')
        .insert([{ user_id: session.user.id }]);

      if (error) {
        console.error("Error recording interaction:", error);
        throw error;
      }
      
      console.log('Interaction recorded successfully');
      
    } catch (error) {
      console.error("Error recording interaction:", error);
    }
  };

  return {
    isLimitReached,
    checkInteractionLimit,
    recordInteraction
  };
};