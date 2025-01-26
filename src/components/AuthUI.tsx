import React, { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/authErrors';
import { Mic } from 'lucide-react';

const AuthUI = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/', { replace: true });
      }
      if (event === 'USER_UPDATED') {
        const { error } = await supabase.auth.getSession();
        if (error) {
          setErrorMessage(getErrorMessage(error));
        }
      }
      if (event === 'SIGNED_OUT') {
        setErrorMessage('');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6F7] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <Mic className="h-12 w-12 text-primary animate-pulse mt-4" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-secondary mb-2">
            Welcome to Bubble.io Voice Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-border">
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0F3BF5',
                    brandAccent: '#0D32CC',
                    brandButtonText: 'white',
                    defaultButtonBackground: 'white',
                    defaultButtonBackgroundHover: '#F5F6F7',
                    defaultButtonBorder: '#E4E4E7',
                    defaultButtonText: '#1A1A1A',
                    dividerBackground: '#E4E4E7',
                    inputBackground: 'white',
                    inputBorder: '#E4E4E7',
                    inputBorderHover: '#0F3BF5',
                    inputBorderFocus: '#0F3BF5',
                    inputText: '#1A1A1A',
                    inputLabelText: '#71717A',
                    inputPlaceholder: '#A1A1AA',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '4px',
                    socialAuthSpacing: '4px',
                    buttonPadding: '10px',
                    inputPadding: '10px',
                  },
                  fonts: {
                    bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                    buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                    inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                    labelFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '6px',
                    buttonBorderRadius: '6px',
                    inputBorderRadius: '6px',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded-md font-medium transition-colors',
                label: 'text-sm font-medium text-secondary mb-1.5',
                input: 'w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors',
                loader: 'w-4 h-4 border-2 border-primary/30 border-t-primary animate-spin rounded-full',
              },
            }}
            providers={[]}
          />
        </div>

        <div className="mt-6 text-center">
          <blockquote className="text-sm text-muted-foreground">
            "This voice assistant has transformed how I interact with Bubble.io, making development faster and more intuitive."
            <footer className="mt-2 font-medium text-secondary">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;