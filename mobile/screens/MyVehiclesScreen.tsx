import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import { SearchBar } from "../components/SearchBar";
import VehicleCard from "../components/VehicleCard";
import AddVehicleButton from "../components/AddVehicleButton";
import { BottomNavigation } from "../components/BottomNavigationBar";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useUserVehicles } from "../hooks/useUserVehicles";

export default function MyVehiclesScreen({
  onGoToDriverHomeScreen = () => {},
  onGoToProfileScreen = () => {},
  onGoToTravelScreen = () => {},
  onGoToAddVehicleScreen = () => {},
}) {
  const {
    vehicles,
    loadingVehicles,
    disabledAdd,
    checkingPending,
    search,
    setSearch,
  } = useUserVehicles();

  const handleAddVehicle = () => {
    if (disabledAdd) {
      Alert.alert(
        "Límite alcanzado",
        "No se pueden añadir más vehículos porque hay 3 en estado pendiente. Debes esperar a que la institución los valide o los deniegue."
      );
      return;
    }
    onGoToAddVehicleScreen();
  };

  function handleVehiclePress(vehiculo: any) {
    Alert.alert(
      "Vehículo",
      `Placa: ${vehiculo.placa}\nModelo: ${vehiculo.modelo}\nColor: ${vehiculo.color}`
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu />
      <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 8 }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar Vehículo"
        />
        <Text style={styles.title}>Mis vehículos</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {loadingVehicles ? (
            <Text style={{ textAlign: "center", marginTop: 30 }}>
              Cargando vehículos...
            </Text>
          ) : vehicles.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 30 }}>
              No tienes vehículos registrados.
            </Text>
          ) : (
            vehicles.map((v, i) => (
              <VehicleCard
                key={i}
                image={getVehicleImage(v.tipo)}
                title={getVehicleTitle(v.tipo, v.modelo)}
                description={`${v.modelo}, ${v.color}.`}
                plate={v.placa}
                disabled={v.validacion === "pendiente"}
                estado={v.validacion}
                onPress={
                  v.validacion !== "pendiente"
                    ? () => handleVehiclePress(v)
                    : undefined
                }
              />
            ))
          )}
        </ScrollView>
      </View>
      <View style={styles.addButtonContainer}>
        <AddVehicleButton
          onPress={handleAddVehicle}
          disabled={disabledAdd || checkingPending}
        />
        {disabledAdd && !checkingPending && (
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => {
              Alert.alert(
                "Límite alcanzado",
                "No se pueden añadir más vehículos porque hay 3 en estado pendiente. Debes esperar a que la institución los valide o los deniegue."
              );
            }}
          >
            <Text style={styles.infoButtonText}>
              ¿Por qué no puedo añadir más vehículos?
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.bottomNavContainer}>
        <BottomNavigation
          buttons={[
            {
              label: "Inicio",
              icon: <Ionicons name="home-outline" size={28} color="#000" />,
              active: false,
              onPress: onGoToDriverHomeScreen,
            },
            {
              label: "Mis vehiculos",
              active: true,
              icon: (
                <MaterialIcons name="airport-shuttle" size={28} color="#000" />
              ),
              onPress: () => {},
            },
            {
              label: "Mis viajes",
              icon: <Ionicons name="settings-outline" size={28} color="#000" />,
              onPress: onGoToTravelScreen,
            },
            {
              label: "Perfil",
              icon: <FontAwesome name="user-o" size={26} color="#000" />,
              onPress: onGoToProfileScreen,
            },
          ]}
        />
      </View>
    </View>
  );
}

function getVehicleImage(tipo: number) {
  switch (tipo) {
    case 1:
      return require("../assets/redCar.png");
    case 2:
      return require("../assets/redMoto.png");
    case 3:
      return require("../assets/bike.png");
    case 6:
      return require("../assets/scooter.png");
    default:
      return require("../assets/redCar.png");
  }
}
function getVehicleTitle(tipo: number, modelo: number) {
  switch (tipo) {
    case 1:
      return `Carro: ${modelo}`;
    case 2:
      return `Moto: ${modelo}`;
    case 3:
      return `Bicicleta: ${modelo}`;
    case 6:
      return `Monopatín: ${modelo}`;
    default:
      return `Vehículo: ${modelo}`;
  }
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 12,
    color: "#222",
  },
  addButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 70,
    paddingHorizontal: 16,
    zIndex: 2,
    backgroundColor: "transparent",
  },
  bottomNavContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
  },
  infoButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
    marginHorizontal: 10,
  },
  infoButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 15,
  },
});
