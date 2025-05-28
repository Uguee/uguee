import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { UserRole } from "./types";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Authentication/Login";
import Register from "./pages/Authentication/Register";
import InstitutionRegister from "./pages/Authentication/InstitutionRegister";
import Dashboard from "./pages/passengers/Dashboard";
import SearchRoutes from "./pages/SearchRoutes";
import RouteDetail from "./pages/passengers/RouteDetail";
import MyTrips from "./pages/passengers/MyTrips";
import Incidents from "./pages/passengers/Incidents";
import FavoriteRoutes from "./pages/passengers/FavoriteRoutes";
import MapView from "./pages/passengers/MapView";
import DriverDashboard from "./pages/drivers/Dashboard";
import InstitutionDashboard from "./pages/institution/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import MapViewDriver from "./pages/drivers/MapView";
import 'leaflet/dist/leaflet.css';

const queryClient = new QueryClient();

// Protected route component with role check
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

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

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirigir a la página correspondiente según el rol
    switch (user.role) {
      case 'student':
        return <Navigate to="/dashboard" />;
      case 'driver':
        return <Navigate to="/driver/dashboard" />;
      case 'institution-admin':
        return <Navigate to="/institution/dashboard" />;
      case 'site-admin':
        return <Navigate to="/admin/dashboard" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/institution-register" element={<InstitutionRegister />} />
      
      {/* Rutas para estudiantes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search-routes" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <SearchRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/routes/:routeId" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <RouteDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-trips" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyTrips />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/incidents" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Incidents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/favorite-routes" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <FavoriteRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/map" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <MapView />
          </ProtectedRoute>
        } 
      />

      {/* Rutas para conductores */}
      <Route 
        path="/driver/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/map" 
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <MapViewDriver />
          </ProtectedRoute>
        } 
      />

      {/* Rutas para administradores de instituciones */}
      <Route 
        path="/institution/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['institution-admin']}>
            <InstitutionDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Rutas para administradores del sitio */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['site-admin']}>
            <AdminDashboard />
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
