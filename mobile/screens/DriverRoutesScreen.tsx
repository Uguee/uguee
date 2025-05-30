import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { TopMenu } from "../components/DriverTopMenu";
import { BottomNavigation } from "../components/BottomNavigationBar";
import TripCard from "../components/TripCard";
import { SearchBar } from "../components/SearchBar";
import AddRouteButton from "../components/AddRouteButton";

const routesMock = [
  {
    id: 1,
    salida: "Univalle",
    llegada: "Multicentro",
    hora: "",
    direccion: "Campus Meléndez Calle 13 # 100",
  },
  {
    id: 2,
    salida: "Univalle",
    llegada: "Multicentro",
    hora: "",
    direccion: "Campus Meléndez Calle 13 # 100",
  },
  {
    id: 3,
    salida: "Univalle",
    llegada: "Multicentro",
    hora: "",
    direccion: "Campus Meléndez Calle 13 # 100",
  },
  {
    id: 4,
    salida: "Univalle",
    llegada: "Multicentro",
    hora: "",
    direccion: "Campus Meléndez Calle 13 # 100",
  },
  {
    id: 5,
    salida: "Univalle",
    llegada: "Multicentro",
    hora: "",
    direccion: "Campus Meléndez Calle 13 # 100",
  },
];

const DriverRoutesScreen = () => {
  const [search, setSearch] = useState("");

  // Botones de navegación inferior
  const navButtons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      active: true,
      onPress: () => {},
    },
    {
      label: "Mis viajes",
      icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
      onPress: () => {},
    },
    {
      label: "Mis vehículos",
      icon: <Ionicons name="car-sport-outline" size={28} color="#000" />,
      onPress: () => {},
    },
    {
      label: "Perfil",
      icon: <FontAwesome name="user-o" size={26} color="#000" />,
      onPress: () => {},
    },
  ];

  // Filtrado simple por búsqueda
  const filteredRoutes = routesMock.filter(
    (route) =>
      route.salida.toLowerCase().includes(search.toLowerCase()) ||
      route.llegada.toLowerCase().includes(search.toLowerCase())
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
        <FlatList
          data={filteredRoutes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TripCard
              salida={item.salida}
              llegada={item.llegada}
              hora={item.hora}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        />
        <BottomNavigation buttons={navButtons} />
        <AddRouteButton onPress={() => {}} />
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
