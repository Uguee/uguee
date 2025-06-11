import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import { DriverHomeBottomMenu } from "../components/DriverHomeBottomMenu";
import TripCard from "../components/TripCard";
import { SearchBar } from "../components/SearchBar";
import AddRouteButton from "../components/AddRouteButton";
import { useUserRoutes } from "../hooks/useUserRoutes";

interface DriverRoutesScreenProps {
  onGoToRegisterRouteScreen?: () => void;
  onGoToDriverHome?: () => void;
  onGoToMyVehicles?: () => void;
  onGoToProfile?: () => void;
  refreshKey?: any;
  onGoToMyTripsScreen?: () => void;
}

function formatPlaceName(nombre: string | null): string {
  if (!nombre) return "";
  const partes = nombre.split(",").map((p) => p.trim());
  // Tomar las primeras 3 partes y añadir "Cali"
  return `${partes.slice(0, 3).join(", ")}, Cali`;
}

const DriverRoutesScreen: React.FC<DriverRoutesScreenProps> = ({
  onGoToRegisterRouteScreen = () => {},
  onGoToDriverHome = () => {},
  onGoToMyVehicles = () => {},
  onGoToProfile = () => {},
  refreshKey,
  onGoToMyTripsScreen = () => {},
}) => {
  const [search, setSearch] = useState("");
  const { routes, loading, error } = useUserRoutes(refreshKey);

  // Filtrado simple por búsqueda en nombre_partida o nombre_llegada
  const filteredRoutes = routes.filter(
    (route) =>
      formatPlaceName(route.nombre_partida)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      formatPlaceName(route.nombre_llegada)
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <View style={styles.content}>
        <View style={styles.searchBar}>
          <SearchBar
            placeholder="Busca tus rutas"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Text style={styles.title}>Rutas actuales disponibles</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#A259FF"
            style={{ marginTop: 40 }}
          />
        ) : error ? (
          <Text style={{ color: "red", marginTop: 40 }}>{error}</Text>
        ) : (
          <FlatList
            data={filteredRoutes}
            keyExtractor={(item) => item.id_ruta.toString()}
            renderItem={({ item }) => (
              <TripCard
                salida={formatPlaceName(item.nombre_partida)}
                llegada={formatPlaceName(item.nombre_llegada)}
                hora={""}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
          />
        )}
        <DriverHomeBottomMenu
          onGoToProfile={onGoToProfile}
          onGoToHome={onGoToDriverHome}
          onGoToMyVehicles={onGoToMyVehicles}
          onGoToMyTrips={onGoToMyTripsScreen}
          activeButton="trips"
        />
        <AddRouteButton onPress={onGoToRegisterRouteScreen} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 0,
  },
  searchBar: {
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
});

export default DriverRoutesScreen;
