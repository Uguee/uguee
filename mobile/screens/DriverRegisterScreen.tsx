import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import HeaderDrivRegistrer from "../components/HeaderDrivRegistrer";
import DriverRegisterForm from "../components/FormDrivRegister";
import InstitutionRequestButton from "../components/ButtonInstRequest";
import ReturnButton from "../components/ReturnButton";

interface Props {
  onGoBack: () => void;
}

export default function DriverRegisterScreen({ onGoBack }: Props) {
  const [form, setForm] = useState({
    licenseId: "",
    expeditionPlace: "",
    expeditionDate: "",
    expirationDate: "",
    files: [] as string[],
  });

  const handlePickFiles = () => {
    Alert.alert(
      "Adjuntar archivos",
      "Funcionalidad de adjuntar imágenes pendiente."
    );
  };

  const handleSubmit = () => {
    Alert.alert(
      "Registro enviado",
      "Tu registro como conductor ha sido enviado."
    );
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
