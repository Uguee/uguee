import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import ReturnButton from "../components/ReturnButton";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Passenger {
  id: number;
  name: string;
}

interface UserTripStartProps {
  trip: any;
  onGoBack: () => void;
  onScanQR: () => void;
}

export default function UserTripStartScreen({
  trip,
  onGoBack,
  onScanQR,
}: UserTripStartProps) {
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

  // Usa los datos de trip
  const pickupPlace =
    trip?.startingPoint || "Punto de recogida no especificado";
  const destinationPlace = trip?.destination || "Destino no especificado";
  const driverName = trip?.driver || "Conductor";
  const driverRole = "Conductor";
  const passengers = [
    { id: 1, name: "Patricia Gómez" },
    { id: 2, name: "Pedro" },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      // Aquí deberías usar tu servicio real de geocoding
      // Simulación:
      Promise.resolve([{ lat: 3.375, lng: -76.535 }]),
      Promise.resolve([{ lat: 3.39, lng: -76.54 }]),
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
            {location && (
              <Marker coordinate={location} title="Tú" pinColor="#222" />
            )}
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
          <TouchableOpacity style={styles.qrButton} onPress={onScanQR}>
            <Text style={styles.buttonText}>Escanear QR</Text>
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
    height: 350,
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
    marginTop: 8,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#B84CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  nameText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 16,
  },
  roleText: {
    color: "#444",
    fontSize: 14,
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
    marginTop: 0,
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
    marginTop: 2,
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
  qrButton: {
    flex: 1,
    backgroundColor: "#B84CF6",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
