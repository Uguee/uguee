import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TopMenu } from "../components/TopMenu";
import { BottomNavigation } from "../components/BottomNavigationBar";
import ShowInstitution from "../components/ShowInstSelected";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

interface SelectedInstScreenProps {
  institution: {
    name: string;
    address?: string;
    logo: any;
  } | null;
  onGoHome: () => void;
}

export default function SelectedInstScreen({
  institution,
  onGoHome,
}: SelectedInstScreenProps) {
  if (!institution) return null; // O un mensaje de error

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <View style={styles.content}>
        <Text style={styles.label}>Institución:</Text>
        <ShowInstitution
          name={institution.name}
          address={institution.address || "Dirección no disponible"}
          logo={institution.logo}
          onRequest={() => alert("Solicitud enviada")}
        />
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
    paddingTop: 16,
  },
  label: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    marginLeft: 4,
  },
});
