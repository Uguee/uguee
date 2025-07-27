import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import ReturnButton from "../components/ReturnButton";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Ionicons } from "@expo/vector-icons";
import { getPassengersByTripId, endTrip } from "../services/tripServices";
import { useAuth } from "../hooks/useAuth";
import { getRouteById } from "../services/routeService";
import { getCedulaByUUID } from "../services/userDataService";
import { formatPlaceName } from "../lib/formatPlaceName";

interface DriverTripActiveScreenProps {
  trip: any;
  onGoBack?: () => void;
  onEndTrip?: (trip: any) => void;
}

export default function DriverTripActiveScreen({
  trip,
  onGoBack = () => {},
  onEndTrip = () => {},
}: DriverTripActiveScreenProps) {
  const { user } = useAuth();
  const [routeData, setRouteData] = useState<any>(null);
  const [loadingRouteData, setLoadingRouteData] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [conductorName, setConductorName] = useState<string>("Conductor");
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(true);
  const [errorPassengers, setErrorPassengers] = useState<string | null>(null);

  // Obtener datos completos de la ruta al montar
  useEffect(() => {
    const fetchRouteData = async () => {
      if (!trip?.id_ruta) {
        setLoadingRouteData(false);
        return;
      }
      setLoadingRouteData(true);
      try {
        const response = await getRouteById(Number(trip.id_ruta), 1);
        if (response.success) {
          setRouteData(response.data);
        } else {
          setRouteData(null);
        }
      } catch (e) {
        setRouteData(null);
      } finally {
        setLoadingRouteData(false);
      }
    };
    fetchRouteData();
  }, [trip?.id_ruta]);

  // Obtener la ruta real usando Google Maps Directions API
  useEffect(() => {
    const getRouteCoordinates = async () => {
      if (
        !routeData?.punto_partida?.coordinates ||
        !routeData?.punto_llegada?.coordinates
      )
        return;
      setIsLoadingRoute(true);
      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        const [startLon, startLat] = routeData.punto_partida.coordinates;
        const [endLon, endLat] = routeData.punto_llegada.coordinates;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLon}&destination=${endLat},${endLon}&key=${apiKey}&mode=driving`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes[0] && data.routes[0].overview_polyline) {
          const points = data.routes[0].overview_polyline.points;
          const coords = decodePolyline(points);
          setRouteCoordinates(coords);
        } else {
          console.error(
            "[DriverTripActiveScreen] No route found in response:",
            data
          );
        }
      } catch (error) {
        console.error(
          "[DriverTripActiveScreen] Error al obtener la ruta:",
          error
        );
      } finally {
        setIsLoadingRoute(false);
      }
    };
    getRouteCoordinates();
  }, [routeData]);

  // Obtener pasajeros reales del viaje
  useEffect(() => {
    const fetchPassengers = async () => {
      setLoadingPassengers(true);
      setErrorPassengers(null);
      try {
        if (trip?.id_viaje) {
          const data = await getPassengersByTripId(Number(trip.id_viaje));
          const formatted = (data || []).map((p: any) => ({
            id: p.id_usuario,
            name: `${p.nombre || ""} ${p.apellido || ""}`.trim(),
          }));
          setPassengers(formatted);
        } else {
          setPassengers([]);
        }
      } catch (e: any) {
        setErrorPassengers(e.message || "Error al cargar pasajeros");
        setPassengers([]);
      } finally {
        setLoadingPassengers(false);
      }
    };
    fetchPassengers();
  }, [trip?.id_viaje]);

  // Obtener nombre del conductor al montar
  useEffect(() => {
    if (trip?.conductor_nombre) {
      setConductorName(trip.conductor_nombre);
    } else if (user?.firstName || user?.lastName) {
      setConductorName(
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
      );
    } else {
      setConductorName("Conductor");
    }
  }, [trip?.conductor_nombre, user?.firstName, user?.lastName]);

  // Función para decodificar la polyline de Google Maps
  const decodePolyline = (encoded: string) => {
    const poly = [];
    let index = 0;
    let len = encoded.length;
    let lat = 0;
    let lng = 0;
    while (index < len) {
      let shift = 0;
      let result = 0;
      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (index < len && encoded.charCodeAt(index - 1) >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (index < len && encoded.charCodeAt(index - 1) >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return poly;
  };

  const handleEndTrip = async () => {
    try {
      if (!trip?.id_viaje || !user?.id)
        throw new Error("Faltan datos del viaje o usuario");
      const id_conductor = await getCedulaByUUID(user.id);
      if (!id_conductor)
        throw new Error("No se pudo obtener el id del conductor");
      await endTrip(Number(trip.id_viaje), Number(id_conductor));
      // Solo navega a la lista de viajes, sin mostrar modal ni lógica extra
      if (onEndTrip) onEndTrip(trip);
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo finalizar el viaje");
    }
  };

  if (
    loadingRouteData ||
    !routeData?.punto_partida?.coordinates ||
    !routeData?.punto_llegada?.coordinates
  ) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={{ marginTop: 12, color: "#666" }}>Cargando mapa...</Text>
      </View>
    );
  }

  // Extraer coordenadas para usar en el mapa
  const [startLon, startLat] = routeData.punto_partida.coordinates;
  const [endLon, endLat] = routeData.punto_llegada.coordinates;
  const driverName = conductorName;
  const driverRole = "Conductor";
  const getInitial = (name?: string) =>
    name && name.length > 0 ? name[0].toUpperCase() : "U";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ReturnButton onPress={onGoBack} />
      {/* Lugares */}
      <View style={styles.placesContainer}>
        <Text style={styles.placeBox}>
          {formatPlaceName(routeData.nombre_partida)}
        </Text>
        <Text style={styles.placeBox}>
          {formatPlaceName(routeData.nombre_llegada)}
        </Text>
      </View>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: startLat,
            longitude: startLon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {/* Marcadores de inicio y destino */}
          <Marker
            coordinate={{ latitude: startLat, longitude: startLon }}
            title="Recogida"
            pinColor="#8B5CF6"
          />
          <Marker
            coordinate={{ latitude: endLat, longitude: endLon }}
            title="Destino"
            pinColor="#FF4D4D"
          />
          {/* Marcador del "carrito" en la ubicación actual */}
          {location && (
            <Marker coordinate={location} title="Tú" pinColor="#222" />
          )}
          {/* Ruta */}
          <MapViewDirections
            origin={{ latitude: startLat, longitude: startLon }}
            destination={{ latitude: endLat, longitude: endLon }}
            apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
            strokeWidth={4}
            strokeColor="#A259FF"
          />
        </MapView>
        {isLoadingRoute && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A259FF" />
            <Text style={styles.loadingText}>Cargando ruta...</Text>
          </View>
        )}
      </View>
      {/* Card inferior */}
      <View style={styles.bottomCard}>
        <View style={styles.cardContent}>
          <View style={styles.rowTop}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{getInitial(driverName)}</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.nameText}>{driverName}</Text>
              <Text style={styles.roleText}>{driverRole}</Text>
            </View>
          </View>
          <View style={styles.rowMeeting}>
            <Ionicons
              name="location"
              size={32}
              color="#B84CF6"
              style={{ marginRight: 10 }}
            />
            <View>
              <Text style={styles.meetingLabel}>Destino:</Text>
              <Text style={styles.meetingPlace}>
                {formatPlaceName(routeData.nombre_llegada)}
              </Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            Al finalizar el viaje recuerda a tus pasajeros no dejar sus
            pertenencias
          </Text>
          <Text style={styles.meetingLabel}>Pasajeros:</Text>
          <View style={styles.passengerListContainer}>
            {loadingPassengers ? (
              <ActivityIndicator
                size="small"
                color="#A259FF"
                style={{ marginTop: 8 }}
              />
            ) : errorPassengers ? (
              <Text style={{ color: "#FF4D4D", marginTop: 8 }}>
                {errorPassengers}
              </Text>
            ) : passengers.length === 0 ? (
              <Text style={{ color: "#666", marginTop: 8 }}>
                No hay pasajeros registrados
              </Text>
            ) : (
              <ScrollView
                style={styles.passengerScroll}
                showsVerticalScrollIndicator={true}
              >
                {passengers.map((p) => (
                  <View key={p.id} style={styles.passengerRow}>
                    <Text style={styles.passengerName}>{p.name}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.startButton} onPress={handleEndTrip}>
            <Text style={styles.buttonText}>Terminar viaje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placesContainer: {
    marginTop: 60,
    alignItems: "center",
    gap: 12,
  },
  placeBox: {
    borderWidth: 2,
    borderColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#222",
    marginBottom: 4,
    backgroundColor: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: "90%",
  },
  mapContainer: {
    flex: 1,
    margin: 18,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  bottomCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: "stretch",
    height: 390,
    flexDirection: "column",
  },
  cardContent: {
    flex: 1,
    flexDirection: "column",
    minHeight: 0,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#A259FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  roleText: {
    color: "#B84CF6",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  rowMeeting: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  meetingLabel: {
    color: "#B84CF6",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 0,
  },
  meetingPlace: {
    color: "#B84CF6",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 0,
  },
  infoText: {
    color: "#444",
    fontSize: 14,
    marginVertical: 10,
    textAlign: "center",
  },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5E9FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  passengerName: {
    color: "#7C3AED",
    fontWeight: "bold",
    fontSize: 16,
  },
  passengerListContainer: {
    flex: 1,
    minHeight: 0,
    marginTop: 4,
    marginBottom: 0,
  },
  passengerScroll: {
    flex: 1,
    minHeight: 0,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 8,
    gap: 16,
  },
  startButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  loadingText: {
    marginTop: 10,
    color: "#A259FF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
