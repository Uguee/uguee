import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ReturnButton from "../components/ReturnButton";
import { useAuth } from "../hooks/useAuth";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { GeocodingService } from "../services/geocodingService";
import { Ionicons } from "@expo/vector-icons";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface DriverTripStartScreenProps {
  pickupPlace: string;
  destinationPlace: string;
  onGoBack?: () => void;
  onGoToQRScreen?: (qrValue: string) => void;
}

export default function DriverTripStartScreen({
  pickupPlace,
  destinationPlace,
  onGoBack = () => {},
  onGoToQRScreen = () => {},
}: DriverTripStartScreenProps) {
  const { user } = useAuth();
  const [pickupCoords, setPickupCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [destCoords, setDestCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  // Geocodifica los lugares
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      GeocodingService.searchAddress(pickupPlace),
      GeocodingService.searchAddress(destinationPlace),
    ]).then(([pickupArr, destArr]) => {
      if (isMounted) {
        const pickup = pickupArr[0];
        const dest = destArr[0];
        setPickupCoords(
          pickup ? { latitude: pickup.lat, longitude: pickup.lng } : null
        );
        setDestCoords(
          dest ? { latitude: dest.lat, longitude: dest.lng } : null
        );
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [pickupPlace, destinationPlace]);

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
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  // Avatar con inicial (igual que ProfileScreen)
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
        {loading || !pickupCoords || !destCoords ? (
          <ActivityIndicator
            size="large"
            color="#A259FF"
            style={{ marginTop: 40 }}
          />
        ) : (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: pickupCoords.latitude,
              longitude: pickupCoords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            {/* Marcadores de inicio y destino */}
            <Marker
              coordinate={pickupCoords}
              title="Recogida"
              pinColor="#8B5CF6"
            />
            <Marker
              coordinate={destCoords}
              title="Destino"
              pinColor="#FF4D4D"
            />
            {/* Marcador del "carrito" en la ubicación actual */}
            {location && (
              <Marker coordinate={location} title="Tú" pinColor="#222" />
            )}
            {/* Ruta */}
            <MapViewDirections
              origin={pickupCoords}
              destination={destCoords}
              apikey={GOOGLE_MAPS_API_KEY || ""}
              strokeWidth={4}
              strokeColor="#A259FF"
              optimizeWaypoints={true}
              onError={(e) => console.log("Directions error:", e)}
            />
          </MapView>
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
            <Text style={styles.meetingPlace}>{pickupPlace}</Text>
          </View>
        </View>
        <Text style={styles.infoText}>
          Antes de iniciar, invita a los pasajeros a escanear el QR
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => onGoToQRScreen("TRIP-QR-PLACEHOLDER")}
          >
            <Text style={styles.buttonText}>Generar QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startButton}>
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
    fontSize: 18,
    color: "#222",
    marginBottom: 4,
    backgroundColor: "#fff",
    fontWeight: "bold",
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
    flex: 1,
    backgroundColor: "#B84CF6",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 8,
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
});
