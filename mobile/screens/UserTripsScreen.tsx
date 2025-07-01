import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal as RNModal,
  Alert,
} from "react-native";
import { TopMenu } from "../components/TopMenu";
import { SearchBar } from "../components/SearchBar";
import UserTripCard from "../components/UserTripCard";
import UserTripDetailsModal from "../components/UserTripDetailsModal";
import { HomeBottomMenu } from "../components/HomeBottomMenu";
import { useUserInstitutionTrips } from "../hooks/useUserInstitutionTrips";
import ScanQRScreen from "./ScanQRScreen";
import {
  joinTripAsPassenger,
  getActivePassengerTrip,
} from "../services/tripServices";
import { getCedulaByUUID } from "../services/userDataService";
import { useAuth } from "../hooks/useAuth";
import { getCurrentToken } from "../services/authService";
import { Ionicons } from "@expo/vector-icons";

function formatPlaceName(nombre: string | null | undefined): string {
  if (!nombre) return "";
  const partes = nombre.split(",").map((p) => p.trim());
  return `${partes.slice(0, 3).join(", ")}, Cali`;
}

const FILTERS = [
  { label: "Todos los viajes", value: 0 },
  { label: "Viajes de hoy", value: 1 },
  { label: "Viajes posteriores", value: 2 },
];

// Copiamos el mapeo de tipos del formulario para usarlo aquí
const tiposVehiculo = [
  { label: "Automóvil", value: 1 },
  { label: "Motocicleta", value: 2 },
  { label: "Bicicleta", value: 3 },
  { label: "Camioneta", value: 4 },
  { label: "Van", value: 5 },
  { label: "Monopatín", value: 6 },
  { label: "Bus", value: 7 },
];

function getTipoVehiculoLabel(tipo: number | string | undefined): string {
  if (!tipo) return "-";
  const tipoNum = Number(tipo);
  return tiposVehiculo.find((t) => t.value === tipoNum)?.label || "-";
}

interface UserTripsScreenProps {
  onGoToHomeScreen?: () => void;
  onGoToProfileScreen?: () => void;
  onShowScanQRScreen?: (tripData: any) => void;
  onGoToServices?: () => void;
  onGoToUserTripStartScreen?: (tripData: any) => void;
}

