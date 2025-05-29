import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HeaderDrivRegistrer() {
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>Ugüee</Text>
      <Text style={styles.title}>Registro como conductor</Text>
      <Text style={styles.subtitle}>
        Conectate para viajar seguro y economico
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 24, marginTop: 24 },
  brand: {
    color: "#B84CF6",
    fontWeight: "bold",
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    textAlign: "center",
  },
  subtitle: { color: "#555", fontSize: 15, textAlign: "center", marginTop: 8 },
});
