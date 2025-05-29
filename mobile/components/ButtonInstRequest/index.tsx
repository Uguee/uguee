import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function InstitutionRequestButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>Realizar registro</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#B84CF6",
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 18,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