export default function UserTripsScreen({
  onGoToHomeScreen = () => {},
  onGoToProfileScreen = () => {},
  onShowScanQRScreen = () => {},
  onGoToServices = () => {},
  onGoToUserTripStartScreen = () => {},
}: UserTripsScreenProps) {
  const [search, setSearch] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [filterModal, setFilterModal] = useState(false);
  const { trips, loading, error, howTrips, setHowTrips } =
    useUserInstitutionTrips();
  const { user } = useAuth();
  const [showActiveTripModal, setShowActiveTripModal] = useState(false);

  const filteredTrips = trips.filter((trip) => {
    const routeName =
      trip.ruta?.nombre_partida && trip.ruta?.nombre_llegada
        ? `${formatPlaceName(trip.ruta.nombre_partida)} ➔ ${formatPlaceName(
            trip.ruta.nombre_llegada
          )}`
        : `Ruta ${trip.id_ruta}`;
    return (
      routeName.toLowerCase().includes(search.toLowerCase()) ||
      (trip.ruta?.nombre_partida?.toLowerCase() || "").includes(
        search.toLowerCase()
      ) ||
      (trip.ruta?.nombre_llegada?.toLowerCase() || "").includes(
        search.toLowerCase()
      )
    );
  });

  // Función para mapear los datos del viaje y asegurar que el modal reciba los campos correctos
  const mapTripData = (trip: any) => ({
    ...trip,
    conductor: trip.conductor || trip.usuario || undefined,
    vehiculo: trip.vehiculo || {},
  });

  const handleScanQRPress = async () => {
    if (!user) return;
    try {
      // Obtener la cédula del usuario
      const cedula = await getCedulaByUUID(user.id);
      if (!cedula) throw new Error("No se pudo obtener la cédula del usuario");
      // Consultar si ya está en un viaje activo
      const jwt = getCurrentToken();
      if (!jwt)
        throw new Error(
          "No se encontró un token de sesión válido. Por favor, vuelve a iniciar sesión."
        );
      const res = await getActivePassengerTrip(cedula, jwt);
      if (res.success && res.viajes && res.viajes.length > 0) {
        setShowActiveTripModal(true);
        return;
      }
      // Si no está en viaje activo, mostrar el ScanQRScreen
      onShowScanQRScreen(null);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.message ||
          "No se pudo verificar el estado de tus viajes. Intenta de nuevo."
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 12,
          marginTop: 8,
        }}
      >
        <View style={{ flex: 1 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="¿A donde vas?"
          />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#B84CF6",
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginLeft: 8,
          }}
          onPress={() => setFilterModal(true)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
            Filtrar
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Viajes actuales disponibles</Text>
      <RNModal
        visible={filterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.1)",
            justifyContent: "flex-start",
            alignItems: "flex-end",
          }}
          onPress={() => setFilterModal(false)}
        >
          <View
            style={{
              backgroundColor: "#F5E9FF",
              borderRadius: 10,
              marginTop: 80,
              marginRight: 20,
              paddingVertical: 8,
              width: 180,
              elevation: 5,
            }}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={{ paddingVertical: 12, paddingHorizontal: 18 }}
                onPress={() => {
                  setHowTrips(f.value);
                  setFilterModal(false);
                }}
              >
                <Text style={{ fontSize: 15, color: "#7C3AED" }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </RNModal>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#A259FF", marginTop: 8 }}>
            Cargando viajes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id_viaje?.toString()}
          renderItem={({ item }) => (
            <UserTripCard
              route={
                item.ruta?.nombre_partida && item.ruta?.nombre_llegada
                  ? `${formatPlaceName(
                      item.ruta.nombre_partida
                    )} ➔ ${formatPlaceName(item.ruta.nombre_llegada)}`
                  : `Ruta ${item.id_ruta}`
              }
              address={formatPlaceName(item.ruta?.nombre_partida)}
              time={
                item.salida_at
                  ? `${new Date(item.salida_at).toLocaleDateString(
                      "es-CO"
                    )} ${new Date(item.salida_at).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : item.programado_at
                  ? `${new Date(item.programado_at).toLocaleDateString(
                      "es-CO"
                    )} ${new Date(item.programado_at).toLocaleTimeString(
                      "es-CO",
                      { hour: "2-digit", minute: "2-digit" }
                    )}`
                  : ""
              }
              estado={item.estado}
              onPress={() => {
                setSelectedTrip(mapTripData(item));
                setShowDetails(true);
              }}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      {showDetails &&
        (console.log("[UserTripsScreen] selectedTrip:", selectedTrip),
        (
          <UserTripDetailsModal
            visible={showDetails}
            onClose={() => setShowDetails(false)}
            pickupPlace={formatPlaceName(selectedTrip?.ruta?.nombre_partida)}
            destinationPlace={formatPlaceName(
              selectedTrip?.ruta?.nombre_llegada
            )}
            departureDate={
              selectedTrip?.salida_at
                ? new Date(selectedTrip.salida_at).toLocaleDateString("es-CO")
                : selectedTrip?.programado_at
                ? new Date(selectedTrip.programado_at).toLocaleDateString(
                    "es-CO"
                  )
                : "No disponible"
            }
            departureTime={
              selectedTrip?.salida_at
                ? new Date(selectedTrip.salida_at).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : selectedTrip?.programado_at
                ? new Date(selectedTrip.programado_at).toLocaleTimeString(
                    "es-CO",
                    { hour: "2-digit", minute: "2-digit" }
                  )
                : "No disponible"
            }
            driver={
              selectedTrip?.conductor
                ? `${selectedTrip.conductor.nombre} ${selectedTrip.conductor.apellido}`
                : "-"
            }
            vehicleType={getTipoVehiculoLabel(selectedTrip?.vehiculo?.tipo)}
            color={selectedTrip?.vehiculo?.color || "-"}
            plate={selectedTrip?.vehiculo?.placa || "-"}
            estado={selectedTrip?.estado}
            pasajeros={selectedTrip?.pasajeros}
            onStartTrip={() => {
              setShowDetails(false);
              if (typeof onGoToUserTripStartScreen === "function") {
                const tripToPass = {
                  ...selectedTrip,
                  id_conductor:
                    selectedTrip.id_conductor ||
                    (selectedTrip.conductor &&
                      selectedTrip.conductor.id_usuario) ||
                    null,
                };
                onGoToUserTripStartScreen(tripToPass);
              }
            }}
          />
        ))}
      <HomeBottomMenu
        onGoToHome={onGoToHomeScreen}
        onGoToProfile={onGoToProfileScreen}
        onGoToMyTrips={() => {}}
        onGoToServices={onGoToServices}
        activeButton="trips"
      />
      {/* Botón flotante para escanear QR */}
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 24,
          bottom: 90,
          backgroundColor: "#A259FF",
          borderRadius: 28,
          paddingVertical: 16,
          paddingHorizontal: 28,
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
          zIndex: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={handleScanQRPress}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 17,
            letterSpacing: 0.5,
          }}
        >
          Escanear QR
        </Text>
      </TouchableOpacity>
      {/* Modal de advertencia de viaje activo */}
      <RNModal
        visible={showActiveTripModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActiveTripModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.25)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 32,
              alignItems: "center",
              width: 320,
              elevation: 8,
            }}
          >
            <Ionicons
              name="alert-circle"
              size={64}
              color="#ff5e5e"
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#A259FF",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Ya tienes un viaje en curso
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#444",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Actualmente ya formas parte de un viaje en curso o pendiente. No
              puedes ingresar a otro viaje hasta finalizar el actual.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#A259FF",
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 32,
              }}
              onPress={() => setShowActiveTripModal(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Aceptar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 12,
    marginLeft: 16,
    color: "#222",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 90,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A259FF",
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 28,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 20,
  },
  fabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
