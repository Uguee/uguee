import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { TopMenu } from "../components/TopMenu";
import { BottomNavigation } from "../components/BottomNavigationBar";
import ProfileImage from "../components/ProfileImage";
import ProfileTextRow from "../components/ProfileTextRow";

const ProfileScreen = () => {
  // Hooks para datos de usuario (modificable para Supabase)
  const [profile, setProfile] = useState({
    identificacion: "123.456.789 - CC",
    nombre: "John",
    apellido: "Doe",
    nacimiento: "11/22/3333",
    direccion: "Calle 123 #45-6A",
    institucion: "Universidad del Valle: Sede Meléndez",
    conductor: "Sí",
    imagen: require("../assets/driver.png"),
  });

  // Botones de navegación inferior
  const navButtons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      onPress: () => {},
    },
    {
      label: "Mis viajes",
      icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
      onPress: () => {},
    },
    {
      label: "Servicios",
      icon: <Ionicons name="settings-outline" size={28} color="#000" />,
      onPress: () => {},
    },
    {
      label: "Perfil",
      icon: <FontAwesome name="user-o" size={26} color="#000" />,
      active: true,
      onPress: () => {},
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>
        <ProfileImage source={profile.imagen} />
        <View style={{ marginTop: 40 }}>
          <ProfileTextRow
            label="No. Identificación:"
            value={profile.identificacion}
          />
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <ProfileTextRow label="Nombre:" value={profile.nombre} />
            </View>
            <View style={{ flex: 1 }}>
              <ProfileTextRow label="Apellido:" value={profile.apellido} />
            </View>
          </View>
          <ProfileTextRow
            label="Fecha de nacimiento:"
            value={profile.nacimiento}
          />
          <ProfileTextRow
            label="Dirección de residencia:"
            value={profile.direccion}
          />
          <ProfileTextRow
            label="Institución a la que pertenece:"
            value={profile.institucion}
          />
          <ProfileTextRow label="¿Eres conductor?" value={profile.conductor} />
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
});

export default ProfileScreen;
