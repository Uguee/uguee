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
} from "./screens";
import InstitutionListScreen from "./screens/InstitutionListScreen";
import SelectedInstScreen from "./screens/SelectedInstScreen";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { User } from "./services/authService";
import { View, Text } from "react-native";

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
  | "my-vehicles";

// Componente principal de navegación
const AppNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const { user, isAuthenticated, isLoading, login, register } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);

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

  const handleBackToHome = () => {
    setCurrentScreen("welcome");
  };

  const handleLogin = () => {
    setCurrentScreen("login");
  };

  const handleRegister = () => {
    setCurrentScreen("register");
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
        role: "pasajero", // Por defecto, los usuarios móviles son pasajeros
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

  // Componente de Dashboard basado en rol
  const DashboardScreen = () => {
    if (!user) return null;

    return (
      <ProtectedRoute
        allowedRoles={["pasajero", "conductor", "admin_institucional", "admin"]}
      >
        <HomeScreen
          onGoToInstitutions={handleGoToInstitutions}
          onGoToBecomeDriver={handleGoToDriverRegister}
          onGoToDriverView={handleGoToDriverView}
          onGoToMyInstitution={() => {}}
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
        return (
          <DocumentVerificationScreen
            onComplete={handleCompleteDocumentVerification}
            onBack={handleGoBackFromDocuments}
            userId={user ? parseInt(user.id) : 0}
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
          />
        );
      case "my-vehicles":
        return (
          <MyVehiclesScreen onGoToDriverHomeScreen={handleGoToDriverView} />
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
      {renderCurrentScreen()}
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
