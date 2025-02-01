import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

export const usePayPalClient = (session: Session | null) => {
  const [clientId, setClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isSubscribed = true;

    const initializePayPal = async () => {
      try {
        if (!session) {
          console.log('No active session, skipping PayPal initialization');
          if (isSubscribed) {
            setIsLoading(false);
            setClientId("");
          }
          return;
        }

        console.log("Initializing PayPal with session:", session.user.id);

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
          console.log("Successfully fetched PayPal client ID");
          setClientId(data.PAYPAL_CLIENT_ID);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('PayPal initialization error:', error);
        if (isSubscribed && session) {
          toast({
            variant: "destructive",
            title: "PayPal Configuration Error",
            description: "Unable to initialize PayPal. Please try again later.",
          });
          
          if (error.message?.includes('auth')) {
            navigate('/login');
          }
        }
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    initializePayPal();

    return () => {
      isSubscribed = false;
    };
  }, [session, toast, navigate]);

  return { clientId, isLoading };
};