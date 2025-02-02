import { Mic } from 'lucide-react';

const AuthHeader = () => {
  return (
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
  );
};

export default AuthHeader;