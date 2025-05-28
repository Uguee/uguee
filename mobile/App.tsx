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
} from "./screens";
import InstitutionListScreen from "./screens/InstitutionListScreen";
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
  | "dashboard"
  | "institutions";

// Componente principal de navegación
const AppNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const { user, isAuthenticated, isLoading, login, register } = useAuth();

  // Efecto para redirigir automáticamente según el estado de autenticación
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log("🔄 Usuario autenticado, redirigiendo al dashboard");
        setCurrentScreen("dashboard");
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
    email: string;
    password: string;
  }) => {
    try {
      console.log("📝 Intentando registro:", { email: data.email });

      // Separar nombre completo en firstName y lastName
      const nameParts = data.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await register({
        firstName,
        lastName,
        email: data.email,
        password: data.password,
        role: "pasajero", // Por defecto, los usuarios móviles son pasajeros
      });

      console.log("✅ Registro exitoso");
      // La redirección se maneja automáticamente por el useEffect
      setCurrentScreen("dashboard");
    } catch (error: any) {
      console.error("❌ Error en registro:", error.message);
      // El error se maneja en el hook useAuth
    }
  };

  const handleContinueFromVerifyIdentity = () => {
    setCurrentScreen("permissions");
  };

  const handleSkipVerifyIdentity = () => {
    setCurrentScreen("welcome");
  };

  const handleAllowPermissions = () => {
    setCurrentScreen("start-verification");
  };

  const handleDenyPermissions = () => {
    setCurrentScreen("verify-identity");
  };

  const handleStartVerificationProcess = () => {
    setCurrentScreen("verification-in-progress");
  };

  const handleGoBackFromStart = () => {
    setCurrentScreen("permissions");
  };

  const handleGoToInstitutions = () => setCurrentScreen("institutions");

  // Componente de Dashboard basado en rol
  const DashboardScreen = () => {
    if (!user) return null;

    return (
      <ProtectedRoute
        allowedRoles={["pasajero", "conductor", "admin_institucional", "admin"]}
      >
        <HomeScreen onGoToInstitutions={handleGoToInstitutions} />
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
            onContinue={() => console.log("Verificación completada")}
            onSkip={() => setCurrentScreen("welcome")}
            onBackToHome={handleBackToHome}
          />
        );
      case "dashboard":
        return <DashboardScreen />;
      case "institutions":
        return (
          <InstitutionListScreen
            onGoHome={() => setCurrentScreen("dashboard")}
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
