import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface Props {
  onPress: () => void;
  isLoading?: boolean;
}

export default function InstitutionRequestButton({
  onPress,
  isLoading = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <ActivityIndicator
            color="#fff"
            size="small"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.text}>Procesando...</Text>
        </>
      ) : (
        <Text style={styles.text}>Realizar registro</Text>
      )}
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
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
