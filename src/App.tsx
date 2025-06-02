import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AuthFlowService } from "./services/authFlowService";
import { UserRole } from "./types";
import { DriverValidationProvider } from "./contexts/DriverValidationContext";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Authentication/Login";
import Register from "./pages/Authentication/Register";
import InstitutionRegister from "./pages/Authentication/InstitutionRegister";
import DocumentVerification from "./pages/Authentication/DocumentVerification";
import Dashboard from "./pages/passengers/Dashboard";
import SearchRoutes from "./pages/passengers/SearchRoutes";
import StartTrip from "./pages/passengers/StartTrip";
import RouteDetail from "./pages/passengers/RouteDetail";
import MyTrips from "./pages/passengers/MyTrips";
import FavoriteRoutes from "./pages/passengers/FavoriteRoutes";
import DriverDashboard from "./pages/drivers/index";
import InstitutionDashboard from "./pages/institution/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import MapViewDriver from "./pages/drivers/MapView";
import CreateTrip from "./pages/drivers/CreateTrip";
import DriverNotAllowed from './pages/DriverNotAllowed';
import HistorialViajes from "./pages/drivers/HistorialViajes";
import MisVehiculos from "./pages/drivers/MisVehiculos";
import 'leaflet/dist/leaflet.css';
import PendingValidation from "./pages/Validation/PendingValidation";
import UserValidation from "./pages/admin/UserValidation";
import RegistrationRequests from "./pages/admin/RegistrationRequests";
import SelectInstitution from "./pages/Authentication/SelectInstitution";
import React from "react";
import Profile from "./pages/profile/Profile";
import Unauthorized from './pages/Unauthorized';

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
  const [redirectResult, setRedirectResult] = React.useState<any>(null);
  const [isCheckingAccess, setIsCheckingAccess] = React.useState(false);
  const location = useLocation();

  // Reset when route changes
  React.useEffect(() => {
    setRedirectResult(null);
  }, [location.pathname]);

  // Verificar acceso a la ruta
  React.useEffect(() => {
    const checkAccess = async () => {
      if (user && !isCheckingAccess) {
        setIsCheckingAccess(true);
        
        try {
          const result = await AuthFlowService.checkRouteAccess(user, allowedRoles);
          setRedirectResult(result);
        } catch (error) {
          console.error('❌ Error verificando acceso:', error);
          setRedirectResult({ shouldRedirect: false });
        } finally {
          setIsCheckingAccess(false);
        }
      }
    };

    if (user) {
      checkAccess();
    }
  }, [user, allowedRoles, location.pathname]);

  if (isLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (redirectResult?.shouldRedirect && redirectResult?.redirectTo) {
    return <Navigate to={redirectResult.redirectTo} />;
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
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Ruta para validación pendiente - accesible para todos los roles */}
      <Route 
        path="/pending-validation" 
        element={
          <ProtectedRoute>
            <PendingValidation />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta para verificación de documentos - accesible para usuarios */}
      <Route 
        path="/document-verification" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <DocumentVerification />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta para selección de institución - accesible para usuarios */}
      <Route 
        path="/select-institution" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <SelectInstitution />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas para usuarios validados */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search-routes" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <SearchRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/start-trip" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <StartTrip />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/routes/:routeId" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <RouteDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-trips" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <MyTrips />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/favorite-routes" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <FavoriteRoutes />
          </ProtectedRoute>
        } 
      />

      {/* Rutas para conductores */}
      <Route 
        path="/driver/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <DriverDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/map-view" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <MapViewDriver />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/create-trip" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <CreateTrip />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/history" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <HistorialViajes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/vehicles" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
            <MisVehiculos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver-not-allowed" 
        element={<DriverNotAllowed />} 
      />

      {/* Rutas para administradores institucionales */}
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
      
      {/* Ruta para validación de usuarios - solo para admins */}
      <Route 
        path="/admin/user-validation" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserValidation />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta para gestión de solicitudes - solo para admins */}
      <Route 
        path="/admin/registration-requests" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'admin_institucional']}>
            <RegistrationRequests />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta para perfil del usuario */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['usuario', 'admin_institucional']}>
            <Profile />
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
        <DriverValidationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DriverValidationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
