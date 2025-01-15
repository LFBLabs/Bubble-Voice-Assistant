import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AuthUI = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize session state
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session on mount
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem checking your login status.",
          });
          return;
        }

        if (session) {
          // If we have a valid session, navigate to home
          navigate("/");
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event);
          
          switch (event) {
            case 'SIGNED_OUT':
              toast({
                variant: "destructive",
                title: "Signed Out",
                description: "You have been signed out.",
              });
              break;
              
            case 'SIGNED_IN':
              if (session) {
                toast({
                  title: "Signed In",
                  description: "Successfully signed in!",
                });
                navigate("/");
              }
              break;
              
            case 'TOKEN_REFRESHED':
              console.log("Session token refreshed");
              break;
              
            case 'USER_UPDATED':
              console.log("User data updated");
              break;
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem initializing authentication.",
        });
      }
    };

    initializeAuth();
  }, [toast, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Bubble.io Voice Assistant</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6366f1',
                  brandAccent: '#4f46e5',
                }
              }
            }
          }}
          theme="light"
          providers={['google']}
          redirectTo={`${window.location.origin}/login`}
        />
      </div>
    </div>
  );
};

export default AuthUI;