import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  VerifyIdentityScreen,
  CameraPermissionsScreen,
  StartVerificationScreen,
  DocumentVerificationScreen,
  RegisterToInstScreen,
  DriverRegisterScreen,
  DriverHomeScreen,
  MyVehiclesScreen,
  AddVehicleScreen,
  InstProfileScreen,
  ProfileScreen,
} from "./screens";
import { HomeScreen } from "./screens";
import DriverRoutesScreen from "./screens/DriverRoutesScreen";
import InstitutionListScreen from "./screens/InstitutionListScreen";
import SelectedInstScreen from "./screens/SelectedInstScreen";
import DriverMyTripsScreen from "./screens/DriverMyTripsScreen";
import UserTripsScreen from "./screens/UserTripsScreen";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { User } from "./services/authService";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import RegisterRouteScreen from "./screens/RegisterRouteScreen";
import DriverCreateTripScreen from "./screens/DriverCreateTripScreen";
import { getCedulaByUUID } from "./services/userDataService";
import DriverTripStartScreen from "./screens/DriverTripStartScreen";
import DriveQRScreen from "./screens/DriveQRScreen";
import ScanQRScreen from "./screens/ScanQRScreen";
import { joinTrip } from "./services/passengerService";
import UserServicesScreen from "./screens/userServicesScreen";
import UserTripStartScreen from "./screens/UserTripStartScreen";

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
  | "driver-create-trip"
  | "user-trips"
  | "driver-trip-start"
  | "driver-qr"
  | "scan-qr"
  | "user-services"
  | "user-trip-start";

