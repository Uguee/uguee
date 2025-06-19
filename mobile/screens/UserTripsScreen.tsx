import React, { useState } from "react";
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

interface UserTripsScreenProps {
  onGoToHomeScreen?: () => void;
  onGoToProfileScreen?: () => void;
  onShowScanQRScreen?: (tripData: any) => void;
  onGoToServices?: () => void;
}

const TRIPS = [
  {
    id: "1",
    route: "Univalle ➔ Multicentro",
    address: "Salida: Campus Meléndez Calle 13 # 100",
    time: "2:30 PM",
  },
  {
    id: "2",
    route: "Univalle ➔ Multicentro",
    address: "Salida: Campus Meléndez Calle 13 # 100",
    time: "2:30 PM",
  },
  // ...más viajes
];

export default function UserTripsScreen({
  onGoToHomeScreen = () => {},
  onGoToProfileScreen = () => {},
  onShowScanQRScreen = () => {},
  onGoToServices = () => {},
}: UserTripsScreenProps) {
  const [search, setSearch] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const filteredTrips = TRIPS.filter(
    (trip) =>
      trip.route.toLowerCase().includes(search.toLowerCase()) ||
      trip.address.toLowerCase().includes(search.toLowerCase())
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
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserTripCard
            route={item.route}
            address={item.address}
            time={item.time}
            onPress={() => {
              setSelectedTrip(item);
              setShowDetails(true);
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
      <UserTripDetailsModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        pickupPlace={selectedTrip?.address?.replace("Salida: ", "")}
        destinationPlace="Cl. 13 #98-10"
        departureDate="2025-05-31"
        departureTime={selectedTrip?.time || "2:30 PM"}
        driver="Roberto Rojerio"
        vehicleType="bus"
        color="rosado"
        plate="ABC123"
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
