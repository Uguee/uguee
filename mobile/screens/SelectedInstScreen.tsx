import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TopMenu } from "../components/TopMenu";
import { BottomNavigation } from "../components/BottomNavigationBar";
import ShowInstitution from "../components/ShowInstSelected";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

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
}

export default function SelectedInstScreen({
  institution,
  onGoHome,
  onRequestRegister,
}: SelectedInstScreenProps) {
  if (!institution) return null; // O un mensaje de error

  // Construir el logo correctamente
  const logoSource = institution.logo
    ? {
        uri: `https://ezuujivxstyuziclhvhp.supabase.co/storage/v1/object/public/logos/${institution.logo}`,
      }
    : require("../assets/univalle-logo.png");

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <View style={styles.content}>
        <Text style={styles.label}>Institución:</Text>
        <ShowInstitution
          name={institution.nombre_oficial}
          address={institution.direccion || "Dirección no disponible"}
          logo={logoSource}
          onRequest={() => onRequestRegister(institution)}
        />
        {/* Mostrar información adicional si se desea */}
        <Text style={styles.info}>ID: {institution.id_institucion}</Text>
        {institution.colores && (
          <Text style={styles.info}>Colores: {institution.colores}</Text>
        )}
      </View>
      <BottomNavigation
        buttons={[
          {
            label: "Inicio",
            icon: <Ionicons name="home-outline" size={28} color="#000" />,
            active: false,
            onPress: onGoHome,
          },
          {
            label: "Mis viajes",
            icon: (
              <MaterialIcons name="airport-shuttle" size={28} color="#000" />
            ),
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
        ]}
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
