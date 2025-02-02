import React from 'react';
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const SubscriptionStatus = () => {
  const { data: subscription, isLoading } = useSubscriptionStatus();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-center">Loading subscription status...</div>;
  }

  const getPlanBadgeColor = (planType: string | null | undefined) => {
    switch (planType) {
      case 'pro':
        return 'bg-blue-500';
      case 'annual':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatPlanName = (planType: string | null | undefined) => {
    if (!planType) return 'Starter';
    return planType.charAt(0).toUpperCase() + planType.slice(1);
  };

  const validUntil = subscription?.valid_until 
    ? new Date(subscription.valid_until).toLocaleDateString()
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Badge className={`${getPlanBadgeColor(subscription?.plan_type)} text-white px-3 py-1`}>
          {formatPlanName(subscription?.plan_type)} Plan
        </Badge>
        {validUntil && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Valid until: {validUntil}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => navigate('/payment')}
          className="min-w-[200px]"
        >
          {subscription?.plan_type ? 'Change Plan' : 'Upgrade Plan'}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionStatus;