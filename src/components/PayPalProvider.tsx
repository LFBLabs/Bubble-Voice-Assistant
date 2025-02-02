import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { usePayPalClient } from "@/hooks/usePayPalClient";
import { PAYPAL_OPTIONS } from "@/utils/paypal-config";

interface PayPalProviderProps {
  children: ReactNode;
}

const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const { session } = useSupabaseAuth();
  const { clientId, isLoading } = usePayPalClient(session);

  // If no session, just render children without PayPal provider
  if (!session) {
    return <>{children}</>;
  }

  // Show loading state only when logged in and still loading
  if (isLoading && session) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading PayPal configuration...</div>
    </div>;
  }

  // If no clientId, just render children without PayPal provider
  // This allows the app to function without PayPal integration
  if (!clientId && !isLoading && session) {
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        ...PAYPAL_OPTIONS
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;