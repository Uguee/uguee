import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouteManager } from "../hooks/useRouteManager";
import { useViajeManager } from "../hooks/useViajeManager";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { supabase } from "../src/lib/supabase";
import DriverRouteMap from "../components/maps/DriverRouteMap";
import { GeocodingService } from "../services/GeocodingService";

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
  address?: string;
}

interface RutaExistente {
  id_ruta: number;
  longitud: number;
}

interface CreateTripProps {
  onGoBack: () => void;
}

const CreateTrip: React.FC<CreateTripProps> = ({ onGoBack }) => {
  const [currentRoute, setCurrentRoute] = useState<{
    origin: RoutePoint;
    destination: RoutePoint;
    path: [number, number][];
  } | null>(null);

  const [modoCreacion, setModoCreacion] = useState<"seleccionar" | "nueva">(
    "seleccionar"
  );
  const [rutaSeleccionada, setRutaSeleccionada] = useState<number | null>(null);
  const [rutasDisponibles, setRutasDisponibles] = useState<RutaExistente[]>([]);
  const [rutaSeleccionadaDetalle, setRutaSeleccionadaDetalle] =
    useState<any>(null);

  const [fecha, setFecha] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");
  const [vehiculo, setVehiculo] = useState("");

  const { saveRoute, isLoading: isLoadingRoute } = useRouteManager();
  const {
    fetchRutasDisponibles,
    crearViaje,
    isLoading: isLoadingViaje,
  } = useViajeManager();
  const { currentUserId, isLoading: isLoadingUser } = useCurrentUser();

  useEffect(() => {
    const cargarRutas = async () => {
      try {
        const rutas = await fetchRutasDisponibles();
        setRutasDisponibles(rutas);
      } catch (error) {
        console.error("Error cargando rutas:", error);
      }
    };
    cargarRutas();
  }, []);

  useEffect(() => {
    const cargarDetalleRuta = async () => {
      if (!rutaSeleccionada || modoCreacion !== "seleccionar") {
        setRutaSeleccionadaDetalle(null);
        return;
      }

      try {
        const { data, error } = await supabase.rpc(
          "obtener_ruta_con_coordenadas",
          {
            p_id_ruta: rutaSeleccionada,
          }
        );

        if (error) throw error;
        if (data && data.length > 0) {
          setRutaSeleccionadaDetalle(data[0]);
        }
      } catch (error) {
        console.error("Error cargando detalle de ruta:", error);
        alert("No se pudo cargar el detalle de la ruta");
      }
    };

    cargarDetalleRuta();
  }, [rutaSeleccionada, modoCreacion]);

  const handleRouteGenerated = (
    origin: RoutePoint,
    destination: RoutePoint,
    route: [number, number][]
  ) => {
    setCurrentRoute({
      origin,
      destination,
      path: route,
    });
  };

  const handleCrearViaje = async () => {
    if (!currentUserId) {
      alert("No se pudo identificar el usuario actual");
      return;
    }

    if (!fecha || !horaSalida || !horaLlegada || !vehiculo) {
      alert("Por favor completa todos los campos del viaje");
      return;
    }

    if (modoCreacion === "seleccionar" && !rutaSeleccionada) {
      alert("Debes seleccionar una ruta existente");
      return;
    }

    if (modoCreacion === "nueva" && !currentRoute) {
      alert("Debes crear una ruta nueva en el mapa");
      return;
    }

    try {
      let idRutaAUsar: number;

      if (modoCreacion === "nueva" && currentRoute) {
        const rutaNueva = await saveRoute({
          origin: currentRoute.origin,
          destination: currentRoute.destination,
          path: currentRoute.path,
          driverId: currentUserId,
        });
        idRutaAUsar = rutaNueva.id_ruta;
      } else if (modoCreacion === "seleccionar" && rutaSeleccionada) {
        idRutaAUsar = rutaSeleccionada;
      } else {
        throw new Error("No se pudo determinar la ruta a usar");
      }

      const viajeCreado = await crearViaje({
        id_ruta: idRutaAUsar,
        id_conductor: currentUserId,
        id_vehiculo: vehiculo,
        fecha: fecha,
        hora_salida: horaSalida,
        hora_llegada: horaLlegada,
        reseña: 1,
      });

      alert(Viaje creado exitosamente para el ${fecha});

      // Limpiar formulario
      setCurrentRoute(null);
      setRutaSeleccionada(null);
      setFecha("");
      setHoraSalida("");
      setHoraLlegada("");
      setVehiculo("");

      const rutasActualizadas = await fetchRutasDisponibles();
      setRutasDisponibles(rutasActualizadas);
    } catch (error) {
      console.error("Error completo creando viaje:", error);
      alert(
        `No se pudo crear el viaje: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  const handleMapClick = async (
    lat: number,
    lng: number,
    isLongPress: boolean = false
  ) => {
    try {
      const location = await GeocodingService.reverseGeocode(lat, lng);
      if (!location) return;

      if (isLongPress) {
        setCurrentRoute({
          origin: {
            lat: location.lat,
            lng: location.lng,
            label: location.address,
          },
          destination: currentRoute?.destination || {
            lat: 0,
            lng: 0,
            label: "",
          },
          path: [],
        });
      } else {
        if (!currentRoute) {
          alert("Primero debes establecer el origen (mantén presionado)");
          return;
        }
        setCurrentRoute({
          origin: currentRoute.origin,
          destination: {
            lat: location.lat,
            lng: location.lng,
            label: location.address,
          },
          path: [],
        });
      }
    } catch (error) {
      console.error("Error handling map click:", error);
      alert("No se pudo establecer la ubicación");
    }
  };

  if (isLoadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  if (!currentUserId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No se pudo identificar el usuario actual
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Botón de regreso */}
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        {/* Modo de Creación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modo de Creación</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                modoCreacion === "seleccionar" && styles.radioButtonSelected,
              ]}
              onPress={() => setModoCreacion("seleccionar")}
            >
              <Text style={styles.radioText}>Usar ruta existente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioButton,
                modoCreacion === "nueva" && styles.radioButtonSelected,
              ]}
              onPress={() => setModoCreacion("nueva")}
            >
              <Text style={styles.radioText}>Crear nueva ruta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mapa */}
        <View style={styles.mapContainer}>
          <DriverRouteMap
            onRouteGenerated={handleRouteGenerated}
            existingRoute={rutaSeleccionadaDetalle}
            mode={modoCreacion}
            onMapPress={handleMapClick}
          />
        </View>

        {/* Detalles del Viaje */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Viaje</Text>
          <TextInput
            style={styles.input}
            placeholder="Fecha (YYYY-MM-DD)"
            value={fecha}
            onChangeText={setFecha}
          />
          <TextInput
            style={styles.input}
            placeholder="Hora de salida (HH:MM)"
            value={horaSalida}
            onChangeText={setHoraSalida}
          />
          <TextInput
            style={styles.input}
            placeholder="Hora de llegada (HH:MM)"
            value={horaLlegada}
            onChangeText={setHoraLlegada}
          />
          <TextInput
            style={styles.input}
            placeholder="ID del vehículo"
            value={vehiculo}
            onChangeText={setVehiculo}
          />
        </View>

        {/* Botón Crear Viaje */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCrearViaje}
          disabled={isLoadingRoute || isLoadingViaje}
        >
          {isLoadingRoute || isLoadingViaje ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>Crear Viaje</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioButton: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: "#e6f3ff",
    borderColor: "#007AFF",
  },
  radioText: {
    fontSize: 14,
  },
  mapContainer: {
    height: 300,
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1000,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreateTrip;