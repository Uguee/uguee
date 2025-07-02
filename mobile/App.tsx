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
  DriverTripActiveScreen,
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
import {
  View,
  Text,
  Alert,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import RegisterRouteScreen from "./screens/RegisterRouteScreen";
import DriverCreateTripScreen from "./screens/DriverCreateTripScreen";
import { getCedulaByUUID } from "./services/userDataService";
import DriverTripStartScreen from "./screens/DriverTripStartScreen";
import DriveQRScreen from "./screens/DriveQRScreen";
import ScanQRScreen from "./screens/ScanQRScreen";
import { joinTripAsPassenger } from "./services/tripServices";
import UserServicesScreen from "./screens/userServicesScreen";
import UserTripStartScreen from "./screens/UserTripStartScreen";
import TripCompletedDetailsModal from "./components/TripCompletedDetailsModal";
import UserTripActiveScreen from "./screens/UserTripActiveScreen";
import RatingModal from "./components/RatingModal";
import { useTripEndSubscription } from "./hooks/useTripEndSubscription";
import { getActivePassengerTrip } from "./services/tripServices";
import { getCurrentToken } from "./services/authService";
import { createTripReview } from "./services/reviewService";

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
  | "user-trip-start"
  | "driver-trip-active"
  | "user-trip-active";

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
  const [showUserTripStartScreen, setShowUserTripStartScreen] = useState(false);
  const [userTripStartData, setUserTripStartData] = useState<any>(null);
  const [activeTripData, setActiveTripData] = useState<any>(null);
  const [completedTrip, setCompletedTrip] = useState<any>(null);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [userActiveTripData, setUserActiveTripData] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tripToRate, setTripToRate] = useState<any>(null);

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

  // Lógica para detectar viaje activo y suscribirse a su finalización
  useEffect(() => {
    console.log("[App] useEffect: user?.id=", user?.id, "cedula=", cedula);
    const fetchActiveTrip = async () => {
      if (!user?.id || !cedula) {
        console.log(
          "[App] No hay user?.id o cedula, no se consulta viaje activo"
        );
        return;
      }
      const jwt = getCurrentToken();
      if (!jwt) {
        console.log("[App] No hay JWT, no se consulta viaje activo");
        return;
      }
      console.log(
        "[App] Llamando getActivePassengerTrip con cedula=",
        cedula,
        "jwt=",
        jwt
      );
      const res = await getActivePassengerTrip(Number(cedula), jwt);
      console.log("[App] Resultado getActivePassengerTrip:", res);
      if (res.success && res.viajes.length > 0) {
        // Selecciona el viaje con mayor id_viaje
        const viajeMasReciente = res.viajes.reduce(
          (max, v) => (v.id_viaje > max.id_viaje ? v : max),
          res.viajes[0]
        );
        setTripToRate(viajeMasReciente);
        console.log("[App] setTripToRate (mayor id_viaje):", viajeMasReciente);
        console.log("[App] id_viaje seteado:", viajeMasReciente?.id_viaje);
      } else {
        setTripToRate(null);
        console.log("[App] No hay viaje activo, setTripToRate(null)");
      }
    };
    fetchActiveTrip();
  }, [user?.id, cedula]);

  // Suscribirse al fin del viaje activo
  useTripEndSubscription(tripToRate?.id_viaje, (viajeFinalizado) => {
    console.log(
      "[App] Callback useTripEndSubscription: viajeFinalizado=",
      viajeFinalizado
    );
    setTripToRate(viajeFinalizado);
    setShowRatingModal(true);
  });

  // Handler para guardar la reseña y redirigir
  const handleSubmitRating = async (rating: number, comment: string) => {
    setShowRatingModal(false);
    if (!tripToRate || !tripToRate.id_viaje || !user?.id) {
      console.log(
        "[App] handleSubmitRating: tripToRate o id_viaje o user.id faltante"
      );
      return;
    }
    try {
      const id_usuario = await getCedulaByUUID(user.id);
      const jwt = getCurrentToken();
      if (!id_usuario || !jwt) throw new Error("No hay usuario o JWT");
      console.log("[App] Enviando reseña:", {
        id_usuario,
        id_viaje: tripToRate.id_viaje,
        rating,
        comment,
      });
      const res = await createTripReview(
        id_usuario,
        tripToRate.id_viaje,
        rating,
        comment,
        jwt
      );
      if (res.success) {
        alert("¡Reseña guardada exitosamente!");
        setCurrentScreen("user-services");
      } else {
        alert(res.error || "Error al guardar la reseña");
      }
    } catch (e: any) {
      alert(e.message || "Error inesperado al guardar la reseña");
    }
  };

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

    try {
      console.log("[App] Procesando QR escaneado:", qrData);

      // Parsear los datos del QR
      const qrParts = qrData.split(",");
      const viajePart = qrParts.find((part) => part.startsWith("viaje:"));
      const conductorPart = qrParts.find((part) =>
        part.startsWith("conductor:")
      );

      if (!viajePart || !conductorPart) {
        throw new Error("Formato de QR inválido");
      }

      const id_viaje = parseInt(viajePart.split(":")[1]);
      const id_conductor = parseInt(conductorPart.split(":")[1]);

      if (!id_viaje || !id_conductor) {
        throw new Error("Datos del QR incompletos");
      }

      console.log("[App] Datos extraídos del QR:", {
        id_viaje,
        id_conductor,
        id_pasajero: cedula,
      });

      // Unir al pasajero al viaje
      const result = await joinTripAsPassenger(cedula, id_conductor, id_viaje);

      console.log("[App] Unión exitosa:", result);

      Alert.alert(
        "¡Te has unido al viaje!",
        "Has sido agregado exitosamente al viaje. El conductor ha sido notificado.",
        [
          {
            text: "OK",
            onPress: async () => {
              setShowScanQRScreen(false);
              setScanQRTripData(null);
              // Refresca el viaje activo y setea tripToRate
              try {
                const jwt = getCurrentToken();
                if (!cedula || !jwt) return;
                const res = await getActivePassengerTrip(Number(cedula), jwt);
                if (res.success && res.viajes.length > 0) {
                  const viajeMasReciente = res.viajes.reduce(
                    (max, v) => (v.id_viaje > max.id_viaje ? v : max),
                    res.viajes[0]
                  );
                  setTripToRate(viajeMasReciente);
                  console.log(
                    "[App] (post-join) setTripToRate (mayor id_viaje):",
                    viajeMasReciente
                  );
                  console.log(
                    "[App] (post-join) id_viaje seteado:",
                    viajeMasReciente?.id_viaje
                  );
                } else {
                  setTripToRate(null);
                  console.log(
                    "[App] (post-join) No hay viaje activo, setTripToRate(null)"
                  );
                }
              } catch (e) {
                console.log(
                  "[App] (post-join) Error refrescando viaje activo:",
                  e
                );
              }
              setCurrentScreen("user-trips");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("[App] Error al procesar QR:", error);

      Alert.alert(
        "Error",
        error.message || "No se pudo unir al viaje. Inténtalo de nuevo.",
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
    }
  };

  const handleGoToUserTripStartScreen = (tripData: any) => {
    // Asegura que el id_conductor sea el id_usuario real
    const tripToPass = {
      ...tripData,
      id_conductor:
        tripData.id_conductor ||
        (tripData.conductor && tripData.conductor.id_usuario) ||
        null,
    };
    setUserTripStartData(tripToPass);
    setShowUserTripStartScreen(true);
    setCurrentScreen("user-trip-start");
  };

  // Handler para mostrar la pantalla de escaneo QR desde UserTripStartScreen
  const handleShowScanQRScreenFromTripStart = (tripData: any) => {
    setScanQRTripData(tripData);
    setCurrentScreen("scan-qr");
  };

  const handleGoToDriverTripScreen = (trip: any) => {
    if (trip._forceActive || trip.estado === "en-curso") {
      setActiveTripData(trip);
      setCurrentScreen("driver-trip-active");
    } else {
      setTripStartData(trip);
      setCurrentScreen("driver-trip-start");
    }
  };

  const handleEndTrip = (trip: any) => {
    setShowEndTripModal(true);
    setCompletedTrip(null);
    setShowCompletedModal(false);
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
            onStartTripScreen={handleGoToDriverTripScreen}
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
            onGoToUserTripStartScreen={handleGoToUserTripStartScreen}
            onGoToUserTripActiveScreen={(tripData) => {
              console.log(
                "[App] Navegando a user-trip-active con trip:",
                tripData
              );
              setUserActiveTripData(tripData);
              setCurrentScreen("user-trip-active");
            }}
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
            onStartTrip={(trip) => {
              setActiveTripData(trip);
              setCurrentScreen("driver-trip-active");
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
          <ScanQRScreen
            onScan={async (qrData?: string) => {
              if (!qrData) {
                setCurrentScreen("user-trip-start");
                return;
              }
              try {
                // Lógica original: unir al pasajero al viaje usando joinTripAsPassenger
                let cedula = null;
                if (user?.id) {
                  cedula = await getCedulaByUUID(user.id);
                }
                if (!cedula)
                  throw new Error("No se pudo obtener la cédula del usuario");
                // Parsear QR (espera viaje:ID, conductor:ID)
                const qrParts = qrData.split(",");
                const viajePart = qrParts.find((part) =>
                  part.startsWith("viaje:")
                );
                const conductorPart = qrParts.find((part) =>
                  part.startsWith("conductor:")
                );
                const id_viaje = viajePart
                  ? parseInt(viajePart.split(":")[1])
                  : null;
                const id_conductor = conductorPart
                  ? parseInt(conductorPart.split(":")[1])
                  : null;
                if (!id_viaje || !id_conductor) throw new Error("QR inválido");
                // Unir al viaje usando joinTripAsPassenger
                await joinTripAsPassenger(cedula, id_conductor, id_viaje);
                Alert.alert(
                  "¡Te has unido al viaje!",
                  "Has sido agregado exitosamente al viaje.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setCurrentScreen("user-trip-start");
                      },
                    },
                  ]
                );
              } catch (error: any) {
                Alert.alert(
                  "Error",
                  error.message || "No se pudo unir al viaje.",
                  [
                    {
                      text: "OK",
                      onPress: () => setCurrentScreen("user-trip-start"),
                    },
                  ]
                );
              }
            }}
            onGoBack={() => setCurrentScreen("user-trip-start")}
          />
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
            onStartTrip={(viajeActualizado) => {
              setUserActiveTripData(viajeActualizado);
              setCurrentScreen("user-trip-active");
            }}
            onShowScanQRScreen={handleShowScanQRScreenFromTripStart}
          />
        );
      case "driver-trip-active":
        return (
          <>
            <DriverTripActiveScreen
              trip={activeTripData}
              onGoBack={() => setCurrentScreen("driver-my-trips")}
              onEndTrip={handleEndTrip}
            />
            {/* Modal personalizado de fin de viaje */}
            <Modal
              visible={showEndTripModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowEndTripModal(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 18,
                    padding: 28,
                    alignItems: "center",
                    width: 320,
                  }}
                >
                  <Image
                    source={require("./assets/good-rating.png")}
                    style={{ width: 90, height: 90, marginBottom: 18 }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "bold",
                      color: "#7C3AED",
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    ¡Gracias por ser conductor!
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#444",
                      marginBottom: 24,
                      textAlign: "center",
                    }}
                  >
                    Recuerda invitar a tus pasajeros a calificar la experiencia.
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#7C3AED",
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 36,
                    }}
                    onPress={() => {
                      setShowEndTripModal(false);
                      setCurrentScreen("driver-my-trips");
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 17,
                      }}
                    >
                      Aceptar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        );
      case "user-trip-active":
        return (
          <UserTripActiveScreen
            trip={userActiveTripData}
            onGoBack={() => setCurrentScreen("user-trips")}
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
      {/* Modal de calificación global al finalizar viaje */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setCurrentScreen("user-services");
          // Mostrar alerta personalizada sin título
          Alert.alert(
            "",
            "Tu reseña es importante y nos ayuda a mejorar, recuerda hacerla luego.",
            [
              {
                text: "OK",
                onPress: () => {},
              },
            ]
          );
        }}
        onSubmit={handleSubmitRating}
      />
      {/* Modal de viaje completado */}
      <TripCompletedDetailsModal
        visible={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        route={
          completedTrip?.ruta
            ? `${completedTrip.ruta.nombre_partida} ➔ ${completedTrip.ruta.nombre_llegada}`
            : ""
        }
        address={completedTrip?.ruta?.nombre_partida || ""}
        departureDate={completedTrip?.programado_local?.split(",")[0] || ""}
        departureTime={
          completedTrip?.programado_local?.split(",")[1]?.trim() || ""
        }
        arrivalDate={
          completedTrip?.llegada_at
            ? new Date(completedTrip.llegada_at).toLocaleDateString("es-CO")
            : ""
        }
        arrivalTime={
          completedTrip?.llegada_at
            ? new Date(completedTrip.llegada_at).toLocaleTimeString("es-CO")
            : ""
        }
        passengers={completedTrip?.pasajeros || 0}
      />
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
