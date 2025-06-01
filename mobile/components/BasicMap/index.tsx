import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Coordenadas de Cali (como punto inicial)
const CALI_CENTER = {
  latitude: 3.4516,
  longitude: -76.532,
};

interface BasicMapProps {
  style?: object;
}

const BasicMap: React.FC<BasicMapProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...CALI_CENTER,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={CALI_CENTER}
          title="Centro de Cali"
          description="📍 Centro de Cali"
        />
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
});

export default BasicMap;
