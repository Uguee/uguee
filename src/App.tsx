import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { UserService } from "./services/userService";
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
  const [registrationStatus, setRegistrationStatus] = React.useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(false);

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    allowedRoles,
    currentPath: window.location.pathname
  });

  // Verificar estado de registro para usuarios con rol "usuario"
  React.useEffect(() => {
    const checkUserStatus = async () => {
      if (user && user.role === 'usuario' && !isCheckingStatus) {
        setIsCheckingStatus(true);
        console.log('🔍 Verificando estado de registro para usuario:', user.id);
        
        const status = await UserService.getUserRegistrationStatus(user.id);
        console.log('📋 Estado de registro obtenido:', status);
        
        setRegistrationStatus(status);
        setIsCheckingStatus(false);
      }
    };

    if (user && user.role === 'usuario') {
      checkUserStatus();
    }
  }, [user, isCheckingStatus]);

  if (isLoading || (user?.role === 'usuario' && isCheckingStatus)) {
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
    
    // Lógica especial para usuarios con rol "usuario"
    if (user.role === 'usuario') {
      if (!registrationStatus) {
        console.log('⏳ Esperando estado de registro...');
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }

      // Determinar redirección basada en el estado
      if (!registrationStatus.hasDocuments) {
        console.log('📄 Usuario sin documentos verificados → /verify-documents');
        return <Navigate to="/verify-documents" />;
      } else if (!registrationStatus.hasInstitution) {
        console.log('🏛️ Usuario sin institución → /select-institution');
        return <Navigate to="/select-institution" />;
      } else {
        // Usuario completó ambos pasos, redirigir según estado de validación
        const { institutionStatus, institutionalRole } = registrationStatus;
        
        if (institutionStatus === 'pendiente') {
          console.log('⏳ Solicitud pendiente → /pending-validation');
          return <Navigate to="/pending-validation" />;
        } else if (institutionStatus === 'validado') {
          // Mapear rol institucional a rol del sistema y redirigir al dashboard apropiado
          const systemRole = institutionalRole?.toLowerCase();
          console.log('✅ Usuario validado con rol:', systemRole, '→ /dashboard');
          return <Navigate to="/dashboard" />;
        } else if (institutionStatus === 'denegado') {
          console.log('❌ Solicitud denegada → mensaje de error');
          // Aquí podrías redirigir a una página de "solicitud denegada"
          return <Navigate to="/pending-validation" />;
        }
      }
    }
    
    // Redirigir a la página correspondiente según el rol para otros casos
    switch (user.role) {
      case 'externo':
      case 'estudiante':
      case 'profesor':
      case 'administrativo':
        console.log('🔄 Redirecting user to /dashboard');
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
      case 'validacion':
        console.log('🔄 Redirecting validacion to /pending-validation');
        return <Navigate to="/pending-validation" />;
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
      
      {/* Ruta para validación pendiente - solo para usuarios con rol "validacion" */}
      <Route 
        path="/pending-validation" 
        element={
          <ProtectedRoute allowedRoles={['validacion']}>
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
