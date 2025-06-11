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

    setIsUploading(true);

    try {
      // Obtener cédula real
      const id_usuario = await getCedulaByUUID(user.id);
      if (!id_usuario) {
        Alert.alert(
          "Error",
          "No se pudo obtener el id_usuario real del usuario."
        );
        setIsUploading(false);
        return;
      }

      // 1. Actualizar estado de conductor
      const updateMsg = await updateDriverValidationStatus({
        id_usuario,
        id_institucion: idInstitucion,
      });

      if (updateMsg !== "Estado de validación actualizado a pendiente") {
        Alert.alert("Error", "No se pudo actualizar el estado del conductor.");
        setIsUploading(false);
        return;
      }

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

      if (result.success) {
        Alert.alert("Éxito", "Documento subido correctamente.");
        onGoBack();
      } else {
        Alert.alert("Error", result.error || "Error subiendo documento.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error subiendo documento.");
    } finally {
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
      <InstitutionRequestButton onPress={handleSubmit} />
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
