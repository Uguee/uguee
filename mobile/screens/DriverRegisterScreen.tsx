import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import HeaderDrivRegistrer from "../components/HeaderDrivRegistrer";
import DriverRegisterForm from "../components/FormDrivRegister";
import InstitutionRequestButton from "../components/ButtonInstRequest";
import ReturnButton from "../components/ReturnButton";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../hooks/useAuth";
import { getCedulaByUUID } from "../services/userDataService";
import { useFirstInstitutionAccepted } from "../hooks/useFirstInstitutionAccepted";
import { updateDriverValidationStatus } from "../services/driverService";
import { DocumentService } from "../services/documentService";

interface Props {
  onGoBack: () => void;
}

export default function DriverRegisterScreen({ onGoBack }: Props) {
  const [form, setForm] = useState({
    licenseId: "",
    expeditionPlace: "",
    expeditionDate: "",
    expirationDate: "",
    files: [] as string[], // Aquí guardaremos las URIs de las imágenes
  });

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useAuth();
  const { idInstitucion, loading: loadingInst } = useFirstInstitutionAccepted();

  // Selección de imágenes usando expo-image-picker
  const handlePickFiles = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // Si selecciona una o dos imágenes, la primera es frontal, la segunda trasera
      const uris = result.assets.map((asset) => asset.uri);
      setFrontImage(uris[0]);
      setBackImage(uris[1] || null);
      setForm((prev) => ({
        ...prev,
        files: uris,
      }));
    }
  };

  const handleSubmit = async () => {
    console.log("🚀 Iniciando handleSubmit");

    if (!user?.id) {
      Alert.alert("Error", "No se pudo obtener el usuario autenticado.");
      return;
    }
    if (loadingInst) {
      Alert.alert("Espere", "Cargando información de la institución...");
      return;
    }
    if (!idInstitucion) {
      Alert.alert("Error", "No se encontró la institución aceptada.");
      return;
    }

    // Validaciones de formulario
    if (!frontImage) {
      Alert.alert(
        "Error",
        "Por favor selecciona una foto del frente de la licencia."
      );
      return;
    }
    if (!form.expeditionPlace.trim()) {
      Alert.alert("Error", "Por favor ingresa el lugar de expedición.");
      return;
    }
    if (!form.expeditionDate) {
      Alert.alert("Error", "Por favor ingresa la fecha de expedición.");
      return;
    }
    if (!form.expirationDate) {
      Alert.alert("Error", "Por favor ingresa la fecha de vencimiento.");
      return;
    }

    console.log("✅ Todas las validaciones pasaron, iniciando proceso...");
    setIsUploading(true);

    try {
      console.log("📍 Paso 1: Obteniendo cédula del usuario");
      // Obtener cédula real
      const id_usuario = await getCedulaByUUID(user.id);
      if (!id_usuario) {
        console.error("❌ No se pudo obtener id_usuario");
        Alert.alert(
          "Error",
          "No se pudo obtener el id_usuario real del usuario."
        );
        return;
      }
      console.log("✅ id_usuario obtenido:", id_usuario);

      console.log("📍 Paso 2: Actualizando estado de conductor");
      // 1. Actualizar estado de conductor
      const updateMsg = await updateDriverValidationStatus({
        id_usuario,
        id_institucion: idInstitucion,
      });
      console.log("✅ updateMsg:", updateMsg);

      if (updateMsg !== "Estado de validación actualizado a pendiente") {
        console.error("❌ Mensaje inesperado:", updateMsg);
        Alert.alert("Error", "No se pudo actualizar el estado del conductor.");
        return;
      }

      console.log("📍 Paso 3: Subiendo documento");
      // 2. Subir documento
      const result = await DocumentService.uploadDocument(
        frontImage,
        backImage,
        {
          id_usuario,
          tipo: "licencia",
          lugar_expedicion: form.expeditionPlace,
          fecha_expedicion: form.expeditionDate,
          fecha_vencimiento: form.expirationDate,
        }
      );
      console.log("📄 Resultado del documento:", result);

      if (result.success) {
        console.log("🎉 ¡Proceso completado exitosamente!");
        Alert.alert("Éxito", "Documento subido correctamente.", [
          {
            text: "OK",
            onPress: () => {
              console.log("👈 Ejecutando onGoBack...");
              onGoBack();
            },
          },
        ]);
      } else {
        console.error("❌ Error en el resultado:", result.error);
        Alert.alert("Error", result.error || "Error subiendo documento.");
      }
    } catch (error: any) {
      console.error("💥 Error en handleSubmit:", error);
      Alert.alert("Error", error.message || "Error subiendo documento.");
    } finally {
      console.log("🏁 Finalizando proceso, desactivando loading");
      setIsUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ReturnButton onPress={onGoBack} />
      <HeaderDrivRegistrer />
      <DriverRegisterForm
        value={form}
        onChange={setForm}
        onPickFiles={handlePickFiles}
      />
      <InstitutionRequestButton
        onPress={handleSubmit}
        isLoading={isUploading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
});
