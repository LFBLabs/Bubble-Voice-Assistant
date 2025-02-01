import React, { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import Header from "@/components/Header";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import PayPalButton from "@/components/PayPalButton";

type PlanType = "starter" | "pro" | "monthly" | "annual";

interface PricingFeature {
  text: string;
}

const starterFeatures: PricingFeature[] = [
  { text: "3 day free trial" },
  { text: "10 voice interactions per day" },
  { text: "Limited support" },
  { text: "Limited updates" },
];

const proFeatures: PricingFeature[] = [
  { text: "Unlimited voice interactions" },
  { text: "Priority support" },
  { text: "Unlimited updates" },
];

const annualFeatures: PricingFeature[] = [
  { text: "Everything in pro" },
];

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
        <PricingCard
          title="Starter"
          price="$15"
          priceDetail="/month"
          features={starterFeatures}
          isSelected={selectedPlan === "starter"}
          onSelect={() => handlePlanSelect("starter")}
          showCheckbox={true}
        />
        <PricingCard
          title="Pro"
          price="$24"
          priceDetail="/month"
          features={proFeatures}
          isPopular
          isSelected={selectedPlan === "pro"}
          onSelect={() => handlePlanSelect("pro")}
          showCheckbox={true}
        />
        <PricingCard
          title="Annual"
          price="$230"
          features={annualFeatures}
          isSelected={selectedPlan === "annual"}
          onSelect={() => handlePlanSelect("annual")}
          showCheckbox={true}
        />
      </div>

      {selectedPlan && (
        <div className="max-w-md mx-auto mt-8">
          <PayPalButton 
            amount={selectedPlan === "starter" ? "15.00" : selectedPlan === "pro" ? "24.00" : "230.00"} 
            planType={selectedPlan} 
          />
        </div>
      )}
    </div>
  );
};

export default Payment;