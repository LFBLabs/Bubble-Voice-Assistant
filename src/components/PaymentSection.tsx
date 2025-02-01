import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import PayPalButton from "./PayPalButton";

type PlanType = "starter" | "pro" | "monthly" | "annual";

interface Plan {
  type: PlanType;
  name: string;
  price: string;
  description: string;
}

const plans: Plan[] = [
  {
    type: "starter",
    name: "Starter Plan",
    price: "15.00",
    description: "Billed monthly",
  },
  {
    type: "pro",
    name: "Pro Plan",
    price: "24.00",
    description: "Billed monthly",
  },
  {
    type: "monthly",
    name: "Monthly Plan",
    price: "24.00",
    description: "Billed monthly",
  },
  {
    type: "annual",
    name: "Annual Plan",
    price: "245.00",
    description: "Billed annually (Save 15%)",
  },
];

const PaymentSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const currentPlan = selectedPlan ? plans.find((plan) => plan.type === selectedPlan)! : null;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Choose Your Plan</h2>
          <RadioGroup
            value={selectedPlan || ""}
            onValueChange={(value) => setSelectedPlan(value as PlanType)}
            className="grid gap-4"
          >
            {plans.map((plan) => (
              <div
                key={plan.type}
                className="flex items-center space-x-4 border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <RadioGroupItem value={plan.type} id={plan.type} />
                <Label htmlFor={plan.type} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.description}
                      </div>
                    </div>
                    <div className="text-lg font-semibold">${plan.price}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        {selectedPlan && currentPlan && (
          <div className="w-full max-w-md mx-auto">
            <PayPalButton amount={currentPlan.price} planType={currentPlan.type} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentSection;