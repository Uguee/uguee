import React, { useEffect } from "react";
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
import { useRegisterRoute } from "../hooks/useRegisterRoute";

interface RegisterRouteScreenProps {
  onGoBack?: () => void;
}

export default function RegisterRouteScreen({
  onGoBack,
}: RegisterRouteScreenProps) {
  const {
    points,
    currentLocation,
    getLocation,
    handleMapPress,
    distance,
    saveRoute,
    loading,
    error,
    success,
  } = useRegisterRoute();

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
                Constants.expoConfig.extra.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
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
          onPress={saveRoute}
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
    bottom: 0,
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
