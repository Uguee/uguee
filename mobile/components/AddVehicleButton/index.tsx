import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddVehicleButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Ionicons
        name="add-circle"
        size={28}
        color="#fff"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.text}>Añadir vehículo</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A259FF",
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: "center",
    marginTop: 18,
    marginHorizontal: 10,
    marginBottom: 24,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
