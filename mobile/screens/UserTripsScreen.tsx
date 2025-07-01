import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { TopMenu } from "../components/TopMenu";
import { SearchBar } from "../components/SearchBar";
import UserTripCard from "../components/UserTripCard";
import UserTripDetailsModal from "../components/UserTripDetailsModal";
import { HomeBottomMenu } from "../components/HomeBottomMenu";
import { useUserInstitutionTrips } from "../hooks/useUserInstitutionTrips";
import ScanQRScreen from "./ScanQRScreen";
import { joinTripAsPassenger } from "../services/tripServices";
import { getCedulaByUUID } from "../services/userDataService";
import { useAuth } from "../hooks/useAuth";

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
      <Modal
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
      </Modal>
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
          keyExtractor={(item) =>
            item.id_viaje?.toString() || item.id?.toString()
          }
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
              time={item.programado_local || ""}
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
            departureDate={selectedTrip?.programado_local?.split(",")[0] || ""}
            departureTime={
              selectedTrip?.programado_local?.split(",")[1]?.trim() || ""
            }
            driver={
              selectedTrip?.conductor
                ? `${selectedTrip.conductor.nombre} ${selectedTrip.conductor.apellido}`
                : "-"
            }
            vehicleType={selectedTrip?.vehiculo?.tipo || "-"}
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
        onPress={() => onShowScanQRScreen(null)}
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
