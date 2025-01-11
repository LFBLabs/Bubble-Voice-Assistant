import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PayPalButtonProps {
  amount: string;
  planType: "trial" | "monthly" | "annual";
}

const PayPalButton = ({ amount, planType }: PayPalButtonProps) => {
  const { toast } = useToast();

  const handlePaymentSuccess = async (details: any) => {
    try {
      const validUntil = new Date();
      switch (planType) {
        case "trial":
          validUntil.setDate(validUntil.getDate() + 1); // 1 day
          break;
        case "monthly":
          validUntil.setMonth(validUntil.getMonth() + 1);
          break;
        case "annual":
          validUntil.setFullYear(validUntil.getFullYear() + 1);
          break;
      }

      const { error } = await supabase.from("payments").insert({
        payment_id: details.id,
        status: details.status,
        amount: parseFloat(amount),
        user_id: (await supabase.auth.getUser()).data.user?.id,
        subscription_id: details.subscription_id || null,
        subscription_status: "active",
        plan_type: planType,
        valid_until: validUntil.toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Payment Successful",
        description: `Your ${planType} subscription is now active`,
      });
    } catch (error) {
      console.error("Error saving payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save payment details",
      });
    }
  };

  return (
    <PayPalButtons
      style={{ layout: "horizontal" }}
      createOrder={(data, actions) => {
        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount,
              },
              description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription`,
            },
          ],
        });
      }}
      onApprove={async (data, actions) => {
        if (actions.order) {
          const details = await actions.order.capture();
          await handlePaymentSuccess(details);
        }
      }}
      onError={(err) => {
        console.error("PayPal Error:", err);
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "There was an error processing your payment",
        });
      }}
    />
  );
};

export default PayPalButton;