import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";

interface DriveQRScreenProps {
  qrValue: string;
  onGoBack: () => void;
}

export default function DriveQRScreen({
  qrValue,
  onGoBack,
}: DriveQRScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.qrBox}>
        <QRCode
          value={qrValue}
          size={180}
          backgroundColor="transparent"
          color="#fff"
        />
      </View>
      <Text style={styles.instruction}>
        Pídele a tus pasajeros, antes de subir al vehículo, escanear el QR,{" "}
        {"\n"}para poder participar en el viaje.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onGoBack}>
        <Text style={styles.buttonText}>Volver</Text>
        <Ionicons
          name="arrow-forward"
          size={22}
          color="#222"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B84CF6",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  qrBox: {
    backgroundColor: "transparent",
    borderRadius: 18,
    padding: 32,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  instruction: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    marginTop: 8,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignSelf: "center",
    marginTop: 8,
    elevation: 2,
  },
  buttonText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 18,
  },
});
