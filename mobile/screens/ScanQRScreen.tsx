import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import {
  CameraView,
  BarcodeScanningResult,
  useCameraPermissions,
} from "expo-camera";
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
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleBarCodeScanned = (scanResult: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    setIsScanning(false);

    const { type, data } = scanResult;

    // Validar que sea un código QR
    if (type === "qr") {
      console.log("QR escaneado:", data);
      onScan(data);
    } else {
      Alert.alert("Código no válido", "Por favor escanea un código QR válido", [
        {
          text: "OK",
          onPress: () => {
            setScanned(false);
            setIsScanning(true);
          },
        },
      ]);
    }
  };

  const startScanning = () => {
    setScanned(false);
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScanned(true);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ReturnButton onPress={onGoBack} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>
            Solicitando permisos de cámara...
          </Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ReturnButton onPress={onGoBack} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="camera" size={80} color="#fff" />
          <Text style={styles.errorText}>No se tiene acceso a la cámara</Text>
          <Text style={styles.errorSubtext}>
            Necesitas permitir el acceso a la cámara para escanear códigos QR
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Permitir Acceso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ReturnButton onPress={onGoBack} />
        </View>

        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Overlay con área de escaneo */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>

          <Text style={styles.scanText}>
            Coloca el código QR dentro del marco
          </Text>

          <TouchableOpacity style={styles.stopButton} onPress={stopScanning}>
            <Text style={styles.stopButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ReturnButton onPress={onGoBack} />
      </View>

      <View style={styles.centerContent}>
        {/* Icono de QR */}
        <View style={styles.qrIconContainer}>
          <Ionicons name="qr-code-outline" size={120} color="#fff" />
        </View>

        <Text style={styles.instructionText}>
          Para empezar tu viaje debes escanear el código QR proporcionado por el
          conductor
        </Text>

        {/* Botón para iniciar escaneo */}
        <TouchableOpacity style={styles.button} onPress={startScanning}>
          <Ionicons
            name="camera"
            size={24}
            color="#222"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Escanear QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A259FF",
  },
  header: {
    position: "absolute",
    top: 36,
    left: 16,
    zIndex: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  qrIconContainer: {
    width: 260,
    height: 260,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  instructionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
    width: "80%",
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "80%",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  errorSubtext: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.8,
    width: "80%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#fff",
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#fff",
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#fff",
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#fff",
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    width: "80%",
  },
  stopButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#fff",
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
