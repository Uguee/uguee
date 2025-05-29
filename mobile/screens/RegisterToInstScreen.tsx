import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import InstitutionRequestHeader from "../components/HeaderInstRequest";
import InstitutionRequestForm from "../components/FormInstRequest";
import InstitutionRequestButton from "../components/ButtonInstRequest";
import ReturnButton from "../components/ReturnButton";

export default function InstitutionRequestScreen({
  institutionName,
  onGoBack,
}: {
  institutionName: string;
  onGoBack: () => void;
}) {
  const [form, setForm] = useState({
    code: "",
    email: "",
    role: "",
    files: [] as string[],
  });

  const handlePickFiles = () => {
    // Aquí iría la lógica para seleccionar imágenes
    Alert.alert(
      "Adjuntar archivos",
      "Funcionalidad de adjuntar imágenes pendiente."
    );
  };

  const handleSubmit = () => {
    // Aquí iría la lógica para enviar la solicitud
    Alert.alert(
      "Registro enviado",
      "Tu solicitud ha sido enviada a la institución."
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ReturnButton onPress={onGoBack} />
      <ScrollView contentContainerStyle={styles.container}>
        <InstitutionRequestHeader institutionName={institutionName} />
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
