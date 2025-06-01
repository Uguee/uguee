import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

// Coordenadas de Cali
const CALI_CENTER = {
  latitude: 3.4516,
  longitude: -76.532,
};

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

interface DriverRouteMapProps {
  style?: object;
  onRouteGenerated?: (
    origin: RoutePoint,
    destination: RoutePoint,
    route: [number, number][]
  ) => void;
  existingRoute?: any;
  mode?: "seleccionar" | "nueva";
  onMapPress?: (lat: number, lng: number, isLongPress: boolean) => void;
}

const DriverRouteMap: React.FC<DriverRouteMapProps> = ({
  style,
  onRouteGenerated,
  existingRoute,
  mode = "nueva",
  onMapPress,
}) => {
  const [origin, setOrigin] = useState<RoutePoint | null>(null);
  const [destination, setDestination] = useState<RoutePoint | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Efecto para manejar la ruta existente
  useEffect(() => {
    if (existingRoute && mode === "seleccionar") {
      console.log("Cargando ruta existente:", existingRoute);

      if (existingRoute.origen_coords && existingRoute.destino_coords) {
        setOrigin({
          lat: existingRoute.origen_coords.y,
          lng: existingRoute.origen_coords.x,
          label: "Origen",
        });

        setDestination({
          lat: existingRoute.destino_coords.y,
          lng: existingRoute.destino_coords.x,
          label: "Destino",
        });
      }

      if (existingRoute.trayecto_coords) {
        const routeCoords: [number, number][] =
          existingRoute.trayecto_coords.map((coord: any) => [coord.y, coord.x]);
        setRoute(routeCoords);

        // Ajustar el mapa a la ruta
        if (mapRef.current && routeCoords.length > 0) {
          mapRef.current.fitToCoordinates(
            routeCoords.map(([lat, lng]) => ({
              latitude: lat,
              longitude: lng,
            })),
            {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            }
          );
        }
      }
    } else if (mode === "nueva") {
      setOrigin(null);
      setDestination(null);
      setRoute(null);
    }
  }, [existingRoute, mode]);

  // Función para manejar presiones en el mapa
  const handleMapPress = useCallback(
    async (e: any) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const isLongPress = e.nativeEvent.action === "long-press";

      if (onMapPress) {
        onMapPress(latitude, longitude, isLongPress);
        return;
      }

      if (!origin) {
        const newOrigin: RoutePoint = {
          lat: latitude,
          lng: longitude,
          label: "Origen",
        };
        setOrigin(newOrigin);
        setDestination(null);
        setRoute(null);
      } else if (!destination) {
        const newDestination: RoutePoint = {
          lat: latitude,
          lng: longitude,
          label: "Destino",
        };
        setDestination(newDestination);
        await generateRoute(origin, newDestination);
      } else {
        const newOrigin: RoutePoint = {
          lat: latitude,
          lng: longitude,
          label: "Origen",
        };
        setOrigin(newOrigin);
        setDestination(null);
        setRoute(null);
      }
    },
    [origin, destination, onMapPress]
  );

  // Función para generar la ruta
  const generateRoute = async (start: RoutePoint, end: RoutePoint) => {
    setIsGeneratingRoute(true);
    try {
      const response = await fetch(
        https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        const routeCoords: [number, number][] = coordinates.map(
          (coord: number[]) => [coord[1], coord[0]]
        );

        setRoute(routeCoords);

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            routeCoords.map(([lat, lng]) => ({
              latitude: lat,
              longitude: lng,
            })),
            {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            }
          );
        }

        if (onRouteGenerated) {
          onRouteGenerated(start, end, routeCoords);
        }
      }
    } catch (error) {
      console.error("Error generando la ruta:", error);
      alert("Error al generar la ruta. Inténtalo de nuevo.");
    } finally {
      setIsGeneratingRoute(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Instrucciones */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {mode === "seleccionar" ? "📍 Ruta Existente" : "📍 Crear Ruta"}
        </Text>
        {mode === "seleccionar" && existingRoute && (
          <Text style={styles.instructionsText}>
            ✅ Mostrando ruta #{existingRoute.id_ruta}
          </Text>
        )}
        {mode === "nueva" && !origin && (
          <Text style={styles.instructionsText}>
            1. Mantén presionado para seleccionar el origen
          </Text>
        )}
        {mode === "nueva" && origin && !destination && (
          <Text style={styles.instructionsText}>
            2. Toca para seleccionar el destino
          </Text>
        )}
        {mode === "nueva" && origin && destination && !isGeneratingRoute && (
          <Text style={styles.instructionsText}>
            ✅ Ruta generada. Mantén presionado para reiniciar
          </Text>
        )}
        {isGeneratingRoute && (
          <Text style={styles.instructionsText}>🔄 Generando ruta...</Text>
        )}
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...CALI_CENTER,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
        onLongPress={handleMapPress}
      >
        {origin && (
          <Marker
            coordinate={{ latitude: origin.lat, longitude: origin.lng }}
            title={origin.label}
            description={`Lat: ${origin.lat.toFixed(
              6
            )}\nLng: ${origin.lng.toFixed(6)}`}
            pinColor="green"
          />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            title={destination.label}
            description={`Lat: ${destination.lat.toFixed(
              6
            )}\nLng: ${destination.lng.toFixed(6)}`}
            pinColor="red"
          />
        )}

        {route && (
          <Polyline
            coordinates={route.map(([lat, lng]) => ({
              latitude: lat,
              longitude: lng,
            }))}
            strokeColor={mode === "seleccionar" ? "#8B5CF6" : "blue"}
            strokeWidth={5}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 400,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  instructionsContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    maxWidth: 300,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 12,
    color: "#666",
  },
});

export default DriverRouteMap;