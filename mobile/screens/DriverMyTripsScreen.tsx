import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import { SearchBar } from "../components/SearchBar";
import TripCompletedCard from "../components/TripCompletedCard";
import TripScheduledCard from "../components/TripScheduledCard";
import DriverTripButton from "../components/DriverTripButton";
import { DriverHomeBottomMenu } from "../components/DriverHomeBottomMenu";
import TripCompletedDetailsModal from "../components/TripCompletedDetailsModal";
import TripScheduledDetailsModal from "../components/TripScheduledDetailsModal";
import { useDriverTrips } from "../hooks/useDriverTrips";

const FILTERS = [
  { label: "Terminado", value: "completed" },
  { label: "Programado", value: "scheduled" },
  { label: "Todos", value: "all" },
];

const DriverMyTripsScreen = ({
  onGoToHomeScreen = () => {},
  onGoToMyVehicles = () => {},
  onGoToProfile = () => {},
  onGoToCreateTripScreen = () => {},
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterModal, setFilterModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showScheduledModal, setShowScheduledModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  // Elimina el array TRIPS y usa los viajes reales
  const { trips, loading, error } = useDriverTrips();
  console.log("[DriverMyTripsScreen] trips:", trips);

  // Filtrado por estado
  let filteredTrips =
    filter === "all"
      ? trips
      : trips.filter((trip: any) =>
          filter === "completed"
            ? trip.hora_llegada !== null
            : trip.hora_llegada === null
        );

  // Filtrado por búsqueda
  filteredTrips = filteredTrips.filter((trip: any) =>
    (trip.ruta_nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  const renderTrip = ({ item }: { item: any }) => {
    if (item.hora_llegada !== null) {
      // Terminado
      return (
        <TripCompletedCard
          route={item.ruta_nombre || `${item.id_ruta}`}
          passengers={item.pasajeros || 0}
          onPress={() => {
            setSelectedTrip(item);
            setShowCompletedModal(true);
          }}
        />
      );
    } else {
      // Programado
      return (
        <View
          style={{
            backgroundColor: "#E9D6FF",
            borderRadius: 16,
            marginBottom: 12,
          }}
        >
          <TripScheduledCard
            route={item.ruta_nombre || `${item.id_ruta}`}
            arrivalDateTime={
              item.fecha + (item.hora_salida ? ` ➔ ${item.hora_salida}` : "")
            }
            onPress={() => {
              setSelectedTrip(item);
              setShowScheduledModal(true);
            }}
          />
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Top menu */}
      <TopMenu />
      {/* Search bar y filtro */}
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
            placeholder="Busca tus viajes creados"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>Filtrar estado</Text>
        </TouchableOpacity>
      </View>
      {/* Modal de filtro */}
      <Modal
        visible={filterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setFilterModal(false)}
        >
          <View style={styles.filterModal}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={styles.filterOption}
                onPress={() => {
                  setFilter(f.value);
                  setFilterModal(false);
                }}
              >
                <Text style={styles.filterOptionText}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Lista de viajes */}
      <Text style={styles.sectionTitle}>Viajes creados</Text>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#A259FF" />
          <Text style={{ textAlign: "center", color: "#A259FF", marginTop: 8 }}>
            Cargando viajes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id_viaje.toString()}
          renderItem={renderTrip}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      {error && (
        <Text style={{ textAlign: "center", color: "red" }}>{error}</Text>
      )}
      {/* Botón de crear viaje */}
      <View style={styles.createButtonContainer} pointerEvents="box-none">
        <DriverTripButton onPress={onGoToCreateTripScreen} />
      </View>
      {/* Modales de detalles */}
      <TripCompletedDetailsModal
        visible={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        trip={selectedTrip}
      />
      <TripScheduledDetailsModal
        visible={showScheduledModal}
        onClose={() => setShowScheduledModal(false)}
        trip={selectedTrip}
      />
      {/* Menú inferior */}
      <DriverHomeBottomMenu
        onGoToProfile={onGoToProfile}
        onGoToHome={onGoToHomeScreen}
        onGoToMyVehicles={onGoToMyVehicles}
        onGoToMyTrips={() => {}}
        activeButton="trips"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor: "#B84CF6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 12,
    marginLeft: 16,
    color: "#222",
  },
  createButtonContainer: {
    position: "absolute",
    right: 16,
    bottom: 70,
    zIndex: 2,
    backgroundColor: "transparent",
    alignItems: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  filterModal: {
    backgroundColor: "#F5E9FF",
    borderRadius: 10,
    marginTop: 80,
    marginRight: 20,
    paddingVertical: 8,
    width: 140,
    elevation: 5,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  filterOptionText: {
    fontSize: 15,
    color: "#7C3AED",
  },
});

export default DriverMyTripsScreen;
