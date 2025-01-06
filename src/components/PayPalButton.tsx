import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PayPalButtonProps {
  amount: string;
}

const PayPalButton = ({ amount }: PayPalButtonProps) => {
  const { toast } = useToast();

  const handlePaymentSuccess = async (details: any) => {
    try {
      const { error } = await supabase.from("payments").insert({
        payment_id: details.id,
        status: details.status,
        amount: parseFloat(amount),
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast({
        title: "Payment Successful",
        description: `Payment ID: ${details.id}`,
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