// Componente principal de navegación
const AppNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const { user, isAuthenticated, isLoading, login, register } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [routesRefreshKey, setRoutesRefreshKey] = useState(0);
  const [cedula, setCedula] = React.useState<number | null>(null);
  const [tripStartData, setTripStartData] = useState<{
    pickupPlace: string;
    destinationPlace: string;
    punto_partida?: {
      coordinates: [number, number];
    };
    punto_llegada?: {
      coordinates: [number, number];
    };
    trayecto?: {
      coordinates: [number, number][];
    };
  } | null>(null);
  const [qrValue, setQRValue] = useState<string | null>(null);
  const [showScanQRScreen, setShowScanQRScreen] = useState(false);
  const [scanQRTripData, setScanQRTripData] = useState<any>(null);
  const [userTripStartData, setUserTripStartData] = useState<any>(null);
  const [isJoiningTrip, setIsJoiningTrip] = useState(false);

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

  const handleGoToUserTripsScreen = () => setCurrentScreen("user-trips");

  // Cuando se crea una ruta, refrescar las rutas
  const handleRouteCreated = () => {
    setRoutesRefreshKey((k) => k + 1);
    setCurrentScreen("driver-routes");
  };

  const handleGoToServices = () => setCurrentScreen("user-services");
  const handleGoBackFromScanQR = () => setCurrentScreen("user-trips");

  const handleShowScanQRScreen = (tripData: any) => {
    setScanQRTripData(tripData);
    setShowScanQRScreen(true);
  };

  const handleQRScan = async (qrData?: string) => {
    if (!qrData) {
      Alert.alert("Error", "No se pudo leer el código QR");
      setShowScanQRScreen(false);
      setScanQRTripData(null);
      setCurrentScreen("user-trips");
      return;
    }

    if (!user?.id || !cedula) {
      Alert.alert("Error", "No se pudo obtener la información del usuario");
      setShowScanQRScreen(false);
      setScanQRTripData(null);
      setCurrentScreen("user-trips");
      return;
    }

    setIsJoiningTrip(true);
    try {
      console.log("[App] Procesando QR escaneado:", qrData);

      // Parsear los datos del QR
      const qrParts = qrData.split(",");
      const viajePart = qrParts.find((part) => part.startsWith("viaje:"));
      // const conductorPart = qrParts.find((part) => part.startsWith("conductor:"));

      if (!viajePart) {
        throw new Error("Formato de QR inválido");
      }

      const id_viaje = parseInt(viajePart.split(":")[1]);
      if (!id_viaje) {
        throw new Error("Datos del QR incompletos");
      }

      console.log("[App] Datos extraídos del QR:", {
        id_viaje,
        id_pasajero: cedula,
      });

      // Unir al pasajero al viaje usando el service antiguo
      const result = await joinTrip(id_viaje, cedula);
      console.log("[App] Unión resultado:", result);

      if (result.success === false || result.error) {
        throw new Error(result.error || "No se pudo unir al viaje");
      }

      Alert.alert(
        "¡Te has unido al viaje!",
        "Has sido agregado exitosamente al viaje. El conductor ha sido notificado.",
        [
          {
            text: "OK",
            onPress: () => {
              setShowScanQRScreen(false);
              setScanQRTripData(null);
              setCurrentScreen("user-trips");
            },
          },
        ]
      );
      // Opcional: refrescar lista de viajes aquí si tienes función
    } catch (error: any) {
      console.error("[App] Error al procesar QR:", error);
      let msg =
        error.message || "No se pudo unir al viaje. Inténtalo de nuevo.";
      if (msg.includes("token") || msg.includes("autenticación")) {
        msg = "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.";
      }
      Alert.alert("Error", msg, [
        {
          text: "OK",
          onPress: () => {
            setShowScanQRScreen(false);
            setScanQRTripData(null);
            setCurrentScreen("user-trips");
          },
        },
      ]);
    } finally {
      setIsJoiningTrip(false);
    }
  };

  const handleStartUserTrip = (trip: any) => {
    setUserTripStartData(trip);
    setCurrentScreen("user-trip-start");
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
          onGoToMyTripsScreen={handleGoToUserTripsScreen}
          onGoToServices={handleGoToServices}
        />
      </ProtectedRoute>
    );
  };

  const renderCurrentScreen = () => {
    // Mostrar loading si está cargando o uniendo pasajero
    if (isLoading || isJoiningTrip) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#A259FF" />
          <Text style={{ marginTop: 12, color: "#666" }}>
            {isJoiningTrip ? "Uniéndote al viaje..." : "Cargando..."}
          </Text>
        </View>
      );
    }

    if (showScanQRScreen) {
      return (
        <ScanQRScreen
          onScan={handleQRScan}
          onGoBack={() => {
            setShowScanQRScreen(false);
            setScanQRTripData(null);
            setCurrentScreen("user-trips");
          }}
        />
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
        return (
          <HomeScreen
            onGoToInstitutions={handleGoToInstitutions}
            onGoToBecomeDriver={handleGoToDriverRegister}
            onGoToDriverView={handleGoToDriverView}
            onGoToMyInstitution={() => {}}
            onGoToProfile={handleGoToProfile}
            onGoToInstitutionProfile={handleGoToInstProfile}
            onGoToMyTripsScreen={handleGoToUserTripsScreen}
            onGoToServices={handleGoToServices}
          />
        );
      case "institutions":
        return (
          <InstitutionListScreen
            onGoHome={() => setCurrentScreen("dashboard")}
            onSelectInstitution={(institution) => {
              setSelectedInstitution(institution);
              setCurrentScreen("selected-institution");
            }}
            onGoToServices={handleGoToServices}
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
            onGoToServices={handleGoToServices}
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
            onGoToProfileScreen={handleGoToProfileFromDriver}
            onGoToAddVehicleScreen={handleGoToAddVehicleScreen}
            onGoToMyTripsScreen={handleGoToMyTripsScreen}
          />
        );
      case "vehicle-registration":
        return (
          <AddVehicleScreen
            onGoToMyVehicles={handleGoToMyVehicles}
            onGoToHomeScreen={handleGoToDriverView}
            onGoToProfile={handleGoToProfileFromDriver}
            onGoToMyTripsScreen={handleGoToMyTripsScreen}
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
            onStartTripScreen={(trip: any) => {
              setTripStartData(trip);
              setCurrentScreen("driver-trip-start");
            }}
          />
        );
      case "driver-create-trip":
        return (
          <DriverCreateTripScreen
            onGoToRegisterRouteScreen={handleGoToRegisterRouteScreen}
            onGoBack={() => setCurrentScreen("driver-my-trips")}
          />
        );
      case "user-trips":
        return (
          <UserTripsScreen
            onGoToHomeScreen={handleGoToHomeScreen}
            onGoToProfileScreen={handleGoToProfile}
            onShowScanQRScreen={handleShowScanQRScreen}
            onGoToServices={handleGoToServices}
            onStartTrip={handleStartUserTrip}
          />
        );
      case "driver-trip-start":
        return (
          <DriverTripStartScreen
            trip={tripStartData}
            onGoBack={() => setCurrentScreen("driver-my-trips")}
            onGoToQRScreen={(qr) => {
              setQRValue(qr);
              setCurrentScreen("driver-qr");
            }}
          />
        );
      case "driver-qr":
        return (
          <DriveQRScreen
            qrValue={qrValue || "QR-PLACEHOLDER"}
            onGoBack={() => setCurrentScreen("driver-trip-start")}
          />
        );
      case "scan-qr":
        return (
          <ScanQRScreen onGoBack={handleGoBackFromScanQR} onScan={() => {}} />
        );
      case "user-services":
        return (
          <UserServicesScreen
            onGoToHome={() => setCurrentScreen("dashboard")}
            onGoToProfile={handleGoToProfile}
            onGoToMyTrips={() => setCurrentScreen("user-trips")}
            onGoToServices={() => setCurrentScreen("user-services")}
            onGoToScanQR={() => setCurrentScreen("scan-qr")}
          />
        );
      case "user-trip-start":
        return (
          <UserTripStartScreen
            trip={userTripStartData}
            onGoBack={() => setCurrentScreen("user-trips")}
            onStartTrip={() => {
              setCurrentScreen("scan-qr");
            }}
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
