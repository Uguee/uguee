import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { DocumentService } from "../services/documentService";

interface DocumentVerificationScreenProps {
  onComplete: () => void;
  onBack: () => void;
  userId: number;
}

export default function DocumentVerificationScreen({
  onComplete,
  onBack,
  userId,
}: DocumentVerificationScreenProps) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Datos del formulario
  const [documentData, setDocumentData] = useState({
    tipo: "Cédula de Ciudadanía",
    lugar_expedicion: "",
    fecha_expedicion: "",
    fecha_vencimiento: "",
    numero: "",
  });

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permisos requeridos",
        "Necesitamos permisos de cámara y galería para continuar"
      );
      return false;
    }
    return true;
  };

  const showImagePicker = (isBackImage: boolean = false) => {
    Alert.alert("Seleccionar imagen", "Elige una opción", [
      { text: "Cámara", onPress: () => takePhoto(isBackImage) },
      { text: "Galería", onPress: () => pickImage(isBackImage) },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const takePhoto = async (isBackImage: boolean = false) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (isBackImage) {
        setBackImage(result.assets[0].uri);
      } else {
        setFrontImage(result.assets[0].uri);
      }
    }
  };

  const pickImage = async (isBackImage: boolean = false) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (isBackImage) {
        setBackImage(result.assets[0].uri);
      } else {
        setFrontImage(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!frontImage) {
      Alert.alert("Error", "Por favor toma una foto del frente del documento");
      return;
    }

    if (!documentData.lugar_expedicion.trim()) {
      Alert.alert("Error", "Por favor ingresa el lugar de expedición");
      return;
    }

    if (!documentData.fecha_expedicion) {
      Alert.alert("Error", "Por favor ingresa la fecha de expedición");
      return;
    }

    if (!documentData.fecha_vencimiento) {
      Alert.alert("Error", "Por favor ingresa la fecha de vencimiento");
      return;
    }

    if (!documentData.numero.trim()) {
      Alert.alert("Error", "Por favor ingresa el número de documento");
      return;
    }

    setIsUploading(true);

    try {
      const result = await DocumentService.uploadDocument(
        frontImage,
        backImage,
        {
          id_usuario: userId,
          tipo: documentData.tipo,
          lugar_expedicion: documentData.lugar_expedicion,
          fecha_expedicion: documentData.fecha_expedicion,
          fecha_vencimiento: documentData.fecha_vencimiento,
          numero: documentData.numero,
        }
      );

      if (result.success) {
        Alert.alert("Éxito", "Documento subido correctamente", [
          { text: "OK", onPress: onComplete },
        ]);
      } else {
        Alert.alert("Error", result.error || "Error subiendo documento");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error subiendo documento");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid =
    frontImage &&
    documentData.lugar_expedicion.trim() &&
    documentData.fecha_expedicion &&
    documentData.fecha_vencimiento &&
    documentData.numero.trim();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Validación de Documento</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Tipo de documento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Documento</Text>
          <View style={styles.documentTypeContainer}>
            <Text style={styles.documentType}>{documentData.tipo}</Text>
          </View>
        </View>

        {/* Imagen frontal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frente del Documento *</Text>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => showImagePicker(false)}
          >
            {frontImage ? (
              <Image source={{ uri: frontImage }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageIcon}>📄</Text>
                <Text style={styles.imagePlaceholderText}>
                  Toca para agregar foto del frente
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Imagen trasera */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Reverso del Documento (Opcional)
          </Text>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => showImagePicker(true)}
          >
            {backImage ? (
              <Image source={{ uri: backImage }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageIcon}>📄</Text>
                <Text style={styles.imagePlaceholderText}>
                  Toca para agregar foto del reverso
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Documento</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lugar de Expedición *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Bogotá D.C."
              value={documentData.lugar_expedicion}
              onChangeText={(text) =>
                setDocumentData({ ...documentData, lugar_expedicion: text })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Número de Documento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el número de documento"
              value={documentData.numero}
              onChangeText={(text) =>
                setDocumentData({ ...documentData, numero: text })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de Expedición *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={documentData.fecha_expedicion}
              onChangeText={(text) =>
                setDocumentData({ ...documentData, fecha_expedicion: text })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de Vencimiento *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={documentData.fecha_vencimiento}
              onChangeText={(text) =>
                setDocumentData({ ...documentData, fecha_vencimiento: text })
              }
            />
          </View>
        </View>

        {/* Botón de envío */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isFormValid && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Subir Documento</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 16,
  },
  backButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  documentTypeContainer: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 8,
  },
  documentType: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 12,
    height: 200,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  imageIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  submitButton: {
    backgroundColor: "#8B5CF6",
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
