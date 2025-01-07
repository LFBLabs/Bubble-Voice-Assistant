import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import AuthUI from "@/components/AuthUI";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import Landing from "@/pages/Landing";
import { Toaster } from "@/components/ui/toaster";
import PayPalProvider from "@/components/PayPalProvider";
import "./App.css";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSupabaseAuth();
  const { hasActiveSubscription, isLoading } = useSubscriptionStatus(session?.user?.id);

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!hasActiveSubscription) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { session, loading } = useSupabaseAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PayPalProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                !session ? (
                  <Landing />
                ) : (
                  <Index />
                )
              }
            />
            <Route
              path="/login"
              element={!session ? <AuthUI /> : <Navigate to="/" replace />}
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </PayPalProvider>
    </QueryClientProvider>
  );
}

export default App;