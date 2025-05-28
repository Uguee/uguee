import React, { useState } from "react";
import { View, FlatList } from "react-native";
import { TopMenu } from "../components/TopMenu"; // Ajusta la ruta si es necesario
import { SearchBar } from "../components/SearchBar";
import { BigCard } from "../components/BigCardHome";
import { RouteCard } from "../components/RouteCardHome";
import { SuggestionsSection } from "../components/SuggestionsSection";
import { BottomNavigation } from "../components/BottomNavigationBar";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

export default function HomeScreen() {
  const [search, setSearch] = useState("");

  const suggestions = [
    { label: "Sugerir ruta", onPress: () => alert("Sugerir ruta") },
    { label: "Intracampus", onPress: () => alert("Intracampus") },
    { label: "Rastrea rutas", onPress: () => alert("Rastrea rutas") },
  ];

  const navButtons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      active: true,
      onPress: () => alert("Inicio"),
    },
    {
      label: "Mis viajes",
      icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
      onPress: () => alert("Mis viajes"),
    },
    {
      label: "Servicios",
      icon: <Ionicons name="settings-outline" size={28} color="#000" />,
      onPress: () => alert("Servicios"),
    },
    {
      label: "Perfil",
      icon: <FontAwesome name="user-o" size={26} color="#000" />,
      onPress: () => alert("Perfil"),
    },
  ];

  const rutas = [
    {
      title: "Universidad del Valle",
      address: "Campus Meléndez Calle 13 # 100-00",
    },
    { title: "Unicentro - Sur", address: "Cra. 100 #5-169 - Centro comercial" },
  ];

  // 1. Filtra las rutas según el texto de búsqueda
  const rutasFiltradas = rutas.filter((ruta) =>
    ruta.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={rutasFiltradas}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item }) => (
          <RouteCard
            title={item.title}
            address={item.address}
            onPress={() => alert(item.title)}
          />
        )}
        ListHeaderComponent={
          <>
            <TopMenu onMenuPress={() => alert("Menú presionado")} />
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onLaterPress={() => alert("Más tarde")}
            />
            <BigCard
              image={require("../assets/building3D.png")}
              title="Ingresa a una institución"
              description="Para poder tomar ver rutas específicas y tomar viajes"
              onPress={() => alert("Institución")}
            />
            <BigCard
              image={require("../assets/car3D.png")}
              title="Vuelvete conductor"
              description="Para poder transportar a otros usuarios"
              onPress={() => alert("Conductor")}
            />
          </>
        }
        ListFooterComponent={
          <SuggestionsSection
            suggestions={suggestions}
            onSeeAll={() => alert("Ver todas las sugerencias")}
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <BottomNavigation buttons={navButtons} />
    </View>
  );
}
