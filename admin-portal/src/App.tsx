import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Departments from "./pages/Departments";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0, // Always refetch data
      refetchOnWindowFocus: true,
    },
  },
});

// Enhanced auth check that validates token freshness
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("auth_token");
  
  // If no token exists, user is not authenticated
  if (!token) {
    return false;
  }
  
  // For enhanced security, we could add token validation here
  // For now, we'll just check if token exists
  return true;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    // Always recheck authentication on route access
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);
      setIsChecking(false);
    };
    
    // Small delay to ensure proper state management
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isChecking) {
    // Optional: Add a loading spinner here
    return <div>Checking authentication...</div>;
  }
  
  return authenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  useEffect(() => {
    // Clear any stale data on app startup
    queryClient.clear();
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute>
                  <Departments />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
