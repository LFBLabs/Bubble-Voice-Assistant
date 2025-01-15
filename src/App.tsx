import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import AuthUI from "@/components/AuthUI";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import Landing from "@/pages/Landing";
import Payment from "@/pages/Payment";
import { Toaster } from "@/components/ui/toaster";
import PayPalProvider from "@/components/PayPalProvider";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: subscription, isLoading, error } = useSubscriptionStatus();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading subscription status...</div>
    </div>;
  }

  if (error) {
    console.error("Subscription error:", error);
    return <Navigate to="/payment" replace />;
  }
  
  if (!subscription) {
    return <Navigate to="/payment" replace />;
  }
  
  return <>{children}</>;
}

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSupabaseAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
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
      <Router>
        <PayPalProvider>
          <Routes>
            <Route
              path="/"
              element={!session ? <Landing /> : (
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/login"
              element={!session ? <AuthUI /> : <Navigate to="/" replace />}
            />
            <Route
              path="/payment"
              element={
                <AuthenticatedRoute>
                  <Payment />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthenticatedRoute>
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                </AuthenticatedRoute>
              }
            />
          </Routes>
          <Toaster />
        </PayPalProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;