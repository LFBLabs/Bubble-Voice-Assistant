import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import PayPalButton from "./PayPalButton";
import { PlanOption } from "./PlanOption";
import { plans, PlanType } from "@/utils/plan-config";

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
              <PlanOption key={plan.type} plan={plan} />
            ))}
          </RadioGroup>
        </div>
        {selectedPlan && currentPlan && (
          <div className="w-full max-w-md mx-auto">
            <PayPalButton planType={currentPlan.type} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentSection;