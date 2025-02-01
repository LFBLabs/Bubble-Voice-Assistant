import React, { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import Header from "@/components/Header";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import PayPalButton from "@/components/PayPalButton";
import { plans, PlanType } from "@/utils/plan-config";

const Payment = () => {
  const { session, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  React.useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Header 
        title="Choose Your Subscription" 
        description="Select a plan to access all features of Bubble.io Voice Assistant"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.type}
            title={plan.name}
            price={plan.price}
            priceDetail={plan.description}
            features={plan.features}
            isSelected={selectedPlan === plan.type}
            onSelect={() => handlePlanSelect(plan.type)}
            showCheckbox={true}
            isPopular={plan.type === "pro"}
          />
        ))}
      </div>

      {selectedPlan && (
        <div className="max-w-md mx-auto mt-8">
          <PayPalButton planType={selectedPlan} />
        </div>
      )}
    </div>
  );
};

export default Payment;