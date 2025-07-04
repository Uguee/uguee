import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

interface RouteMapProps {
  punto_partida?: {
    coordinates: [number, number];
  };
  punto_llegada?: {
    coordinates: [number, number];
  };
  trayecto?: {
    coordinates: [number, number][];
  };
}

const RouteMap: React.FC<RouteMapProps> = ({
  punto_partida,
  punto_llegada,
  trayecto,
}) => {
  if (!punto_partida || !punto_llegada) {
    return null;
  }

  const initialRegion = {
    latitude: punto_partida.coordinates[1],
    longitude: punto_partida.coordinates[0],
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
      >
        {/* Marcador de inicio */}
        <Marker
          coordinate={{
            latitude: punto_partida.coordinates[1],
            longitude: punto_partida.coordinates[0],
          }}
          pinColor="green"
        />
        {/* Marcador de fin */}
        <Marker
          coordinate={{
            latitude: punto_llegada.coordinates[1],
            longitude: punto_llegada.coordinates[0],
          }}
          pinColor="red"
        />
        {/* Línea de la ruta */}
        {trayecto && (
          <Polyline
            coordinates={trayecto.coordinates.map((coord) => ({
              latitude: coord[1],
              longitude: coord[0],
            }))}
            strokeColor="#B84CF6"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 12,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default RouteMap;
