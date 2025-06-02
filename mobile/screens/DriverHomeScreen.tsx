import React, { useState } from "react";
import { View, FlatList, Text } from "react-native";
import { TopMenu } from "../components/DriverTopMenu"; // Ajusta la ruta si es necesario
import { SearchBar } from "../components/SearchBar";
import { BigCard } from "../components/BigCardHome";
import { RouteCard } from "../components/RouteCardHome";
import { SuggestionsSection } from "../components/SuggestionsSection";
import { BottomNavigation } from "../components/BottomNavigationBar";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

// Agrega las props
interface DriverHomeScreenProps {
  onGoToInstitutions?: () => void;
  onGoToHomeScreen?: () => void;
  onGoToMyVehicles?: () => void;
  onGoToProfile?: () => void;
  onGoToInstitutionProfile?: () => void;
  onGoToRegisterRouteScreen?: () => void;
  onGoToSeeRoutes?: () => void;
}

export default function DriverHomeScreen({
  onGoToInstitutions,
  onGoToHomeScreen,
  onGoToMyVehicles = () => {},
  onGoToProfile = () => {},
  onGoToInstitutionProfile = () => {},
  onGoToRegisterRouteScreen = () => {},
  onGoToSeeRoutes = () => {},
}: DriverHomeScreenProps) {
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const suggestions = [
    { label: "Crear ruta", onPress: onGoToRegisterRouteScreen },
    { label: "Ver rutas", onPress: onGoToSeeRoutes },
  ];

  const navButtons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      active: true,
      onPress: () => {},
    },
    {
      label: "Mis vehiculos",
      icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
      onPress: onGoToMyVehicles,
    },
    {
      label: "Mis viajes",
      icon: <Ionicons name="settings-outline" size={28} color="#000" />,
      onPress: onGoToRegisterRouteScreen,
    },
    {
      label: "Perfil",
      icon: <FontAwesome name="user-o" size={26} color="#000" />,
      onPress: onGoToProfile ?? (() => alert("Perfil")),
    },
  ];

  const rutas = [
    {
      title: "Universidad del Valle",
      address: "Campus Meléndez Calle 13 # 100-00",
    },
    { title: "Unicentro - Sur", address: "Cra. 100 #5-169 - Centro comercial" },
  ];

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
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#8B5CF6",
                marginHorizontal: 16,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {`¡Hola,${
                user?.firstName ? ` ${user.firstName}` : ""
              }! Gracias por conducir con nosotros`}
            </Text>
            <BigCard
              image={require("../assets/building3D.png")}
              title="¿Tu institución?"
              description="Presiona aquí para acceder a los detalles de tu institución"
              onPress={onGoToInstitutionProfile}
            />
            <BigCard
              image={require("../assets/bus.png")}
              title="¿Vas a algún lado?"
              description="Presiona aquí para cambiar a la vista de pasajero"
              onPress={onGoToHomeScreen}
            />
          </>
        }
        ListFooterComponent={<SuggestionsSection suggestions={suggestions} />}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <BottomNavigation buttons={navButtons} />
    </View>
  );
}
