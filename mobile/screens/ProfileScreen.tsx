import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { TopMenu } from "../components/TopMenu";
import { HomeBottomMenu } from "../components/HomeBottomMenu";
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
      <HomeBottomMenu
        onGoToProfile={onGoToProfile}
        onGoToHome={onGoToHomeScreen}
        activeButton="profile"
      />
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
