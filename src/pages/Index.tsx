import React from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import VoiceAssistant from "@/components/VoiceAssistant";
import PaymentSection from "@/components/PaymentSection";

const Index = () => {
  const { session } = useSupabaseAuth();
  const { hasActiveSubscription, isLoading } = useSubscriptionStatus(session?.user?.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasActiveSubscription) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">Subscribe to Access the App</h1>
          <PaymentSection />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <VoiceAssistant />
    </div>
  );
};

export default Index;