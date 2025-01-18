import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthError } from "@supabase/supabase-js";

const AuthUI = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuthError = (error: AuthError) => {
    console.error("Authentication error:", error);
    let errorMessage = "There was a problem with authentication.";
    
    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Invalid email or password. Please check your credentials and try again.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "Please verify your email address before signing in.";
    }

    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: errorMessage,
    });
  };

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          handleAuthError(sessionError);
          return;
        }

        if (session) {
          navigate("/");
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event);
          
          switch (event) {
            case 'SIGNED_OUT':
              toast({
                title: "Signed Out",
                description: "You have been signed out.",
              });
              break;
              
            case 'SIGNED_IN':
              if (session) {
                toast({
                  title: "Welcome Back",
                  description: "Successfully signed in!",
                });
                navigate("/");
              }
              break;
              
            case 'USER_UPDATED':
              console.log("User data updated");
              break;

            case 'TOKEN_REFRESHED':
              console.log("Session token refreshed");
              break;
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        if (error instanceof AuthError) {
          handleAuthError(error);
        } else {
          console.error("Unexpected error:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
          });
        }
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