import React, { useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import { TopMenu } from "../components/TopMenu"; // Ajusta la ruta si es necesario
import { SearchBar } from "../components/SearchBar";
import { BigCard } from "../components/BigCardHome";
import { RouteCard } from "../components/RouteCardHome";
import { SuggestionsSection } from "../components/SuggestionsSection";
import { BottomNavigation } from "../components/BottomNavigationBar";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useVerificationStatus } from "../hooks/useVerificationStatus";
import {
  getUserDataByUUID,
  getCedulaByUUID,
} from "../services/userDataService";

interface HomeScreenProps {
  onGoToInstitutions?: () => void;
  onGoToBecomeDriver?: () => void;
  onGoToDriverView?: () => void;
}

export default function HomeScreen({
  onGoToInstitutions,
  onGoToBecomeDriver,
  onGoToDriverView,
}: HomeScreenProps) {
  const [search, setSearch] = useState("");

  // Contexto de usuario y verificación
  const { user } = useAuth();
  const {
    institutionStatus,
    conductorStatus,
    loading: verificationLoading,
    error,
  } = useVerificationStatus();

  // Log de verificación al cargar la pantalla
  useEffect(() => {
    if (!verificationLoading) {
      console.log("[HomeScreen] Usuario actual:", user);
      console.log("[HomeScreen] Estado verificación:", {
        institutionStatus,
        conductorStatus,
        error,
        userEmail: user?.email,
      });

      // Obtener y mostrar id_usuario real
      if (user?.id) {
        (async () => {
          const userRow = await getUserDataByUUID(user.id);
          console.log(
            "[HomeScreen] id_usuario (tabla usuarios):",
            userRow?.id_usuario ?? userRow?.id
          );

          const cedula = await getCedulaByUUID(user.id);
          if (!cedula) {
            console.log("[HomeScreen] No se encontró cedula");
            return;
          }
          console.log("[HomeScreen] cedula:", cedula);
        })();
      }
    }
  }, [verificationLoading, institutionStatus, conductorStatus, error]);

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

  // Construimos dinámicamente las BigCards según el estado de verificación.
  const renderDynamicCards = () => {
    if (verificationLoading) return null; // Aún consultando, no mostrar nada.

    const cards: JSX.Element[] = [];

    // Tarjeta institución
    if (institutionStatus !== "validado") {
      cards.push(
        <BigCard
          key="inst-no"
          image={require("../assets/building3D.png")}
          title="Ingresa a una institución"
          description="Para poder tomar ver rutas específicas y tomar viajes"
          onPress={onGoToInstitutions ?? (() => alert("Institución"))}
        />
      );
    } else {
      cards.push(
        <BigCard
          key="inst-yes"
          image={require("../assets/building3D.png")}
          title="¿Tu institución?"
          description="Presiona aquí para acceder a los detalles de tu institución"
          onPress={onGoToInstitutions ?? (() => alert("pertenece Institución"))}
        />
      );
    }

    // Tarjetas de conductor basadas en status
    if (institutionStatus === "validado" && conductorStatus !== "validado") {
      cards.push(
        <BigCard
          key="cond-no"
          image={require("../assets/car3D.png")}
          title="Vuelvete conductor"
          description="Para poder transportar a otros usuarios"
          onPress={onGoToBecomeDriver ?? (() => alert("Conductor"))}
        />
      );
    } else if (
      institutionStatus === "validado" &&
      conductorStatus === "validado"
    ) {
      cards.push(
        <BigCard
          key="cond-yes"
          image={require("../assets/car3D.png")}
          title="¿Vas a algún lado?"
          description="Presiona aquí para cambiar a la vista de conductor"
          onPress={
            onGoToDriverView ?? (() => alert("cambiar a vista conductor"))
          }
        />
      );
    }

    return cards;
  };

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
            {/* Tarjetas dinámicas según verificación */}
            {renderDynamicCards()}
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
