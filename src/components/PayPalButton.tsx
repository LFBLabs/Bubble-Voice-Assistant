import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface PayPalButtonProps {
  amount: string;
  planType: "monthly" | "annual";
}

// Updated plan IDs - these should match your PayPal subscription plans
const PLAN_IDS = {
  monthly: "P-5ML4271244454362XMXYZ", // Replace with your actual monthly plan ID
  annual: "P-3RX63537H5544925PMXYZ",  // Replace with your actual annual plan ID
};

const PayPalButton = ({ planType }: PayPalButtonProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscriptionSuccess = async (details: any) => {
    try {
      setIsProcessing(true);
      const validUntil = new Date();
      switch (planType) {
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
        amount: planType === "monthly" ? 29.99 : 299.99,
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
      
      // Redirect to the main page after successful subscription
      window.location.href = '/';
      
    } catch (error) {
      console.error("Error saving subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save subscription details",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="text-lg">Processing payment...</div>
        </div>
      )}
      <PayPalButtons
        style={{
          shape: "rect",
          color: "blue",
          layout: "vertical",
          label: "subscribe"
        }}
        createSubscription={(data, actions) => {
          return actions.subscription.create({
            plan_id: PLAN_IDS[planType],
            application_context: {
              shipping_preference: "NO_SHIPPING"
            }
          });
        }}
        onApprove={async (data, actions) => {
          console.log("Subscription approved:", data);
          await handleSubscriptionSuccess(data);
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          toast({
            variant: "destructive",
            title: "Subscription Error",
            description: "There was an error processing your subscription. Please try again.",
          });
        }}
      />
    </div>
  );
};

export default PayPalButton;