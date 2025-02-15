import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PLAN_IDS } from "@/utils/paypal-config";
import type { PlanType } from "@/utils/plan-config";
import { usePayPalSubscriptionHandler } from "./PayPalSubscriptionHandler";

interface PayPalButtonProps {
  planType: PlanType;
}

const PayPalButton = ({ planType }: PayPalButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const { handleSubscriptionSuccess } = usePayPalSubscriptionHandler({
    planType,
    onSuccess: () => {
      setTimeout(() => {
        console.log("Navigating to index page...");
        window.location.href = '/';
      }, 1500);
    },
    onError: () => setIsProcessing(false),
  });

  const planId = PLAN_IDS[planType];

  if (!planId) {
    console.error(`No plan ID found for plan type: ${planType}`);
    return <div className="text-red-500">Configuration error: Invalid plan ID</div>;
  }

  // Get the base URL without any trailing slashes and ensure proper URL formatting
  const baseUrl = window.location.origin.replace(/\/+$/, '');
  
  // Ensure we have valid return URLs
  const returnUrl = new URL('/', baseUrl).toString();
  const cancelUrl = new URL('/payment', baseUrl).toString();

  console.log("Return URL:", returnUrl);
  console.log("Cancel URL:", cancelUrl);

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="text-lg">Processing payment...</div>
        </div>
      )}
      <PayPalButtons
        style={{
          shape: planType === "pro" || planType === "annual" ? "pill" : "rect",
          color: planType === "pro" ? "gold" : "blue",
          layout: "vertical",
          label: "subscribe"
        }}
        createSubscription={(data, actions) => {
          console.log("Creating subscription with plan ID:", planId);
          setIsProcessing(true);
          return actions.subscription.create({
            plan_id: planId,
            application_context: {
              shipping_preference: "NO_SHIPPING",
              user_action: "SUBSCRIBE_NOW",
              return_url: returnUrl,
              cancel_url: cancelUrl
            }
          }).catch(err => {
            console.error("Subscription creation error:", err);
            setIsProcessing(false);
            toast({
              variant: "destructive",
              title: "Subscription Error",
              description: "Failed to create subscription. Please try again.",
            });
            throw err;
          });
        }}
        onApprove={async (data, actions) => {
          console.log("Subscription approved:", data);
          await handleSubscriptionSuccess(data);
        }}
        onCancel={() => {
          setIsProcessing(false);
          console.log("Subscription cancelled by user");
          toast({
            title: "Subscription Cancelled",
            description: "You have cancelled the subscription process.",
          });
        }}
        onError={(err) => {
          setIsProcessing(false);
          console.error("PayPal Error:", err);
          toast({
            variant: "destructive",
            title: "Subscription Error",
            description: "There was an error processing your subscription. Please try again later.",
          });
        }}
      />
    </div>
  );
};

export default PayPalButton;
