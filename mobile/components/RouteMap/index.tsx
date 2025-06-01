import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RouteMapProps {
  origin: Location | null;
  destination: Location | null;
  route: [number, number][] | null;
  onCurrentLocationChange?: (location: Location) => void;
  onRouteGenerated?: (
    origin: Location,
    destination: Location,
    route: [number, number][]
  ) => void;
  onMapPress?: (lat: number, lng: number) => void;
  allowClickToSetPoints?: boolean;
}

export function RouteMap({
  origin,
  destination,
  route,
  onCurrentLocationChange,
  onRouteGenerated,
  onMapPress,
  allowClickToSetPoints = false,
}: RouteMapProps) {
  const mapRef = useRef<MapView>(null);

  // Función para ajustar el mapa a los límites de la ruta
  const fitMapToRoute = () => {
    if (!mapRef.current || (!origin && !destination && !route)) return;

    const points: { latitude: number; longitude: number }[] = [];

    if (origin) {
      points.push({ latitude: origin.lat, longitude: origin.lng });
    }
    if (destination) {
      points.push({ latitude: destination.lat, longitude: destination.lng });
    }
    if (route) {
      route.forEach(([lat, lng]) => {
        points.push({ latitude: lat, longitude: lng });
      });
    }

    if (points.length > 0) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  useEffect(() => {
    fitMapToRoute();
  }, [origin, destination, route]);

  // Función para generar la ruta usando OSRM
  const generateRoute = async (start: Location, end: Location) => {
    try {
      const response = await fetch(
        https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        // Convertir de [lng, lat] a [lat, lng]
        const routeCoords: [number, number][] = coordinates.map(
          (coord: number[]) => [coord[1], coord[0]]
        );

        if (onRouteGenerated) {
          onRouteGenerated(start, end, routeCoords);
        }
      }
    } catch (error) {
      console.error("Error generando la ruta:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: origin?.lat || 3.4516,
          longitude: origin?.lng || -76.532,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={(e) => {
          if (allowClickToSetPoints && onMapPress) {
            onMapPress(
              e.nativeEvent.coordinate.latitude,
              e.nativeEvent.coordinate.longitude
            );
          }
        }}
      >
        {origin && (
          <Marker
            coordinate={{ latitude: origin.lat, longitude: origin.lng }}
            title="Origen"
            description={origin.address}
            pinColor="green"
          />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            title="Destino"
            description={destination.address}
            pinColor="red"
          />
        )}

        {route && (
          <Polyline
            coordinates={route.map(([lat, lng]) => ({
              latitude: lat,
              longitude: lng,
            }))}
            strokeColor="#8B5CF6"
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}

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
});