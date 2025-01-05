import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthUI from "@/components/AuthUI";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import { Toaster } from "@/components/ui/toaster";
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
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!session ? <AuthUI /> : <Navigate to="/" replace />}
          />
          <Route
            path="/settings"
            element={session ? <Settings /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={session ? <Index /> : <Navigate to="/login" replace />}
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;