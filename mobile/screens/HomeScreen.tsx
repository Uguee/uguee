import React, { useState, useEffect } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { TopMenu } from "../components/TopMenu";
import { SearchBar } from "../components/SearchBar";
import { BigCard } from "../components/BigCardHome";
import { RouteCard } from "../components/RouteCardHome";
import { SuggestionsSection } from "../components/SuggestionsSection";
import { HomeBottomMenu } from "../components/HomeBottomMenu";
import { useAuth } from "../hooks/useAuth";
import { useVerificationStatus } from "../hooks/useVerificationStatus";
import {
  getUserDataByUUID,
  getCedulaByUUID,
} from "../services/userDataService";

interface HomeScreenProps {
  onGoToInstitutions?: () => void;
  onGoToMyInstitution?: () => void;
  onGoToBecomeDriver?: () => void;
  onGoToDriverView?: () => void;
  onGoToProfile?: () => void;
  onGoToInstitutionProfile?: () => void;
  onGoToHome?: () => void;
  onGoToMyTripsScreen?: () => void;
}

export default function HomeScreen({
  onGoToInstitutions,
  onGoToMyInstitution,
  onGoToBecomeDriver,
  onGoToDriverView,
  onGoToProfile,
  onGoToInstitutionProfile,
  onGoToHome,
  onGoToMyTripsScreen,
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
            userRow?.id_usuario
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
    { label: "Rastrea rutas", onPress: () => alert("Rastrea rutas") },
  ];

  const rutas = [
    {
      title: "Universidad del Valle",
      address: "Campus Meléndez Calle 13 # 100-00",
    },
    { title: "Unicentro - Sur", address: "Cra. 100 #5-169 - Centro comercial" },
  ];

  // Filtra las rutas según el texto de búsqueda
  const rutasFiltradas = rutas.filter((ruta) =>
    ruta.title.toLowerCase().includes(search.toLowerCase())
  );

  // Construimos dinámicamente las BigCards según el estado de verificación.
  const renderDynamicCards = () => {
    if (verificationLoading) return null;
    const cards: React.ReactElement[] = [];
    if (conductorStatus === "pendiente") {
      if (institutionStatus === "validado") {
        cards.push(
          <BigCard
            key="inst-yes"
            image={require("../assets/building3D.png")}
            title="¿Tu institución?"
            description="Presiona aquí para acceder a los detalles de tu institución"
            onPress={
              onGoToInstitutionProfile ?? (() => alert("pertenece Institución"))
            }
          />
        );
      }
      cards.push(
        <BigCard
          key="cond-pending"
          image={require("../assets/car3D.png")}
          title="Tu solicitud está pendiente"
          description={
            "Tienes que esperar un poco, hasta que la institución te acepte como conductor."
          }
        />
      );
      return cards;
    }
    if (institutionStatus === "pendiente") {
      cards.push(
        <BigCard
          key="inst-pending"
          image={require("../assets/building3D.png")}
          title="Tu solicitud está pendiente"
          description="No tardará mucho en ser aceptada por la institución"
          onPress={() => {}}
        />
      );
      return cards;
    }
    if (institutionStatus !== "validado") {
      cards.push(
        <BigCard
          key="inst-no"
          image={require("../assets/building3D.png")}
          title="Ingresa a una institución"
          description="Para poder tomar ver rutas específicas y tomar viajes"
          onPress={onGoToInstitutions ?? (() => alert("Ir a instituciones"))}
        />
      );
    } else {
      cards.push(
        <BigCard
          key="inst-yes"
          image={require("../assets/building3D.png")}
          title="¿Tu institución?"
          description="Presiona aquí para acceder a los detalles de tu institución"
          onPress={
            onGoToInstitutionProfile ?? (() => alert("pertenece Institución"))
          }
        />
      );
    }
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
          title="¿Vas a manejar?"
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
              {`Te damos la bienvenida, ${user?.firstName || ""}`}
            </Text>
            {/* Tarjetas dinámicas según verificación */}
            {renderDynamicCards()}
          </>
        }
        ListFooterComponent={<SuggestionsSection suggestions={suggestions} />}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <HomeBottomMenu
        onGoToProfile={onGoToProfile ?? (() => alert("Perfil"))}
        onGoToHome={() => {}}
        onGoToMyTrips={onGoToMyTripsScreen ?? (() => {})}
        activeButton="home"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... existing code ...
});
