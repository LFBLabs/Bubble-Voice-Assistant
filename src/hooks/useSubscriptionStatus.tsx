import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionStatus = (userId: string | undefined) => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .eq("subscription_status", "active")
        .gt("valid_until", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }

      return data;
    },
    enabled: !!userId,
  });

  return {
    hasActiveSubscription: !!subscription,
    isLoading,
  };
};