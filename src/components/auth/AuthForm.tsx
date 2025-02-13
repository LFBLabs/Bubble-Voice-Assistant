
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

interface AuthFormProps {
  errorMessage: string;
  className?: string;
}

const AuthForm = ({ errorMessage, className }: AuthFormProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border border-border ${className || ''}`}>
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
  );
};

export default AuthForm;
