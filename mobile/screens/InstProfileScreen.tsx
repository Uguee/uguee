import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { TopMenu } from "../components/TopMenu";
import { BottomNavigation } from "../components/BottomNavigationBar";
import ProfileImage from "../components/ProfileImage";
import ProfileTextRow from "../components/ProfileTextRow";

interface InstProfileScreenProps {
  onGoToHomeScreen?: () => void;
  onGoToProfile?: () => void;
  onGoToMyVehicles?: () => void;
}

const InstProfileScreen = ({
  onGoToHomeScreen = () => {},
  onGoToProfile = () => {},
  onGoToMyVehicles = () => {},
}: InstProfileScreenProps) => {
  // Hooks para datos de la institución (modificable para Supabase)
  const [inst, setInst] = useState({
    nombreOficial: "123.456.789 - CC",
    direccion: "Calle 123 #45–6A",
    colores: ["Rojo", "Blanco"],
    imagen: require("../assets/univalle-logo.png"),
  });

  // Botones de navegación inferior
  const navButtons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      onPress: onGoToHomeScreen,
    },
    {
      label: "Mis viajes",
      icon: <MaterialIcons name="manage-accounts" size={28} color="#000" />,
      onPress: onGoToMyVehicles,
    },
    {
      label: "Drei punkt",
      icon: <Ionicons name="settings-outline" size={28} color="#000" />,
      onPress: () => {},
    },
    {
      label: "Perfil",
      icon: <FontAwesome name="user-o" size={26} color="#000" />,
      active: true,
      onPress: onGoToProfile,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>
        <ProfileImage source={inst.imagen} size={170} />
        <View style={{ marginTop: 48 }}>
          <ProfileTextRow
            label="Nombre oficial:"
            value={inst.nombreOficial}
            style={{ marginBottom: 38 }}
          />
          <ProfileTextRow
            label="Dirección"
            value={inst.direccion}
            style={{ marginBottom: 38 }}
          />
          <Text style={styles.label}>Colores</Text>
          {inst.colores.map((color, idx) => (
            <Text style={styles.value} key={idx}>
              {color}
            </Text>
          ))}
        </View>
      </ScrollView>
      <BottomNavigation buttons={navButtons} />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 8,
    color: "#222",
  },
  label: {
    fontWeight: "bold",
    color: "#111",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 2,
  },
  value: {
    color: "#222",
    fontSize: 15,
    marginLeft: 4,
    marginBottom: 2,
  },
});

export default InstProfileScreen;
