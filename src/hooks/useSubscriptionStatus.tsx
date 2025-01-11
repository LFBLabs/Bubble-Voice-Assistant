import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*")
        .eq("subscription_status", "active")
        .gte("valid_until", new Date().toISOString())
        .order("valid_until", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      return payments;
    },
  });
};