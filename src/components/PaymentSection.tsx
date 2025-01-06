import { useState } from "react";
import { Card } from "@/components/ui/card";
import PayPalButton from "./PayPalButton";
import { useToast } from "@/hooks/use-toast";

const PaymentSection = () => {
  const [amount, setAmount] = useState("10.00");
  const { toast } = useToast();

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Thank you for your payment!",
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Make a Payment</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="amount" className="font-medium">
            Amount ($):
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <div className="w-full max-w-md">
          <PayPalButton amount={amount} />
        </div>
      </div>
    </Card>
  );
};

export default PaymentSection;