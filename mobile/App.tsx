import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  VerifyIdentityScreen,
  CameraPermissionsScreen,
  StartVerificationScreen,
  HomeScreen,
  DocumentVerificationScreen,
  RegisterToInstScreen,
  DriverRegisterScreen,
  DriverHomeScreen,
  MyVehiclesScreen,
  AddVehicleScreen,
  InstProfileScreen,
  ProfileScreen,
} from "./screens";
import DriverRoutesScreen from "./screens/DriverRoutesScreen";
import ListTripsUserScreen from "./screens/ListTripsUserScreen";
import InstitutionListScreen from "./screens/InstitutionListScreen";
import SelectedInstScreen from "./screens/SelectedInstScreen";
import DriverMyTripsScreen from "./screens/DriverMyTripsScreen";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { User } from "./services/authService";
import { View, Text } from "react-native";
import RegisterRouteScreen from "./screens/RegisterRouteScreen";
import DriverCreateTripScreen from "./screens/DriverCreateTripScreen";
import { getCedulaByUUID } from "./services/userDataService";

type Screen =
  | "welcome"
  | "login"
  | "register"
  | "verify-identity"
  | "permissions"
  | "start-verification"
  | "verification-in-progress"
  | "document-verification"
  | "dashboard"
  | "institutions"
  | "selected-institution"
  | "register-to-inst"
  | "driver-register"
  | "driver-home"
  | "my-vehicles"
  | "vehicle-registration"
  | "inst-profile"
  | "profile"
  | "inst-profile-from-driver"
  | "profile-from-driver"
  | "register-route"
  | "driver-routes"
  | "driver-my-trips"
  | "driver-create-trip";

