import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUserRoutes } from "../hooks/useUserRoutes";
import { useUserVehicles } from "../hooks/useUserVehicles";
import ReturnButton from "../components/ReturnButton";

interface DriverCreateTripScreenProps {
  onGoToRegisterRouteScreen: () => void;
  onTripCreated?: (trip: any) => void;
  onGoBack?: () => void;
}

export default function DriverCreateTripScreen({
  onGoToRegisterRouteScreen,
  onTripCreated,
  onGoBack,
}: DriverCreateTripScreenProps) {
  // Rutas y vehículos del usuario
  const { routes, loading: loadingRoutes } = useUserRoutes();
  const { vehicles, loadingVehicles } = useUserVehicles();

  // Estado del formulario
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>("");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Handlers
  const handleSelectRoute = (route: any) => {
    setSelectedRoute(route);
    setShowRouteModal(false);
  };
  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setSelectedVehiclePlate(vehicle.placa);
    setShowVehicleModal(false);
  };
  const handleTimeChange = (_: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) setStartTime(selected);
  };
  const handleDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) setDate(selected);
  };

  // Formateo
  const formatTime = (d: Date | null) =>
    d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const formatDate = (d: Date | null) =>
    d
      ? `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`
      : "";

  // Crear viaje (dummy)
  const handleCreateTrip = () => {
    if (onTripCreated)
      onTripCreated({
        route: selectedRoute,
        vehicle: selectedVehicle,
        startTime,
        date,
      });
    // Aquí iría la lógica real de creación
  };

  return (
    <View style={styles.container}>
      {onGoBack && <ReturnButton onPress={onGoBack} />}
      <Text style={styles.title}>Ugüee</Text>
      <Text style={styles.subtitle}>
        Selecciona o crea rutas{"\n"}para crear un viaje
      </Text>

      {/* Ruta para el viaje */}
      <Text style={styles.label}>Ruta para el viaje</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowRouteModal(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: selectedRoute ? "#222" : "#888" }}>
          {selectedRoute
            ? `${selectedRoute.nombre_partida} → ${selectedRoute.nombre_llegada}`
            : "selecciona una ruta"}
        </Text>
      </TouchableOpacity>
      {/* Modal de rutas */}
      <Modal visible={showRouteModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRouteModal(false)}
        >
          <View style={styles.modalContent}>
            {loadingRoutes && routes.length === 0 ? (
              <Text
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#A259FF",
                  fontWeight: "bold",
                }}
              >
                Cargando rutas...
              </Text>
            ) : (
              <FlatList
                data={routes}
                keyExtractor={(item) => item.id_ruta.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleSelectRoute(item)}
                  >
                    <View style={styles.routeIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownTitle}>
                        {item.nombre_partida} → {item.nombre_llegada}
                      </Text>
                      <Text style={styles.dropdownSubtitle}>
                        Salida: {item.nombre_partida}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListFooterComponent={
                  <TouchableOpacity
                    style={styles.createRouteBtn}
                    onPress={() => {
                      setShowRouteModal(false);
                      onGoToRegisterRouteScreen();
                    }}
                  >
                    <Ionicons name="add" size={22} color="#fff" />
                    <Text style={styles.createRouteBtnText}>Crear ruta</Text>
                  </TouchableOpacity>
                }
                style={{ maxHeight: 260 }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Vehículo */}
      <Text style={styles.label}>Vehículo</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowVehicleModal(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: selectedVehiclePlate ? "#222" : "#888" }}>
          {selectedVehiclePlate
            ? selectedVehiclePlate
            : "selecciona uno de tus vehículos para el viaje"}
        </Text>
      </TouchableOpacity>
      {/* Modal de vehículos */}
      <Modal visible={showVehicleModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVehicleModal(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={vehicles}
              keyExtractor={(item, idx) => item.placa + idx}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelectVehicle(item)}
                >
                  <Ionicons
                    name="car"
                    size={28}
                    color="#A259FF"
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropdownTitle}>
                      {getVehicleTitle(item)}
                    </Text>
                    <Text style={styles.dropdownSubtitle}>
                      {item.modelo}, {item.color}.
                    </Text>
                  </View>
                  <Text style={styles.dropdownPlate}>{item.placa}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 220 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Hora de inicio */}
      <Text style={styles.label}>Hora de inicio</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTimePicker(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: startTime ? "#222" : "#888" }}>
          {startTime
            ? formatTime(startTime)
            : "Ingresa la hora de inicio del viaje"}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}

      {/* Fecha */}
      <Text style={styles.label}>Fecha</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: date ? "#222" : "#888" }}>
          {date ? formatDate(date) : "Ingresa la fecha del viaje"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "calendar" : "default"}
          onChange={handleDateChange}
        />
      )}

      {/* Botón Crear viaje */}
      <TouchableOpacity style={styles.createTripBtn} onPress={handleCreateTrip}>
        <Ionicons
          name="add"
          size={28}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.createTripBtnText}>Crear viaje</Text>
      </TouchableOpacity>
    </View>
  );
}

function getVehicleTitle(vehicle: any) {
  switch (vehicle.tipo) {
    case 1:
      return `Carro`;
    case 2:
      return `Moto`;
    case 3:
      return `Bicicleta`;
    case 6:
      return `Monopatín`;
    default:
      return `Vehículo`;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#A259FF",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    color: "#111",
    textAlign: "center",
    marginBottom: 28,
    fontWeight: "bold",
  },
  label: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 16,
    marginBottom: 6,
    marginTop: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    minWidth: 300,
    maxWidth: 340,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    marginBottom: 8,
  },
  dropdownTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  dropdownSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  dropdownPlate: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    marginLeft: 8,
  },
  routeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#A259FF",
    marginRight: 10,
  },
  createRouteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A259FF",
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: "center",
    marginTop: 8,
  },
  createRouteBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  createTripBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A259FF",
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  createTripBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
});
