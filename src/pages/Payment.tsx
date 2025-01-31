import React, { useState } from "react";
import { PricingCard } from "@/components/PricingCard";
import Header from "@/components/Header";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type PlanType = "monthly" | "annual";

interface PricingFeature {
  text: string;
}

const monthlyFeatures: PricingFeature[] = [
  { text: "Access to all features" },
  { text: "Unlimited voice interactions" },
  { text: "Priority support" },
  { text: "Regular updates" },
];

const annualFeatures: PricingFeature[] = [
  { text: "All monthly features" },
  { text: "15% discount" },
  { text: "Premium support" },
  { text: "Early access to new features" },
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingCard
          title="Monthly"
          price="$24"
          description="Billed monthly"
          features={monthlyFeatures}
          isSelected={selectedPlan === "monthly"}
          onSelect={() => handlePlanSelect("monthly")}
        />
        <PricingCard
          title="Annual"
          price="$245"
          description="Billed annually (Save 15%)"
          features={annualFeatures}
          isPopular
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