import React, { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import Header from "@/components/Header";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type PlanType = "starter" | "pro" | "annual";

interface PricingFeature {
  text: string;
}

const starterFeatures: PricingFeature[] = [
  { text: "5 queries per day" },
  { text: "Limited support" },
];

const proFeatures: PricingFeature[] = [
  { text: "Unlimited queries" },
  { text: "Priority support" },
];

const annualFeatures: PricingFeature[] = [
  { text: "Everything in pro" },
];

const Payment = () => {
  const { session, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
        />
        <PricingCard
          title="Pro"
          price="$24"
          priceDetail="/month"
          features={proFeatures}
          isPopular
          isSelected={selectedPlan === "pro"}
          onSelect={() => handlePlanSelect("pro")}
        />
        <PricingCard
          title="Annual"
          price="$230"
          features={annualFeatures}
          isSelected={selectedPlan === "annual"}
          onSelect={() => handlePlanSelect("annual")}
        />
      </div>

      {/* PayPal button will be added here later */}
      {selectedPlan && (
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            PayPal integration coming soon...
          </p>
        </div>
      )}
    </div>
  );
};

export default Payment;