import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Authentication/Login";
import Register from "./pages/Authentication/Register";
import InstitutionRegister from "./pages/Authentication/InstitutionRegister";
import Dashboard from "./pages/passengers/Dashboard";
import SearchRoutes from "./pages/SearchRoutes";
import RouteDetail from "./pages/passengers/RouteDetail";
import MyTrips from "@/pages/passengers/MyTrips";
import Incidents from "./pages/passengers/Incidents";
import FavoriteRoutes from "./pages/passengers/FavoriteRoutes";
import MapView from "./pages/passengers/MapView";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/institution-register" element={<InstitutionRegister />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search-routes" 
        element={
          <ProtectedRoute>
            <SearchRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/routes/:routeId" 
        element={
          <ProtectedRoute>
            <RouteDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-trips" 
        element={
          <ProtectedRoute>
            <MyTrips />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/incidents" 
        element={
          <ProtectedRoute>
            <Incidents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/favorite-routes" 
        element={
          <ProtectedRoute>
            <FavoriteRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/map" 
        element={
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
