import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthUI from "@/components/AuthUI";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import Landing from "@/pages/Landing";
import { Toaster } from "@/components/ui/toaster";
import PayPalProvider from "@/components/PayPalProvider";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

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
              element={!session ? <Landing /> : <Index />}
            />
            <Route
              path="/login"
              element={!session ? <AuthUI /> : <Navigate to="/" replace />}
            />
            <Route
              path="/settings"
              element={session ? <Settings /> : <Navigate to="/login" replace />}
            />
          </Routes>
          <Toaster />
        </Router>
      </PayPalProvider>
    </QueryClientProvider>
  );
}

export default App;