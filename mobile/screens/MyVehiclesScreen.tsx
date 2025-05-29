import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import { SearchBar } from "../components/SearchBar";
import VehicleCard from "../components/VehicleCard";
import AddVehicleButton from "../components/AddVehicleButton";
import { BottomNavigation } from "../components/BottomNavigationBar";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

const vehicles = [
  {
    image: require("../assets/redCar.png"),
    title: "Carro: Chevrolet Sail",
    description: "2025, Rojo.",
    plate: "ABC-123",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redMoto.png"),
    title: "Moto: Yamaha",
    description: "2023, Azul.",
    plate: "EFG-45G",
  },
  {
    image: require("../assets/redCar.png"),
    title: "Carro: Chevrolet Sail",
    description: "2025, Rojo.",
    plate: "ABC-123",
  },
  {
    image: require("../assets/redCar.png"),
    title: "Carro: Chevrolet Sail",
    description: "2025, Rojo.",
    plate: "ABC-123",
  },

  // ...más vehículos
];

const navButtons = [
  {
    label: "Inicio",
    icon: <Ionicons name="home-outline" size={28} color="#000" />,
    active: false,
    onPress: () => alert("Ya te encuentras en inicio"),
  },
  {
    label: "Mis vehiculos",
    active: true,
    icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
    onPress: () => alert("Mis vehiculos"),
  },
  {
    label: "Mis viajes",
    icon: <Ionicons name="settings-outline" size={28} color="#000" />,
    onPress: () => alert("Mis viajes"),
  },
  {
    label: "Perfil",
    icon: <FontAwesome name="user-o" size={26} color="#000" />,
    onPress: () => alert("Perfil"),
  },
];

export default function MyVehiclesScreen() {
  const [search, setSearch] = useState("");

  const filtered = vehicles.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu />
      <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 8 }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar Vehículo"
        />
        <Text style={styles.title}>Mis vehículos</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {filtered.map((v, i) => (
            <VehicleCard key={i} {...v} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.addButtonContainer}>
        <AddVehicleButton onPress={() => alert("Añadir vehículo")} />
      </View>
      <View style={styles.bottomNavContainer}>
        <BottomNavigation buttons={navButtons} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 12,
    color: "#222",
  },
  addButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 70,
    paddingHorizontal: 16,
    zIndex: 2,
    backgroundColor: "transparent",
  },
  bottomNavContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
  },
});
