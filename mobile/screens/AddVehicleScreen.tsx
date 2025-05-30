import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import VehicleForm from "../components/VehicleForm";
import AddVehicleButton from "../components/AddVehicleButton";
import { BottomNavigation } from "../components/BottomNavigationBar";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

interface AddVehicleScreenProps {
  onGoToMyVehicles?: () => void;
  onGoToHomeScreen?: () => void;
  onGoToProfile?: () => void;
}

export default function AddVehicleScreen({
  onGoToMyVehicles = () => {},
  onGoToHomeScreen = () => {},
  onGoToProfile = () => {},
}: AddVehicleScreenProps) {
  const [form, setForm] = useState<{
    placa: string;
    color: string;
    modelo: string;
    tipo: string;
    vigenciaSoat: string;
    fechaTecno: string;
    filesSoat: string[];
    filesTecno: string[];
    filesProp: string[];
  }>({
    placa: "",
    color: "",
    modelo: "",
    tipo: "",
    vigenciaSoat: "",
    fechaTecno: "",
    filesSoat: [],
    filesTecno: [],
    filesProp: [],
  });

  const handlePickFiles = (field: string) => {
    // Aquí iría la lógica para seleccionar imágenes
    Alert.alert(
      "Adjuntar archivos",
      `Funcionalidad de adjuntar imágenes para ${field} pendiente.`
    );
  };

  const handleSubmit = () => {
    Alert.alert("Vehículo añadido", "Tu vehículo ha sido registrado.");
  };
  const navButtons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      onPress: onGoToHomeScreen,
    },
    {
      label: "Mis vehiculos",
      icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
      onPress: onGoToMyVehicles,
    },
    {
      label: "Mis viajes",
      icon: <Ionicons name="settings-outline" size={28} color="#000" />,
      onPress: () => alert("Mis viajes"),
    },
    {
      label: "Perfil",
      icon: <FontAwesome name="user-o" size={26} color="#000" />,
      onPress: onGoToProfile,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu />
      <ScrollView contentContainerStyle={styles.container}>
        <VehicleForm
          value={form}
          onChange={setForm}
          onPickFiles={handlePickFiles}
        />
        <AddVehicleButton onPress={handleSubmit} />
      </ScrollView>
      <BottomNavigation buttons={navButtons} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 120, // para que el botón no tape el contenido
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "flex-start",
  },
});
