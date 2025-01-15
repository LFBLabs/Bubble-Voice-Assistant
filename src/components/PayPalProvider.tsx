import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PayPalProviderProps {
  children: ReactNode;
}

const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const [clientId, setClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Session error:', sessionError);
          navigate('/login');
          return;
        }

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
        // If there's an authentication error, redirect to login
        if (error instanceof Error && error.message.includes('session')) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientId();
  }, [toast, navigate]);

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
        clientId: clientId,
        currency: "USD",
        intent: "subscription",
        vault: true,
        components: "buttons",
        "enable-funding": "card",
        "disable-funding": "paylater,venmo"
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;