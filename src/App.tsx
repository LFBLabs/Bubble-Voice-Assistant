import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthUI from "@/components/AuthUI";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import Landing from "@/pages/Landing";
import Payment from "@/pages/Payment";
import { Toaster } from "@/components/ui/toaster";
import PayPalProvider from "@/components/PayPalProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthenticatedRoute } from "@/components/AuthenticatedRoute";
import "./App.css";

const queryClient = new QueryClient();

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