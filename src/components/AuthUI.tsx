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
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error checking session:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem checking your login status.",
        });
      } else if (session) {
        navigate("/");
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_OUT') {
        toast({
          variant: "destructive",
          title: "Signed Out",
          description: "You have been signed out.",
        });
      } else if (event === 'SIGNED_IN') {
        toast({
          title: "Signed In",
          description: "Successfully signed in!",
        });
        navigate("/");
      } else if (event === 'USER_UPDATED') {
        console.log("User updated");
      } else if (event === 'AUTH_ERROR') {
        console.error("Auth error occurred:", session);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem with authentication.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default AuthUI;