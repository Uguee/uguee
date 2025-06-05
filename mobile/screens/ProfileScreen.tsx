import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { TopMenu } from "../components/TopMenu";
import { BottomNavigation } from "../components/BottomNavigationBar";
import ProfileImage from "../components/ProfileImage";
import ProfileTextRow from "../components/ProfileTextRow";
import { useMyProfile } from "../hooks/useMyProfile";

interface ProfileScreenProps {
  onGoToHomeScreen?: () => void;
  onGoToProfile?: () => void;
  onGoToMyVehicles?: () => void;
}

const ProfileScreen = ({
  onGoToHomeScreen = () => {},
  onGoToProfile = () => {},
  onGoToMyVehicles = () => {},
}: ProfileScreenProps) => {
  const { profile, loading, error } = useMyProfile();

  const navButtons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      onPress: onGoToHomeScreen,
    },
    {
      label: "Mis viajes",
      icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
      onPress: onGoToMyVehicles,
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
      onPress: onGoToProfile,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#A259FF"
            style={{ marginTop: 40 }}
          />
        ) : error ? (
          <Text style={{ color: "red", marginTop: 40 }}>{error}</Text>
        ) : profile ? (
          <>
            <ProfileImage source={require("../assets/univalle-logo.png")} />
            <View style={{ marginTop: 40 }}>
              <ProfileTextRow
                label="No. Identificación:"
                value={profile.id_usuario ? String(profile.id_usuario) : ""}
              />
              <View style={{ flexDirection: "row", gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <ProfileTextRow
                    label="Nombre:"
                    value={profile.nombre || ""}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ProfileTextRow
                    label="Apellido:"
                    value={profile.apellido || ""}
                  />
                </View>
              </View>
              <ProfileTextRow
                label="Fecha de nacimiento:"
                value={profile.fecha_nacimiento || ""}
              />
              <ProfileTextRow label="Rol:" value={profile.rol || ""} />
              <ProfileTextRow
                label="Celular:"
                value={profile.celular ? String(profile.celular) : ""}
              />
              <ProfileTextRow
                label="¿Eres conductor?"
                value={profile.esConductor ? "Sí" : "No"}
              />
            </View>
          </>
        ) : null}
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
