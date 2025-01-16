import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PayPalButtonProps {
  amount: string;
  planType: "monthly" | "annual";
}

// Sandbox subscription plan IDs
const PLAN_IDS = {
  monthly: "P-3RX63537H5544925PMXYZ", // Monthly sandbox plan ID
  annual: "P-5ML4271244454362XMXYZ",  // Annual sandbox plan ID
};

const PayPalButton = ({ planType }: PayPalButtonProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const planId = PLAN_IDS[planType];

  // Validate plan ID
  if (!planId) {
    console.error(`No plan ID found for plan type: ${planType}`);
    return <div className="text-red-500">Configuration error: Invalid plan ID</div>;
  }

  const handleSubscriptionSuccess = async (details: any) => {
    try {
      setIsProcessing(true);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("No valid session found. Please log in again.");
      }

      const validUntil = new Date();
      switch (planType) {
        case "monthly":
          validUntil.setMonth(validUntil.getMonth() + 1);
          break;
        case "annual":
          validUntil.setFullYear(validUntil.getFullYear() + 1);
          break;
      }

      const { error: insertError } = await supabase.from("payments").insert({
        payment_id: details.orderID,
        status: "active",
        amount: planType === "monthly" ? 29.99 : 299.99,
        user_id: session.user.id,
        subscription_id: details.subscriptionID,
        subscription_status: "active",
        plan_type: planType,
        valid_until: validUntil.toISOString(),
      });

      if (insertError) throw insertError;

      toast({
        title: "Subscription Successful",
        description: `Your ${planType} subscription is now active`,
      });
      
      navigate('/');
      
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save subscription details",
      });
      
      // If session error, redirect to login
      if (error.message.includes("session")) {
        navigate('/login');
      }
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
          console.log("Creating subscription with plan ID:", planId);
          return actions.subscription.create({
            plan_id: planId,
            application_context: {
              shipping_preference: "NO_SHIPPING",
              return_url: `${window.location.origin}/`,
              cancel_url: `${window.location.origin}/payment`
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