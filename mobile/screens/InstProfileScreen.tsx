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
import ReturnButton from "../components/ReturnButton";
import ProfileImage from "../components/ProfileImage";
import ProfileTextRow from "../components/ProfileTextRow";
import { useInstitutionProfile } from "../hooks/useInstitutionProfile";

interface InstProfileScreenProps {
  onGoToHomeScreen?: () => void;
  onGoToProfile?: () => void;
  onGoToMyVehicles?: () => void;
  institutionData?: any;
}

const InstProfileScreen = ({
  onGoToHomeScreen = () => {},
  onGoToProfile = () => {},
  onGoToMyVehicles = () => {},
  institutionData,
}: InstProfileScreenProps) => {
  const { institution, loading, error } = useInstitutionProfile();
  const inst = institutionData || institution;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <ScrollView contentContainerStyle={styles.content}>
        <ReturnButton onPress={onGoToHomeScreen} />
        <View style={styles.mainContent}>
          <Text style={styles.title}>Perfil</Text>
          {!inst && loading ? (
            <ActivityIndicator
              size="large"
              color="#A259FF"
              style={{ marginTop: 40 }}
            />
          ) : !inst && error ? (
            <Text style={{ color: "red", marginTop: 40 }}>{error}</Text>
          ) : inst ? (
            <>
              <ProfileImage
                source={
                  inst.logo
                    ? { uri: inst.logo }
                    : require("../assets/univalle-logo.png")
                }
                size={170}
              />
              <View style={{ marginTop: 70 }}>
                <ProfileTextRow
                  label="Nombre oficial:"
                  value={inst.nombre_oficial}
                  style={{ marginBottom: 38 }}
                />
                <ProfileTextRow
                  label="Dirección"
                  value={inst.direccion}
                  style={{ marginBottom: 38 }}
                />
                <Text style={styles.label}>Colores</Text>
                {inst.colores?.split(" ").map((color: string, idx: number) => (
                  <Text style={styles.value} key={idx}>
                    {color}
                  </Text>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  mainContent: {
    marginTop: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
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
