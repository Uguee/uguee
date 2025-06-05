import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { TopMenu } from "../components/TopMenu";
import ReturnButton from "../components/ReturnButton";
import ProfileTextRow from "../components/ProfileTextRow";
import { useMyProfile } from "../hooks/useMyProfile";
import { useAuth } from "../hooks/useAuth";

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
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    onGoToHomeScreen();
  };

  const getInitial = (name?: string) =>
    name && name.length > 0 ? name[0].toUpperCase() : "U";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ReturnButton onPress={onGoToHomeScreen} />
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
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {getInitial(profile.nombre)}
                </Text>
              </View>
              <Text style={styles.emailText}>
                {user?.email ? user.email : "Sin correo"}
              </Text>
            </View>
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
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
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
    marginTop: 25,
    color: "#222",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A259FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },
  emailText: {
    color: "#666",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  logoutButton: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 80,
    backgroundColor: "#FF2525",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    zIndex: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default ProfileScreen;
