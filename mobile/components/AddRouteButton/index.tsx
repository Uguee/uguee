import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AddRouteButtonProps {
  onPress: () => void;
}

const AddRouteButton: React.FC<AddRouteButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Ionicons name="add" size={28} color="#fff" style={{ marginRight: 8 }} />
    <Text style={styles.text}>Crear una ruta</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A259FF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 86,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});

export default AddRouteButton;
