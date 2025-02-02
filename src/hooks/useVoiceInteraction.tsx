import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export const useVoiceInteraction = () => {
  const [isLimitReached, setIsLimitReached] = useState(false);
  const { toast } = useToast();
  const { data: subscription } = useSubscriptionStatus();

  const checkInteractionLimit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        return false;
      }

      // If user has an active pro or annual subscription, allow unlimited interactions
      if (subscription && ['pro', 'annual'].includes(subscription.plan_type)) {
        return true;
      }

      const { data: count, error } = await supabase.rpc(
        'get_daily_interaction_count',
        { user_id: session.user.id }
      );

      if (error) {
        throw error;
      }

      if (count >= 10) {
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
        description: "Failed to check interaction limit.",
        variant: "destructive",
      });
      return false;
    }
  };

  const recordInteraction = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { error } = await supabase
        .from('voice_interactions')
        .insert([{ user_id: session.user.id }]);

      if (error) throw error;
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