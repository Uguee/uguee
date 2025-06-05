import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import InstitutionRequestHeader from "../components/HeaderInstRequest";
import InstitutionRequestForm from "../components/FormInstRequest";
import InstitutionRequestButton from "../components/ButtonInstRequest";
import ReturnButton from "../components/ReturnButton";
import { sendRegisterToInstitutionApplication } from "../services/institutionService";
import { getCedulaByUUID } from "../services/userDataService";
import { useAuth } from "../hooks/useAuth";

interface Institution {
  id_institucion: number;
  nombre_oficial: string;
  logo: any;
  direccion?: string;
  colores?: string;
  [key: string]: any;
}

export default function RegisterToInstScreen({
  institution,
  onGoBack,
  onGoToHomeScreen,
}: {
  institution: Institution | null;
  onGoBack: () => void;
  onGoToHomeScreen: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    code: "",
    email: "",
    role: "",
    files: [] as string[],
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handlePickFiles = () => {
    // Aquí iría la lógica para seleccionar imágenes
    Alert.alert(
      "Adjuntar archivos",
      "Funcionalidad de adjuntar imágenes pendiente."
    );
  };

  const handleSubmit = async () => {
    if (!institution) {
      Alert.alert("Error", "No se ha seleccionado una institución.");
      return;
    }
    if (!form.code || !form.email || !form.address) {
      Alert.alert(
        "Campos requeridos",
        "Por favor completa todos los campos obligatorios."
      );
      return;
    }
    setLoading(true);
    try {
      if (!user?.id) {
        Alert.alert("Error", "No se pudo obtener el usuario autenticado.");
        setLoading(false);
        return;
      }
      const id_usuario = await getCedulaByUUID(user.id);
      if (!id_usuario) {
        Alert.alert(
          "Error",
          "No se pudo obtener el id_usuario real del usuario."
        );
        setLoading(false);
        return;
      }
      const bodyToSend = {
        id_usuario,
        id_institucion: institution.id_institucion,
        correo_institucional: form.email,
        codigo_institucional: Number(form.code),
        direccion_de_residencia: form.address,
        rol_institucional: form.role,
      };
      console.log("[RegisterToInstScreen] Body enviado:", bodyToSend);
      console.log(bodyToSend);
      const response = await sendRegisterToInstitutionApplication(bodyToSend);
      console.log("[RegisterToInstScreen] Respuesta edgefunction:", response);
      if (response.success) {
        Alert.alert(
          "Registro enviado",
          "Tu solicitud ha sido enviada a la institución."
        );
        onGoToHomeScreen();
      } else {
        Alert.alert(
          "No se pudo realizar el registro",
          response.message || "Ocurrió un error."
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo realizar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ReturnButton onPress={onGoBack} />
      <ScrollView contentContainerStyle={styles.container}>
        <InstitutionRequestHeader
          institutionName={`${institution?.nombre_oficial || ""} (ID: ${
            institution?.id_institucion || ""
          })`}
        />
        <InstitutionRequestForm
          value={form}
          onChange={setForm}
          onPickFiles={handlePickFiles}
        />
        <InstitutionRequestButton onPress={handleSubmit} />
      </ScrollView>
    </View>
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
