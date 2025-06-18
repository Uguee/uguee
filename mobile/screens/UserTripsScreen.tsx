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

interface UserTripsScreenProps {
  onGoToHomeScreen?: () => void;
  onGoToProfileScreen?: () => void;
  onShowScanQRScreen?: (tripData: any) => void;
}

export default function UserTripsScreen({
  onGoToHomeScreen = () => {},
  onGoToProfileScreen = () => {},
  onShowScanQRScreen = () => {},
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
        onStartTrip={() => {
          setShowDetails(false);
          onShowScanQRScreen(selectedTrip);
        }}
      />
      <HomeBottomMenu
        onGoToHome={onGoToHomeScreen}
        onGoToProfile={onGoToProfileScreen}
        onGoToMyTrips={() => {}}
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
});
