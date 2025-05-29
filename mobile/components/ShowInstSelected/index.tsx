import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

interface ShowInstitutionProps {
  name: string;
  address: string;
  logo: any;
  onRequest?: () => void;
}

export default function ShowInstitution({
  name,
  address,
  logo,
  onRequest,
}: ShowInstitutionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.address}>{address}</Text>
      <TouchableOpacity style={styles.button} onPress={onRequest}>
        <Text style={styles.buttonText}>Solicitar ingreso</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    borderWidth: 6,
    borderColor: "#B84CF6",
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  address: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#B84CF6",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
