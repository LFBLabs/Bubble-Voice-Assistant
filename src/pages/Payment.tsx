import React from "react";
import PaymentSection from "@/components/PaymentSection";
import Header from "@/components/Header";

const Payment = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <Header 
        title="Choose Your Subscription" 
        description="Select a plan to access all features of Bubble.io Voice Assistant"
      />
      <PaymentSection />
    </div>
  );
};

export default Payment;