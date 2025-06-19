import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { TopMenu } from "../components/TopMenu";
import { SearchBar } from "../components/SearchBar";
import UserTripCard from "../components/UserTripCard";
import UserTripDetailsModal from "../components/UserTripDetailsModal";
import { HomeBottomMenu } from "../components/HomeBottomMenu";
import { Ionicons } from "@expo/vector-icons";
import { obtenerViajesUsuario } from "../services/tripsUser";

interface UserTripsScreenProps {
  onGoToHomeScreen?: () => void;
  onGoToProfileScreen?: () => void;
  onShowScanQRScreen?: (tripData: any) => void;
  onGoToServices?: () => void;
}

export default function UserTripsScreen({
  onGoToHomeScreen = () => {},
  onGoToProfileScreen = () => {},
  onShowScanQRScreen = () => {},
  onGoToServices,
}: UserTripsScreenProps) {
  const [search, setSearch] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    obtenerViajesUsuario()
      .then((data) => {
        // Unifica viajes_conductor y viajes_pasajero en un solo array
        const allTrips = [
          ...(data.viajes_conductor || []),
          ...(data.viajes_pasajero || []),
        ];
        setTrips(allTrips);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error al cargar viajes");
        setLoading(false);
      });
  }, []);

  const filteredTrips = trips.filter(
    (trip) =>
      trip.route?.toLowerCase?.().includes(search.toLowerCase()) ||
      "" ||
      trip.address?.toLowerCase?.().includes(search.toLowerCase()) ||
      ""
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="¿A donde vas?"
      />
      <Text style={styles.title}>Viajes actuales disponibles</Text>
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          Cargando viajes...
        </Text>
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item, idx) => item.id?.toString?.() || idx.toString()}
          renderItem={({ item }) => (
            <UserTripCard
              route={item.route || item.ruta || item.nombre_ruta || ""}
              address={
                item.address || item.direccion || item.lugar_salida || ""
              }
              time={item.time || item.hora_salida || item.programado_at || ""}
              onPress={() => {
                setSelectedTrip(item);
                setShowDetails(true);
              }}
            />
          )}
          contentContainerStyle={{ paddingBottom: 180 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <UserTripDetailsModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        pickupPlace={
          selectedTrip?.address?.replace("Salida: ", "") ||
          selectedTrip?.lugar_salida ||
          ""
        }
        destinationPlace={
          selectedTrip?.destinationPlace ||
          selectedTrip?.lugar_llegada ||
          "Cl. 13 #98-10"
        }
        departureDate={
          selectedTrip?.departureDate ||
          selectedTrip?.fecha_salida ||
          "2025-05-31"
        }
        departureTime={
          selectedTrip?.time ||
          selectedTrip?.hora_salida ||
          selectedTrip?.programado_at ||
          "2:30 PM"
        }
        driver={
          selectedTrip?.driver || selectedTrip?.conductor || "Roberto Rojerio"
        }
        vehicleType={
          selectedTrip?.vehicleType || selectedTrip?.tipo_vehiculo || "bus"
        }
        color={selectedTrip?.color || "rosado"}
        plate={selectedTrip?.plate || selectedTrip?.placa || "ABC123"}
        onStartTrip={() => {
          setShowDetails(false);
          onShowScanQRScreen(null);
        }}
      />
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => onShowScanQRScreen(null)}
      >
        <Ionicons
          name="qr-code-outline"
          size={28}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.fabText}>Escanear qr</Text>
      </TouchableOpacity>
      <HomeBottomMenu
        onGoToHome={onGoToHomeScreen}
        onGoToProfile={onGoToProfileScreen}
        onGoToMyTrips={() => {}}
        onGoToServices={onGoToServices}
        activeButton="trips"
      />
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
