import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PayPalButtonProps {
  amount: string;
  planType: "trial" | "monthly" | "annual";
}

const PLAN_IDS = {
  monthly: "P-8UV93284A0400005PM6A6CEA",
  annual: "P-72L64754J81152604M6A6HYY", // Updated annual plan ID
  trial: "YOUR_TRIAL_PLAN_ID", // Replace with your trial plan ID when available
};

const PayPalButton = ({ planType }: PayPalButtonProps) => {
  const { toast } = useToast();

  const handleSubscriptionSuccess = async (details: any) => {
    try {
      const validUntil = new Date();
      switch (planType) {
        case "trial":
          validUntil.setDate(validUntil.getDate() + 1);
          break;
        case "monthly":
          validUntil.setMonth(validUntil.getMonth() + 1);
          break;
        case "annual":
          validUntil.setFullYear(validUntil.getFullYear() + 1);
          break;
      }

      const { error } = await supabase.from("payments").insert({
        payment_id: details.orderID,
        status: "active",
        amount: planType === "monthly" ? 29.99 : planType === "annual" ? 299.99 : 1.00,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        subscription_id: details.subscriptionID,
        subscription_status: "active",
        plan_type: planType,
        valid_until: validUntil.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Subscription Successful",
        description: `Your ${planType} subscription is now active`,
      });
    } catch (error) {
      console.error("Error saving subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save subscription details",
      });
    }
  };

  return (
    <PayPalButtons
      style={{
        shape: "pill",
        color: "blue",
        layout: "vertical",
        label: "subscribe"
      }}
      createSubscription={(data, actions) => {
        return actions.subscription.create({
          plan_id: PLAN_IDS[planType],
        });
      }}
      onApprove={async (data, actions) => {
        await handleSubscriptionSuccess(data);
      }}
      onError={(err) => {
        console.error("PayPal Error:", err);
        toast({
          variant: "destructive",
          title: "Subscription Error",
          description: "There was an error processing your subscription",
        });
      }}
    />
  );
};

export default PayPalButton;