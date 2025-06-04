import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReturnButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="arrow-back" size={28} color="#B84CF6" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 85,
    left: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
});
