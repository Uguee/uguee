import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { TopMenu } from "../components/TopMenu";
import { HomeBottomMenu } from "../components/HomeBottomMenu";
import ShowInstitution from "../components/ShowInstSelected";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { getRegisterValidationStatus } from "../services/institutionService";
import { getCedulaByUUID } from "../services/userDataService";
import { useAuth } from "../hooks/useAuth";

interface Institution {
  id_institucion: number;
  nombre_oficial: string;
  logo: any;
  direccion?: string;
  colores?: string;
  [key: string]: any;
}

interface SelectedInstScreenProps {
  institution: Institution | null;
  onGoHome: () => void;
  onRequestRegister: (institution: Institution) => void;
  onGoToMyTripsScreen?: () => void;
}

export default function SelectedInstScreen({
  institution,
  onGoHome,
  onRequestRegister,
  onGoToMyTripsScreen,
}: SelectedInstScreenProps) {
  const { user } = useAuth();

  if (!institution) return null; // O un mensaje de error

  // Construir el logo correctamente
  const logoSource = institution.logo
    ? {
        uri: `https://ezuujivxstyuziclhvhp.supabase.co/storage/v1/object/public/logos/${institution.logo}`,
      }
    : require("../assets/univalle-logo.png");

  const handleRequest = async () => {
    if (!user?.id) {
      Alert.alert("Error", "No se pudo obtener el usuario autenticado.");
      return;
    }
    const id_usuario = await getCedulaByUUID(user.id);
    if (!id_usuario) {
      Alert.alert(
        "Error",
        "No se pudo obtener el id_usuario real del usuario."
      );
      return;
    }
    try {
      const status = await getRegisterValidationStatus({
        id_usuario,
        id_institucion: institution.id_institucion,
      });
      if (status === "denegado") {
        Alert.alert(
          "Solicitud denegada",
          "Te han denegado la solicitud a esta institución."
        );
        return;
      }
      if (status === "pendiente") {
        Alert.alert(
          "Solicitud pendiente",
          "Tu solicitud está pendiente de aprobación por la institución."
        );
        return;
      }
      if (status === "validado") {
        Alert.alert(
          "Solicitud aceptada",
          "Ya has sido aceptado en esta institución."
        );
        return;
      }
      // Si es null, permitir continuar
      onRequestRegister(institution);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "No se pudo verificar el estado de la solicitud."
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <View style={styles.content}>
        <Text style={styles.label}>Institución:</Text>
        <ShowInstitution
          name={institution.nombre_oficial}
          address={institution.direccion || "Dirección no disponible"}
          logo={logoSource}
          onRequest={handleRequest}
        />
        {/* Mostrar información adicional si se desea */}
        <Text style={styles.info}>ID: {institution.id_institucion}</Text>
        {institution.colores && (
          <Text style={styles.info}>Colores: {institution.colores}</Text>
        )}
      </View>
      <HomeBottomMenu
        onGoToProfile={() => {}}
        onGoToHome={onGoHome}
        onGoToMyTrips={onGoToMyTripsScreen ?? (() => {})}
        activeButton="home"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  label: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 12,
    color: "#222",
  },
  info: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});
