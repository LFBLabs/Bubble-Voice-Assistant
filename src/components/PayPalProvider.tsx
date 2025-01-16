import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface PayPalProviderProps {
  children: ReactNode;
}

const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const [clientId, setClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useSupabaseAuth();

  useEffect(() => {
    let isSubscribed = true;

    const initializePayPal = async () => {
      try {
        if (!session) {
          console.log('No active session, skipping PayPal initialization');
          return;
        }

        // Fetch PayPal client ID
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'PAYPAL_CLIENT_ID' }
        });
        
        if (error) {
          console.error('Error fetching PayPal client ID:', error);
          throw error;
        }
        
        if (!data?.PAYPAL_CLIENT_ID) {
          throw new Error('PayPal Client ID not found in response');
        }

        if (isSubscribed) {
          console.log("Initializing PayPal with client ID:", data.PAYPAL_CLIENT_ID);
          setClientId(data.PAYPAL_CLIENT_ID);
        }
      } catch (error: any) {
        console.error('PayPal initialization error:', error);
        if (isSubscribed) {
          toast({
            variant: "destructive",
            title: "PayPal Configuration Error",
            description: "Unable to initialize PayPal. Please try again later.",
          });
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    initializePayPal();

    return () => {
      isSubscribed = false;
    };
  }, [session, toast]);

  if (isLoading && session) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading PayPal configuration...</div>
    </div>;
  }

  if (!session) {
    return <>{children}</>;
  }

  if (!clientId && !isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-red-500">PayPal configuration error. Please try again later.</div>
    </div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: "USD",
        intent: "subscription",
        vault: true,
        components: "buttons",
        "enable-funding": "card",
        "disable-funding": "paylater,venmo",
        // Always use sandbox environment for testing
        environment: "sandbox"
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;