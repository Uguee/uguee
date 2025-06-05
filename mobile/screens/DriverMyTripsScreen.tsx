import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import { SearchBar } from "../components/SearchBar";
import TripCompletedCard from "../components/TripCompletedCard";
import TripScheduledCard from "../components/TripScheduledCard";
import DriverTripButton from "../components/DriverTripButton";
import { DriverHomeBottomMenu } from "../components/DriverHomeBottomMenu";

const TRIPS = [
  {
    id: "1",
    type: "completed",
    route: "Univalle ➔ Multicentro",
    passengers: 3,
  },
  {
    id: "2",
    type: "scheduled",
    route: "Univalle ➔ Multicentro",
    arrivalDateTime: "2025-06-17 ➔ 08:00:00 p.m",
  },
  // Puedes agregar más viajes aquí
];

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

  // Filtrado por estado
  let filteredTrips =
    filter === "all"
      ? TRIPS
      : TRIPS.filter((trip) =>
          filter === "completed"
            ? trip.type === "completed"
            : trip.type === "scheduled"
        );

  // Filtrado por búsqueda
  filteredTrips = filteredTrips.filter((trip) =>
    trip.route.toLowerCase().includes(search.toLowerCase())
  );

  const renderTrip = ({ item }: { item: any }) => {
    if (item.type === "completed") {
      return (
        <TripCompletedCard
          route={item.route}
          passengers={item.passengers}
          onPress={() => {}}
        />
      );
    } else {
      return (
        <TripScheduledCard
          route={item.route}
          arrivalDateTime={item.arrivalDateTime}
          onPress={() => {}}
        />
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
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
      {/* Botón de crear viaje */}
      <View style={styles.createButtonContainer} pointerEvents="box-none">
        <DriverTripButton onPress={onGoToCreateTripScreen} />
      </View>
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
