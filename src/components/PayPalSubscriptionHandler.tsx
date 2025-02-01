import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PlanType, calculateValidUntil, getPlanAmount } from "@/utils/paypal-config";

interface PayPalSubscriptionHandlerProps {
  planType: PlanType;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export const usePayPalSubscriptionHandler = ({
  planType,
  onSuccess,
  onError,
}: PayPalSubscriptionHandlerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscriptionSuccess = async (details: any) => {
    try {
      console.log("Processing subscription with details:", details);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("No valid session found. Please log in again.");
      }

      const { error: insertError } = await supabase.from("payments").insert({
        payment_id: details.orderID,
        status: "active",
        amount: getPlanAmount(planType),
        user_id: session.user.id,
        subscription_id: details.subscriptionID,
        subscription_status: "active",
        plan_type: planType,
        valid_until: calculateValidUntil(planType).toISOString(),
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      await supabase.auth.refreshSession();

      toast({
        title: "Subscription Successful",
        description: `Your ${planType} subscription is now active`,
      });
      
      onSuccess();
      
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save subscription details",
      });
      
      if (error.message.includes("session")) {
        navigate('/login');
      }
      
      onError(error);
    }
  };

  return { handleSubscriptionSuccess };
};