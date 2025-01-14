import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PayPalProviderProps {
  children: ReactNode;
}

const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const [clientId, setClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'PAYPAL_CLIENT_ID' }
        });
        
        if (error) throw error;
        
        if (data?.PAYPAL_CLIENT_ID) {
          setClientId(data.PAYPAL_CLIENT_ID);
          console.log("PayPal Client ID fetched successfully");
        } else {
          throw new Error('PayPal Client ID not found');
        }
      } catch (error) {
        console.error('Error fetching PayPal client ID:', error);
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Unable to load PayPal configuration. Please check your credentials.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientId();
  }, [toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading PayPal configuration...</div>
    </div>;
  }

  if (!clientId) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-red-500">PayPal configuration error. Please check your credentials.</div>
    </div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        vault: true,
        intent: "subscription",
        components: "buttons",
        "enable-funding": "card",
        "disable-funding": "paylater,venmo",
        "data-namespace": "PayPalSDK",
        currency: "USD",
        "client-id": clientId, // Add this line
        "merchant-id": "sb", // Add this line for sandbox testing
        "data-client-token": "sandbox_8hj2m9vz_dcpspy2jw4x9p32q", // Add this line for sandbox testing
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;