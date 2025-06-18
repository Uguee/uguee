import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import ReturnButton from "../components/ReturnButton";
import { useAuth } from "../hooks/useAuth";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { getRouteById } from "../services/routeService";

interface DriverTripStartScreenProps {
  trip: any; // Todos los datos del viaje
  onGoBack?: () => void;
  onGoToQRScreen?: (qrValue: string) => void;
}

export default function DriverTripStartScreen({
  trip,
  onGoBack = () => {},
  onGoToQRScreen = () => {},
}: DriverTripStartScreenProps) {
  const { user } = useAuth();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState<any>(null);
  const [loadingRouteData, setLoadingRouteData] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQRData] = useState("");

  // Logs útiles para depuración
  console.log("[DriverTripStartScreen] Props trip:", trip);
  console.log("[DriverTripStartScreen] routeData:", routeData);
  if (routeData) {
    console.log(
      "[DriverTripStartScreen] punto_partida:",
      routeData.punto_partida
    );
    console.log(
      "[DriverTripStartScreen] punto_llegada:",
      routeData.punto_llegada
    );
    console.log("[DriverTripStartScreen] trayecto:", routeData.trayecto);
  }

  // Obtener datos completos de la ruta al montar
  useEffect(() => {
    const fetchRouteData = async () => {
      if (!trip?.id_ruta) {
        console.log("[DriverTripStartScreen] No hay id_ruta disponible");
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

        // Extraer coordenadas correctamente: [longitud, latitud]
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
            "[DriverTripStartScreen] No route found in response:",
            data
          );
        }
      } catch (error) {
        console.error(
          "[DriverTripStartScreen] Error al obtener la ruta:",
          error
        );
      } finally {
        setIsLoadingRoute(false);
      }
    };

    getRouteCoordinates();
  }, [routeData]);

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

  // Obtiene la ubicación en tiempo real
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 2 },
        (loc) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  // Centra el mapa en la ubicación actual al inicio
  useEffect(() => {
    if (
      mapRef.current &&
      location &&
      routeData?.punto_partida?.coordinates &&
      routeData?.punto_llegada?.coordinates
    ) {
      // Extraer coordenadas correctamente: [longitud, latitud]
      const [startLon, startLat] = routeData.punto_partida.coordinates;
      const [endLon, endLat] = routeData.punto_llegada.coordinates;

      // Calcular los límites del mapa para incluir todos los puntos
      const coordinates = [
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: startLat, longitude: startLon },
        { latitude: endLat, longitude: endLon },
      ];

      // Encontrar los límites
      const latitudes = coordinates.map((coord) => coord.latitude);
      const longitudes = coordinates.map((coord) => coord.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      // Añadir un poco de padding
      const latDelta = (maxLat - minLat) * 1.5;
      const lngDelta = (maxLng - minLng) * 1.5;

      // Centrar en la ubicación actual pero con zoom que muestre toda la ruta
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lngDelta, 0.01),
      });
    }
  }, [location, routeData]);

  // Actualizar la ubicación del mapa cuando cambia la ubicación del usuario
  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  // Avatar con inicial
  const getInitial = (name?: string) =>
    name && name.length > 0 ? name[0].toUpperCase() : "U";

  const generateQRData = () => {
    if (!trip?.id_viaje) {
      console.error("[DriverTripStartScreen] No hay id_viaje disponible");
      return;
    }

    // Solo incluimos el id_viaje en el QR
    const qrData = `TRIP:${trip.id_viaje}`;
    setQRData(qrData);
    setShowQRModal(true);
  };

  if (
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ReturnButton onPress={onGoBack} />
      {/* Lugares */}
      <View style={styles.placesContainer}>
        <Text style={styles.placeBox}>{routeData.nombre_partida}</Text>
        <Text style={styles.placeBox}>{routeData.nombre_llegada}</Text>
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
            onStart={() => setIsLoadingRoute(true)}
            onReady={() => setIsLoadingRoute(false)}
            onError={(error) => {
              console.error(
                "[DriverTripStartScreen] Error al dibujar la ruta:",
                error
              );
              setIsLoadingRoute(false);
            }}
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
        <View style={styles.rowTop}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {getInitial(user?.firstName)}
            </Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.nameText}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.roleText}>{user?.role || "Conductor"}</Text>
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
            <Text style={styles.meetingLabel}>Punto de encuentro:</Text>
            <Text style={styles.meetingPlace}>{routeData.nombre_partida}</Text>
          </View>
        </View>
        <Text style={styles.infoText}>
          Antes de iniciar, invita a los pasajeros a escanear el QR
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.qrButton} onPress={generateQRData}>
            <Ionicons name="qr-code-outline" size={24} color="#A259FF" />
            <Text style={styles.qrButtonText}>Generar QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.buttonText}>Iniciar viaje</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal del QR */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrModalTitle}>Código QR del Viaje</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={qrData}
                size={250}
                color="#000"
                backgroundColor="#fff"
              />
            </View>
            <Text style={styles.qrInstructions}>
              Escanea este código para confirmar tu llegada
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 18,
    gap: 16,
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5E9FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qrButtonText: {
    color: "#A259FF",
    marginLeft: 4,
    fontWeight: "500",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  qrModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
  },
  qrModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
  },
  qrInstructions: {
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: "#A259FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
