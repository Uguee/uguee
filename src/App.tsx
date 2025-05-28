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

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    allowedRoles,
    currentPath: window.location.pathname
  });

  if (isLoading) {
    console.log('⏳ Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('❌ Role not allowed:', user.role, 'Allowed:', allowedRoles);
    // Redirigir a la página correspondiente según el rol
    switch (user.role) {
      case 'pasajero':
        console.log('🔄 Redirecting pasajero to /dashboard');
        return <Navigate to="/dashboard" />;
      case 'conductor':
        console.log('🔄 Redirecting conductor to /driver/dashboard');
        return <Navigate to="/driver/dashboard" />;
      case 'admin_institucional':
        console.log('🔄 Redirecting admin_institucional to /institution/dashboard');
        return <Navigate to="/institution/dashboard" />;
      case 'admin':
        console.log('🔄 Redirecting admin to /admin/dashboard');
        return <Navigate to="/admin/dashboard" />;
      default:
        console.log('🔄 Unknown role, redirecting to /dashboard');
        return <Navigate to="/dashboard" />;
    }
  }

  console.log('✅ Access granted to:', window.location.pathname);
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
      
      {/* Rutas para pasajeros */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['pasajero']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search-routes" 
        element={
          <ProtectedRoute allowedRoles={['pasajero']}>
            <SearchRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/routes/:routeId" 
        element={
          <ProtectedRoute allowedRoles={['pasajero']}>
            <RouteDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-trips" 
        element={
          <ProtectedRoute allowedRoles={['pasajero']}>
            <MyTrips />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/incidents" 
        element={
          <ProtectedRoute allowedRoles={['pasajero']}>
            <Incidents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/favorite-routes" 
        element={
          <ProtectedRoute allowedRoles={['pasajero']}>
            <FavoriteRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/map" 
        element={
          <ProtectedRoute allowedRoles={['pasajero']}>
            <MapView />
          </ProtectedRoute>
        } 
      />

      {/* Rutas para conductores */}
      <Route 
        path="/driver/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['conductor']}>
            <DriverDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Rutas para administradores de instituciones */}
      <Route 
        path="/institution/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin_institucional']}>
            <InstitutionDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Rutas para administradores del sitio */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
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
