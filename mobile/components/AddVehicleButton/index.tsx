import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddVehicleButton({
  onPress,
  disabled = false,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Ionicons
        name="add-circle"
        size={28}
        color={disabled ? "#ccc" : "#fff"}
        style={{ marginRight: 8 }}
      />
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        Añadir vehículo
      </Text>
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
  btnDisabled: {
    backgroundColor: "#eee",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  textDisabled: {
    color: "#aaa",
  },
});
