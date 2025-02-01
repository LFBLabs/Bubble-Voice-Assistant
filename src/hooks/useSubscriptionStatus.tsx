import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSubscriptionStatus = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: async () => {
      try {
        const { data: payments, error } = await supabase
          .from("payments")
          .select("*")
          .eq("subscription_status", "active")
          .gte("valid_until", new Date().toISOString())
          .order("valid_until", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Subscription status error:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to check subscription status. Please try again.",
          });
          throw error;
        }

        return payments;
      } catch (error) {
        console.error("Subscription status error:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};