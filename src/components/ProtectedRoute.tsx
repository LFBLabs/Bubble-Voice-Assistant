import { Navigate } from "react-router-dom";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: subscription, isLoading, error } = useSubscriptionStatus();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading subscription status...</div>
      </div>
    );
  }

  if (error) {
    console.error("Subscription error:", error);
    return <Navigate to="/payment" replace />;
  }
  
  if (!subscription) {
    return <Navigate to="/payment" replace />;
  }
  
  return <>{children}</>;
}