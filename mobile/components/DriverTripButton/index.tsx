import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DriverTripButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="star" size={24} color="#A259FF" />
      </View>
      <Text style={styles.text}>Crear viaje</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A259FF",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignSelf: "flex-start",
    margin: 8,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // Sombra para Android
    elevation: 3,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  text: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
