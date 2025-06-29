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
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { getRouteById } from "../services/routeService";
import { getUserDataByIdUsuario } from "../services/userDataService";

interface Passenger {
  id: number;
  name: string;
}

interface UserTripStartProps {
  trip: any;
  onGoBack: () => void;
  onStartTrip: () => void;
}

export default function UserTripStartScreen({
  trip,
  onGoBack,
  onStartTrip,
}: UserTripStartProps) {
  const { user } = useAuth();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<null | boolean>(
    null
  );
  const [routeData, setRouteData] = useState<any>(null);
  const [loadingRouteData, setLoadingRouteData] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [conductorName, setConductorName] = useState<string>("Conductor");
  const mapRef = useRef<MapView>(null);

  // Solicitar permiso de ubicación antes de mostrar el mapa
  useEffect(() => {
    setLocationPermission(null);
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationPermission(false);
        Alert.alert(
          "Permiso de ubicación requerido",
          "Debes conceder permiso de ubicación para ver el mapa y tu posición.",
          [
            {
              text: "OK",
              onPress: () => {},
            },
          ]
        );
        return;
      }
      setLocationPermission(true);
    })();
  }, []);

  // Solo iniciar seguimiento de ubicación si el permiso fue concedido
  useEffect(() => {
    if (locationPermission !== true) return;
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
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
  }, [locationPermission]);

  // Obtener nombre del conductor al montar
  useEffect(() => {
    const fetchConductorName = async () => {
      if (trip?.id_conductor) {
        const data = await getUserDataByIdUsuario(Number(trip.id_conductor));
        if (data && data.nombre && data.apellido) {
          setConductorName(`${data.nombre} ${data.apellido}`);
        } else {
          setConductorName("Conductor");
        }
      } else {
        setConductorName("Conductor");
      }
    };
    fetchConductorName();
  }, [trip?.id_conductor]);

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
            "[UserTripStartScreen] No route found in response:",
            data
          );
        }
      } catch (error) {
        console.error("[UserTripStartScreen] Error al obtener la ruta:", error);
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

  if (locationPermission === null || loadingRouteData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={{ marginTop: 12, color: "#666" }}>Cargando mapa...</Text>
      </View>
    );
  }
  if (locationPermission === false) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ color: "#A259FF", fontSize: 18, textAlign: "center" }}>
          Debes conceder permiso de ubicación para ver el mapa y tu posición.
        </Text>
      </View>
    );
  }
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
        <Text style={{ marginTop: 12, color: "#666" }}>
          Cargando datos de la ruta...
        </Text>
      </View>
    );
  }

  // Extraer coordenadas para usar en el mapa
  const [startLon, startLat] = routeData.punto_partida.coordinates;
  const [endLon, endLat] = routeData.punto_llegada.coordinates;
  const pickupPlace = routeData.nombre_partida || "Punto de recogida";
  const destinationPlace = routeData.nombre_llegada || "Destino";
  const driverName = conductorName;
  const driverRole = "Conductor";
  const passengers = [
    { id: 1, name: "Patricia Gómez" },
    { id: 2, name: "Pedro" },
  ];

  const getInitial = (name?: string) =>
    name && name.length > 0 ? name[0].toUpperCase() : "U";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ReturnButton onPress={onGoBack} />
      {/* Lugares */}
      <View style={styles.placesContainer}>
        <Text style={styles.placeBox}>{pickupPlace}</Text>
        <Text style={styles.placeBox}>{destinationPlace}</Text>
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
                "[UserTripStartScreen] Error al dibujar la ruta:",
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
              <Text style={styles.meetingLabel}>Punto de encuentro:</Text>
              <Text style={styles.meetingPlace}>{pickupPlace}</Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            Antes de iniciar, escanea el qr proporcionado por el conductor
          </Text>
          <Text style={styles.meetingLabel}>Pasajeros:</Text>
          <View style={styles.passengerListContainer}>
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
          </View>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.startButton} onPress={onStartTrip}>
            <Text style={styles.buttonText}>Iniciar viaje</Text>
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
    justifyContent: "space-between",
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
