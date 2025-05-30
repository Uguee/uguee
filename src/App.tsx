import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AuthFlowService } from "./services/authFlowService";
import { UserRole } from "./types";
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

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    allowedRoles,
    currentPath: window.location.pathname,
    hasChecked,
    isCheckingAccess
  });

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
  }, [user, allowedRoles, hasChecked]);

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
      
      {/* Ruta para validación pendiente - para usuarios en validación Y usuarios que están en estado pendiente/denegado */}
      <Route 
        path="/pending-validation" 
        element={
          <ProtectedRoute allowedRoles={['validacion', 'usuario', 'externo', 'estudiante', 'profesor', 'administrativo']}>
            <PendingValidation />
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
      
      {/* Ruta para selección de institución - solo para usuarios con rol "usuario" */}
      <Route 
        path="/select-institution" 
        element={
          <ProtectedRoute allowedRoles={['usuario']}>
            <SelectInstitution />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas para estudiantes, profesores, administrativos, externos */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['externo', 'estudiante', 'profesor', 'administrativo', 'conductor']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search-routes" 
        element={
          <ProtectedRoute allowedRoles={['externo', 'estudiante', 'profesor', 'administrativo', 'conductor']}>
            <SearchRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/start-trip" 
        element={
          <ProtectedRoute allowedRoles={['externo', 'estudiante', 'profesor', 'administrativo', 'conductor']}>
            <StartTrip />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/routes/:routeId" 
        element={
          <ProtectedRoute allowedRoles={['externo', 'estudiante', 'profesor', 'administrativo', 'conductor']}>
            <RouteDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-trips" 
        element={
          <ProtectedRoute allowedRoles={['externo', 'estudiante', 'profesor', 'administrativo', 'conductor']}>
            <MyTrips />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/favorite-routes" 
        element={
          <ProtectedRoute allowedRoles={['externo', 'estudiante', 'profesor', 'administrativo', 'conductor']}>
            <FavoriteRoutes />
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
      <Route 
        path="/driver/historial-viajes" 
        element={
          <ProtectedRoute allowedRoles={['conductor']}>
            <HistorialViajes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/create-trip" 
        element={
          <ProtectedRoute allowedRoles={['conductor']}>
            <CreateTrip />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/map-view" 
        element={
          <ProtectedRoute allowedRoles={['conductor']}>
            <MapViewDriver />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver/mis-vehiculos" 
        element={
          <ProtectedRoute allowedRoles={['conductor']}>
            <MisVehiculos />
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
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />

      <Route path="/driver-not-allowed" element={<DriverNotAllowed />} />
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
