import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline, MapPressEvent } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import Constants from "expo-constants";
import { useRouteManager } from "../hooks/useRouteManager";
import { useAuth } from "../hooks/useAuth";
import { getCedulaByUUID } from "../services/userDataService";

interface RegisterRouteScreenProps {
  onGoBack?: () => void;
}

export default function RegisterRouteScreen({
  onGoBack,
}: RegisterRouteScreenProps) {
  const [points, setPoints] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    saveRoute,
    createUserRouteRelation,
    isLoading: loading,
    error,
  } = useRouteManager();
  const { user } = useAuth();

  // Obtener ubicación actual
  const getLocation = async () => {
    try {
      const { status } = await (
        await import("expo-location")
      ).requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await (
        await import("expo-location")
      ).getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (e) {
      // Manejo simple de error
    }
  };

  // Manejar toques en el mapa
  const handleMapPress = (e: MapPressEvent) => {
    if (points.length >= 2) {
      setPoints([
        {
          latitude: e.nativeEvent.coordinate.latitude,
          longitude: e.nativeEvent.coordinate.longitude,
        },
      ]);
    } else {
      setPoints([
        ...points,
        {
          latitude: e.nativeEvent.coordinate.latitude,
          longitude: e.nativeEvent.coordinate.longitude,
        },
      ]);
    }
  };

  // Calcular distancia (haversine)
  function haversineDistance(coord1: any, coord2: any) {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  const distance =
    points.length === 2 ? haversineDistance(points[0], points[1]) : 0;

  // Guardar ruta usando useRouteManager
  const handleSaveRoute = async () => {
    if (points.length !== 2 || !currentLocation || !user?.id) return;
    try {
      const origin = {
        lat: points[0].latitude,
        lng: points[0].longitude,
        label: "Partida",
      };
      const destination = {
        lat: points[1].latitude,
        lng: points[1].longitude,
        label: "Llegada",
      };
      const path = points.map((p) => [p.latitude, p.longitude]) as [
        number,
        number
      ][];
      const driverId = await getCedulaByUUID(user.id);
      if (!driverId) throw new Error("No se pudo obtener el id_usuario");
      const routeData = await saveRoute({
        origin,
        destination,
        path,
        driverId,
      });
      if (routeData && routeData.id_ruta) {
        await createUserRouteRelation(driverId, routeData.id_ruta);
      }
      setSuccess(true);
      Alert.alert("Éxito", "Ruta registrada correctamente");
    } catch (e) {
      Alert.alert("Error", error || "No se pudo registrar la ruta");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (success) {
      Alert.alert("Éxito", "Ruta registrada correctamente");
    }
  }, [success]);

  return (
    <View style={{ flex: 1 }}>
      {currentLocation ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress as (e: MapPressEvent) => void}
        >
          <Marker
            coordinate={currentLocation}
            title="Tu ubicación"
            pinColor="blue"
          />
          {points.map((point, idx) => (
            <Marker
              key={idx}
              coordinate={point}
              title={idx === 0 ? "Partida" : "Llegada"}
              pinColor={idx === 0 ? "green" : "red"}
            />
          ))}
          {points.length === 2 && (
            <MapViewDirections
              origin={points[0]}
              destination={points[1]}
              apikey={
                Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
              }
              strokeWidth={4}
              strokeColor="#A259FF"
              onError={(e) => console.log("Directions error:", e)}
            />
          )}
        </MapView>
      ) : (
        <ActivityIndicator
          size="large"
          color="#A259FF"
          style={{ marginTop: 40 }}
        />
      )}
      <View style={styles.infoBox}>
        {onGoBack && (
          <Button title="Volver" onPress={onGoBack} color="#A259FF" />
        )}
        <Text style={styles.infoText}>
          {points.length === 0 &&
            "Toca el mapa para seleccionar el punto de partida."}
          {points.length === 1 &&
            "Toca el mapa para seleccionar el punto de llegada."}
          {points.length === 2 &&
            `Distancia: ${(distance / 1000).toFixed(2)} km`}
        </Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title={loading ? "Guardando..." : "Guardar ruta"}
          onPress={handleSaveRoute}
          disabled={points.length !== 2 || loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 32,
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  error: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
});