// Componente principal de navegación
const AppNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const { user, isAuthenticated, isLoading, login, register } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [routesRefreshKey, setRoutesRefreshKey] = useState(0);
  const [cedula, setCedula] = React.useState<number | null>(null);

  // Efecto para redirigir automáticamente según el estado de autenticación
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Solo redirigir al dashboard si no estamos en proceso de validación de documentos
        if (currentScreen === "welcome" || currentScreen === "login") {
          console.log("🔄 Usuario autenticado, redirigiendo al dashboard");
          setCurrentScreen("dashboard");
        }
      } else if (currentScreen === "dashboard") {
        console.log("🔄 Usuario no autenticado, redirigiendo a welcome");
        setCurrentScreen("welcome");
      }
    }
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (user?.id) {
      getCedulaByUUID(user.id).then(setCedula);
    }
  }, [user?.id]);

  const handleBackToHome = () => {
    setCurrentScreen("welcome");
  };

  const handleLogin = () => {
    setCurrentScreen("login");
  };

  const handleRegister = () => {
    setCurrentScreen("register");
  };

  const handleGoToAddVehicleScreen = () => {
    setCurrentScreen("vehicle-registration");
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      console.log("🔐 Intentando login:", { email });
      console.log("📊 Estado antes del login:", {
        isAuthenticated,
        user: user?.email,
      });

      const loggedUser = await login({ email, password });

      if (loggedUser) {
        console.log(
          "✅ Login exitoso, redirigiendo según rol:",
          loggedUser.role
        );
        console.log("📊 Estado después del login exitoso:", {
          isAuthenticated,
          user: user?.email,
        });
        // La redirección se maneja automáticamente por el useEffect
        setCurrentScreen("dashboard");
      }
    } catch (error: any) {
      console.error("❌ Error en login:", error.message);
      console.log("📊 Estado después del error:", {
        isAuthenticated,
        user: user?.email,
      });
      // Asegurar que estamos en la pantalla de login después del error
      setCurrentScreen("login");
    }
  };

  const handleRegisterSubmit = async (data: {
    name: string;
    lastName: string;
    cedula: string;
    birthDate: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    try {
      console.log("📝 Intentando registro:", { email: data.email });

      await register({
        firstName: data.name,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phone,
        role: "usuario", // Por defecto, los usuarios móviles son usuarios
        dateOfBirth: data.birthDate,
        id: data.cedula, // Cédula para sync-user
      });

      console.log("✅ Registro exitoso");
      // Después del registro exitoso, ir a validación de documentos
      setCurrentScreen("verify-identity");
    } catch (error: any) {
      console.error("❌ Error en registro:", error.message);
      // El error se maneja en el hook useAuth
    }
  };

  const handleContinueFromVerifyIdentity = () => {
    setCurrentScreen("permissions");
  };

  const handleSkipVerifyIdentity = () => {
    // Si decide saltarse la verificación, ir al dashboard
    setCurrentScreen("dashboard");
  };

  const handleAllowPermissions = () => {
    setCurrentScreen("start-verification");
  };

  const handleDenyPermissions = () => {
    setCurrentScreen("verify-identity");
  };

  const handleStartVerificationProcess = () => {
    setCurrentScreen("document-verification");
  };

  const handleGoBackFromStart = () => {
    setCurrentScreen("permissions");
  };

  const handleCompleteVerification = () => {
    // Después de completar la verificación, ir al dashboard
    console.log("✅ Verificación completada, redirigiendo al dashboard");
    setCurrentScreen("dashboard");
  };

  const handleCompleteDocumentVerification = () => {
    // Después de subir el documento, ir al dashboard
    console.log("✅ Documento subido exitosamente, redirigiendo al dashboard");
    setCurrentScreen("dashboard");
  };

  const handleGoBackFromDocuments = () => {
    // Volver a la pantalla anterior
    setCurrentScreen("start-verification");
  };

  const handleGoToInstitutions = () => setCurrentScreen("institutions");

  const handleGoToDriverRegister = () => setCurrentScreen("driver-register");

  const handleGoToDriverView = () => {
    setCurrentScreen("driver-home");
  };

  const handleGoToMyInstitution = () => {
    setCurrentScreen("institutions");
  };

  const handleGoToMyVehicles = () => {
    setCurrentScreen("my-vehicles");
  };

  const handleGoToHomeScreenFromDriver = () => {
    setCurrentScreen("dashboard");
  };

  const handleGoToHomeScreen = () => {
    setCurrentScreen("dashboard");
  };

  const handleGoToInstProfile = () => {
    setCurrentScreen("inst-profile");
  };

  const handleGoToProfile = () => {
    setCurrentScreen("profile");
  };

  const handleGoToInstProfileFromDriver = () => {
    setCurrentScreen("inst-profile-from-driver");
  };

  const handleGoToProfileFromDriver = () => {
    setCurrentScreen("profile-from-driver");
  };

  const handleGoToRegisterRouteScreen = () => {
    setCurrentScreen("register-route");
  };

  const handleGoToSeeRoutes = () => {
    setCurrentScreen("driver-routes");
  };

  const handleGoToMyTripsScreen = () => setCurrentScreen("driver-my-trips");

  const handleGoToCreateTripScreen = () =>
    setCurrentScreen("driver-create-trip");

  // Cuando se crea una ruta, refrescar las rutas
  const handleRouteCreated = () => {
    setRoutesRefreshKey((k) => k + 1);
    setCurrentScreen("driver-routes");
  };

  // Componente de Dashboard basado en rol
  const DashboardScreen = () => {
    if (!user) return null;

    return (
      <ProtectedRoute
        allowedRoles={["usuario", "admin_institucional", "admin"]}
        onGoToLogin={() => setCurrentScreen("login")}
      >
        <HomeScreen
          onGoToInstitutions={handleGoToInstitutions}
          onGoToBecomeDriver={handleGoToDriverRegister}
          onGoToDriverView={handleGoToDriverView}
          onGoToMyInstitution={() => {}}
          onGoToProfile={handleGoToProfile}
          onGoToInstitutionProfile={handleGoToInstProfile}
        />
      </ProtectedRoute>
    );
  };

  const renderCurrentScreen = () => {
    // Mostrar loading si está cargando
    if (isLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Cargando...</Text>
        </View>
      );
    }

    switch (currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen onLogin={handleLogin} onRegister={handleRegister} />
        );
      case "login":
        return (
          <LoginScreen
            onLogin={handleLoginSubmit}
            onGoToRegister={handleRegister}
            onBackToHome={handleBackToHome}
          />
        );
      case "register":
        return (
          <RegisterScreen
            onRegister={handleRegisterSubmit}
            onGoToLogin={handleLogin}
            onBackToHome={handleBackToHome}
          />
        );
      case "verify-identity":
        return (
          <VerifyIdentityScreen
            onContinue={handleContinueFromVerifyIdentity}
            onSkip={handleSkipVerifyIdentity}
            onBackToHome={handleBackToHome}
          />
        );
      case "permissions":
        return (
          <CameraPermissionsScreen
            onAllow={handleAllowPermissions}
            onDeny={handleDenyPermissions}
            onBackToHome={handleBackToHome}
          />
        );
      case "start-verification":
        return (
          <StartVerificationScreen
            onStartVerification={handleStartVerificationProcess}
            onGoBack={handleGoBackFromStart}
            onBackToHome={handleBackToHome}
          />
        );
      case "verification-in-progress":
        return (
          <VerifyIdentityScreen
            onContinue={handleCompleteVerification}
            onSkip={() => setCurrentScreen("welcome")}
            onBackToHome={handleBackToHome}
          />
        );
      case "document-verification":
        if (cedula === null) {
          return (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>Obteniendo cédula...</Text>
            </View>
          );
        }
        return (
          <DocumentVerificationScreen
            onComplete={handleCompleteDocumentVerification}
            onBack={handleGoBackFromDocuments}
            userId={cedula}
          />
        );
      case "dashboard":
        return <DashboardScreen />;
      case "institutions":
        return (
          <InstitutionListScreen
            onGoHome={() => setCurrentScreen("dashboard")}
            onSelectInstitution={(institution) => {
              setSelectedInstitution(institution);
              setCurrentScreen("selected-institution");
            }}
          />
        );
      case "selected-institution":
        return (
          <SelectedInstScreen
            institution={selectedInstitution}
            onGoHome={() => setCurrentScreen("dashboard")}
            onRequestRegister={(institution) => {
              setSelectedInstitution(institution);
              setCurrentScreen("register-to-inst");
            }}
          />
        );
      case "register-to-inst":
        return (
          <RegisterToInstScreen
            institution={selectedInstitution}
            onGoBack={() => setCurrentScreen("selected-institution")}
            onGoToHomeScreen={handleGoToHomeScreen}
          />
        );
      case "driver-register":
        return (
          <DriverRegisterScreen
            onGoBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "driver-home":
        return (
          <DriverHomeScreen
            onGoToHomeScreen={handleGoToHomeScreenFromDriver}
            onGoToMyVehicles={handleGoToMyVehicles}
            onGoToInstitutions={handleGoToInstitutions}
            onGoToProfile={handleGoToProfileFromDriver}
            onGoToInstitutionProfile={handleGoToInstProfileFromDriver}
            onGoToRegisterRouteScreen={() => setCurrentScreen("register-route")}
            onGoToSeeRoutes={handleGoToSeeRoutes}
            onGoToMyTripsScreen={handleGoToMyTripsScreen}
          />
        );
      case "my-vehicles":
        return (
          <MyVehiclesScreen
            onGoToDriverHomeScreen={handleGoToDriverView}
            onGoToAddVehicleScreen={handleGoToAddVehicleScreen}
            onGoToProfileScreen={handleGoToProfileFromDriver}
            onGoToMyTripsScreen={handleGoToMyTripsScreen}
          />
        );
      case "vehicle-registration":
        return (
          <AddVehicleScreen
            onGoToMyVehicles={handleGoToMyVehicles}
            onGoToHomeScreen={handleGoToDriverView}
            onGoToProfile={handleGoToProfileFromDriver}
          />
        );
      case "inst-profile":
        return (
          <InstProfileScreen
            onGoToHomeScreen={handleGoToHomeScreen}
            onGoToProfile={handleGoToProfileFromDriver}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            onGoToHomeScreen={handleGoToHomeScreen}
            onGoToProfile={handleGoToProfile}
          />
        );
      case "inst-profile-from-driver":
        return (
          <InstProfileScreen
            onGoToHomeScreen={handleGoToDriverView}
            onGoToMyVehicles={handleGoToMyVehicles}
            onGoToProfile={handleGoToProfile}
          />
        );
      case "profile-from-driver":
        return (
          <ProfileScreen
            onGoToHomeScreen={handleGoToDriverView}
            onGoToMyVehicles={handleGoToMyVehicles}
            onGoToProfile={handleGoToProfileFromDriver}
          />
        );
      case "register-route":
        return (
          <RegisterRouteScreen
            onGoBack={handleGoToDriverView}
            onRouteCreated={handleRouteCreated}
          />
        );
      case "driver-routes":
        return (
          <DriverRoutesScreen
            onGoToRegisterRouteScreen={handleGoToRegisterRouteScreen}
            onGoToDriverHome={handleGoToDriverView}
            onGoToMyVehicles={handleGoToMyVehicles}
            onGoToProfile={handleGoToProfileFromDriver}
            refreshKey={routesRefreshKey}
            onGoToMyTripsScreen={handleGoToMyTripsScreen}
          />
        );
      case "driver-my-trips":
        return (
          <DriverMyTripsScreen
            onGoToHomeScreen={handleGoToDriverView}
            onGoToMyVehicles={handleGoToMyVehicles}
            onGoToProfile={handleGoToProfileFromDriver}
            onGoToCreateTripScreen={handleGoToCreateTripScreen}
          />
        );
      case "driver-create-trip":
        return (
          <DriverCreateTripScreen
            onGoToRegisterRouteScreen={handleGoToRegisterRouteScreen}
            onGoBack={() => setCurrentScreen("driver-my-trips")}
          />
        );
      default:
        return (
          <WelcomeScreen onLogin={handleLogin} onRegister={handleRegister} />
        );
    }
  };

  return (
    <>
      <StatusBar style="auto" />
      <Routes>
        <Route path="/" element={renderCurrentScreen()} />
        <Route 
          path="/driver/*" 
          element={
            <ProtectedRoute allowedRoles={['usuario', 'admin', 'admin_institucional']}>
              <DriverRouteGuard>
                <Routes>
                  <Route path="dashboard" element={<DriverDashboard />} />
                  <Route path="map-view" element={<MapViewDriver />} />
                  <Route path="create-trip" element={<CreateTrip />} />
                  <Route path="history" element={<HistorialViajes />} />
                  <Route path="vehicles" element={<MisVehiculos />} />
                </Routes>
              </DriverRouteGuard>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
};

// Componente principal de la aplicación
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
