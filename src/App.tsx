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
  const [hasChecked, setHasChecked] = React.useState(false);
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    allowedRoles,
    currentPath: location.pathname,
    hasChecked,
    isCheckingAccess
  });

  // Reset when route changes
  React.useEffect(() => {
    setHasChecked(false);
    setRedirectResult(null);
  }, [location.pathname]);

  // Verificar acceso a la ruta
  React.useEffect(() => {
    const checkAccess = async () => {
      if (user && !isCheckingAccess && !hasChecked) {
        setIsCheckingAccess(true);
        console.log('🔍 Verificando acceso para usuario:', user.role);
        
        try {
          const result = await AuthFlowService.checkRouteAccess(user, allowedRoles);
          console.log('📋 Resultado de verificación de acceso:', result);
          
          setRedirectResult(result);
          setHasChecked(true);
        } catch (error) {
          console.error('❌ Error verificando acceso:', error);
          setRedirectResult({ shouldRedirect: false });
        } finally {
          setIsCheckingAccess(false);
        }
      }
    };

    if (user && !hasChecked) {
      checkAccess();
    }
  }, [user, allowedRoles, hasChecked, location.pathname]);

  // Reset when user changes
  React.useEffect(() => {
    setHasChecked(false);
    setRedirectResult(null);
  }, [user?.id]);

  if (isLoading) {
    console.log('⏳ App loading...');
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

  if (isCheckingAccess && !hasChecked) {
    console.log('⏳ Checking access...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (redirectResult?.shouldRedirect && redirectResult?.redirectTo) {
    console.log('🔄 Redirecting to:', redirectResult.redirectTo);
    return <Navigate to={redirectResult.redirectTo} />;
  }

  console.log('✅ Access granted to:', location.pathname);
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
      
      {/* Ruta para validación pendiente - accesible para todos los roles */}
      <Route 
        path="/pending-validation" 
        element={
          <ProtectedRoute>
            <PendingValidation />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta para verificación de documentos - accesible para usuarios con rol "pendiente" */}
      <Route 
        path="/document-verification" 
        element={
          <ProtectedRoute allowedRoles={['pendiente']}>
            <DocumentVerification />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta para verificación de documentos - solo para usuarios con rol "usuario" */}
      <Route 
        path="/verify-documents" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <DocumentVerification />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta para selección de institución - accesible para usuarios verificados y usuarios */}
      <Route 
        path="/select-institution" 
        element={
          <ProtectedRoute allowedRoles={['verificado', 'usuario']}>
            <SelectInstitution />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas para estudiantes, profesores, administrativos, externos */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search-routes" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <SearchRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/start-trip" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <StartTrip />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/routes/:routeId" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <RouteDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-trips" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <MyTrips />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/favorite-routes" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <FavoriteRoutes />
          </ProtectedRoute>
        } 
      />

      {/* Rutas para conductores */}
      <Route 
        path="/driver/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <DriverDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/map-view" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <MapViewDriver />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/create-trip" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <CreateTrip />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/history" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <HistorialViajes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/vehicles" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
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
