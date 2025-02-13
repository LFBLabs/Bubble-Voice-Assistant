
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";

export const pricingPlans = [
  {
    title: "Starter",
    price: "$15",
    priceDetail: "/month",
    features: [
      { text: "3 days free trial" },
      { text: "10 voice interactions per day" },
      { text: "Limited support" },
      { text: "Limited updates" },
    ],
  },
  {
    title: "Pro",
    price: "$24",
    priceDetail: "/month",
    features: [
      { text: "5 days free trial" },
      { text: "Unlimited voice interactions" },
      { text: "Priority support" },
      { text: "Unlimited updates" },
    ],
    isPopular: true,
  },
  {
    title: "Annual",
    price: "$230",
    features: [
      { text: "Everything in pro" },
    ],
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-8">
      <h2 className="text-3xl font-bold text-center text-foreground mb-8">Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <PricingCard
            key={index}
            title={plan.title}
            price={plan.price}
            priceDetail={plan.priceDetail}
            features={plan.features}
            isPopular={plan.isPopular}
          />
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          className="text-lg gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105"
          onClick={() => navigate("/login")}
        >
          Start Free Trial
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default PricingSection;
