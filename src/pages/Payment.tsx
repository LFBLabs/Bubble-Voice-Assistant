import React from "react";
import PaymentSection from "@/components/PaymentSection";
import Header from "@/components/Header";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const { session, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

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