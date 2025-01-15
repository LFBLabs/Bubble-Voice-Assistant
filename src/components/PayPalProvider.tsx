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
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please sign in again.",
          });
          navigate('/login');
          return;
        }

        if (!session) {
          console.log('No active session found');
          navigate('/login');
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_OUT' || !session) {
            navigate('/login');
          }
        });

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
          description: "Unable to load PayPal configuration. Please try again later.",
        });
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientId();

    // Cleanup subscription on unmount
    return () => {
      supabase.auth.onAuthStateChange(() => {}).data.subscription.unsubscribe();
    };
  }, [toast, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading PayPal configuration...</div>
    </div>;
  }

  if (!clientId) {
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
        "disable-funding": "paylater,venmo"
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;