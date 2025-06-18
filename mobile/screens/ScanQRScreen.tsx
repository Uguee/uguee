import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import ReturnButton from "../components/ReturnButton";

const { width, height } = Dimensions.get("window");

interface ScanQRScreenProps {
  onScan: (qrData?: string) => void;
  onGoBack?: () => void;
}

export default function ScanQRScreen({
  onScan,
  onGoBack = () => {},
}: ScanQRScreenProps) {
  // Elimino toda la lógica de permisos y escaneo de cámara

  // Render solo el diseño visual
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#A259FF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Botón de regreso */}
      <View style={{ position: "absolute", top: 36, left: 16, zIndex: 10 }}>
        <ReturnButton onPress={onGoBack} />
      </View>

      {/* Simulación de área de escaneo */}
      <View
        style={{
          width: 260,
          height: 260,
          borderRadius: 24,
          borderWidth: 4,
          borderColor: "#fff",
          backgroundColor: "rgba(255,255,255,0.08)",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <Ionicons name="qr-code-outline" size={120} color="#fff" />
      </View>
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          textAlign: "center",
          marginBottom: 40,
          width: "70%",
        }}
      >
        Para empezar tu viaje debes escanear el codigo QR proporcionado por el
        conductor
      </Text>
      {/* Botón cancelar (sin acción) */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: "80%",
          },
        ]}
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>Escanear</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#A259FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    width: "90%",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
