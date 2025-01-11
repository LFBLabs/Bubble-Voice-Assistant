import React from "react";
import VoiceAssistant from "@/components/VoiceAssistant";
import PaymentSection from "@/components/PaymentSection";

const Index = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <VoiceAssistant />
      <PaymentSection />
    </div>
  );
};

export default Index;