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
        const { data: { PAYPAL_CLIENT_ID }, error } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'PAYPAL_CLIENT_ID' }
        });
        
        if (error) throw error;
        
        if (PAYPAL_CLIENT_ID) {
          setClientId(PAYPAL_CLIENT_ID);
        } else {
          toast({
            variant: "destructive",
            title: "PayPal Setup Required",
            description: "Please configure your PayPal client ID in the settings.",
          });
        }
      } catch (error) {
        console.error('Error fetching PayPal client ID:', error);
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Unable to load PayPal configuration.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientId();
  }, [toast]);

  if (isLoading) {
    return <div>Loading PayPal configuration...</div>;
  }

  if (!clientId) {
    return <div>PayPal configuration is missing. Please check your settings.</div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "subscription",
        vault: true,
        components: "buttons",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;