import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import VehicleForm from "../components/VehicleForm";
import AddVehicleButton from "../components/AddVehicleButton";
import { DriverHomeBottomMenu } from "../components/DriverHomeBottomMenu";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { getCedulaByUUID } from "../services/userDataService";
import { sendRegisterForVehicle } from "../services/sendRegisterForVehicleService";
import { registrarDocumentoVehicular } from "../services/documentoVehicularService";
import * as ImagePicker from "expo-image-picker";
import { DocumentService } from "../services/documentService";
import { getPendingVehiclesByIdUsuario } from "../services/pendingVehiclesService";
import { supabase } from "../lib/supabase";
import { AuthService, getCurrentToken } from "../services/authService";

interface AddVehicleScreenProps {
  onGoToMyVehicles?: () => void;
  onGoToHomeScreen?: () => void;
  onGoToProfile?: () => void;
}

export default function AddVehicleScreen({
  onGoToMyVehicles = () => {},
  onGoToHomeScreen = () => {},
  onGoToProfile = () => {},
}: AddVehicleScreenProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<{
    placa: string;
    color: string;
    modelo: string;
    tipo: string;
    vigenciaSoat: string;
    fechaTecno: string;
    filesSoat: string[];
    filesTecno: string[];
    filesProp: string[];
  }>({
    placa: "",
    color: "",
    modelo: "",
    tipo: "",
    vigenciaSoat: "",
    fechaTecno: "",
    filesSoat: [],
    filesTecno: [],
    filesProp: [],
  });
  const [loading, setLoading] = useState(false);

  const handlePickFiles = async (field: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: field === "filesProp" ? 2 : 2,
    });
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri).slice(0, 2);
      setForm((prev) => ({ ...prev, [field]: uris }));
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    const tipoNum = Number(form.tipo);
    const esBicicleta = tipoNum === 3;
    const esMonopatin = tipoNum === 6;
    const requierePlacaYFechas = !esBicicleta && !esMonopatin;

    // Validaciones generales
    if (!form.color.trim() || !form.modelo.trim() || !form.tipo.trim()) {
      Alert.alert(
        "Campos requeridos",
        "Completa todos los campos obligatorios."
      );
      setLoading(false);
      return;
    }
    if (requierePlacaYFechas) {
      if (!form.placa.trim()) {
        Alert.alert(
          "Campos requeridos",
          "La placa es obligatoria para este tipo de vehículo."
        );
        setLoading(false);
        return;
      }
      if (!/^[A-Za-z0-9]{6}$/.test(form.placa)) {
        Alert.alert(
          "Formato inválido",
          "La placa debe tener exactamente 6 caracteres alfanuméricos."
        );
        setLoading(false);
        return;
      }
      if (!form.vigenciaSoat || !form.fechaTecno) {
        Alert.alert(
          "Campos requeridos",
          "SOAT y Tecnomecánica son obligatorios para este tipo de vehículo."
        );
        setLoading(false);
        return;
      }
      // Validar fechas formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (
        !dateRegex.test(form.vigenciaSoat) ||
        !dateRegex.test(form.fechaTecno)
      ) {
        Alert.alert(
          "Formato inválido",
          "Las fechas deben tener formato YYYY-MM-DD."
        );
        setLoading(false);
        return;
      }
    }
    // Validar imágenes de tarjeta de propiedad/comprobante
    if (form.filesProp.length < 1) {
      Alert.alert(
        "Documento requerido",
        esBicicleta || esMonopatin
          ? "Debes adjuntar al menos una imagen del comprobante de pago o tarjeta de propiedad."
          : "Debes adjuntar al menos una imagen de la tarjeta de propiedad."
      );
      setLoading(false);
      return;
    }
    // Obtener id_usuario real
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
    // Verificar cantidad de vehículos pendientes
    const cantidadPendientes = await getPendingVehiclesByIdUsuario(id_usuario);
    if (cantidadPendientes >= 3) {
      Alert.alert(
        "Límite alcanzado",
        "No se pueden añadir más vehículos porque hay 3 en estado pendiente. Debes esperar a que la institución los valide o los deniegue."
      );
      setLoading(false);
      return;
    }
    // Construir el objeto para la petición
    let vehiculo: any = {
      id_usuario,
      tipo: tipoNum,
      color: form.color,
      modelo: Number(form.modelo),
    };
    if (requierePlacaYFechas) {
      vehiculo.placa = form.placa;
      vehiculo.vigencia_soat = form.vigenciaSoat;
      vehiculo.fecha_tecnicomecanica = form.fechaTecno;
    }
    // Para bici/monopatín, no enviar placa ni fechas, solo los campos obligatorios
    try {
      // Obtener el token de sesión actual desde AuthService
      const token = getCurrentToken();
      if (!token) {
        Alert.alert("Error", "No se pudo obtener el token de sesión");
        setLoading(false);
        return;
      }
      console.log("Token actual:", token);
      const result = await sendRegisterForVehicle(vehiculo, token);
      if (!result.success) {
        Alert.alert("Error", result.error || "Error desconocido");
        setLoading(false);
        return;
      }
      const placaFinal = result.data?.placa;
      if (!placaFinal) {
        Alert.alert(
          "Error",
          "No se pudo obtener la placa del vehículo para registrar los documentos."
        );
        setLoading(false);
        return;
      }
      // 2. Subir imágenes y registrar documentos vehiculares
      // SOAT
      if (form.filesSoat && form.filesSoat.length > 0 && requierePlacaYFechas) {
        for (const uri of form.filesSoat) {
          const upload = await DocumentService.uploadImage(
            uri,
            `soat_${placaFinal}`,
            id_usuario
          );
          if (
            upload.success &&
            form.vigenciaSoat &&
            typeof upload.url === "string"
          ) {
            const res = await registrarDocumentoVehicular({
              placa_vehiculo: placaFinal,
              imagen: upload.url,
              tipo: "SOAT",
              fecha_vencimiento: form.vigenciaSoat,
            });
            if (!res.success) {
              Alert.alert(
                "Error documento_vehicular SOAT",
                res.error || "Error desconocido"
              );
            }
          }
        }
      }
      // Tecnomecánica
      if (
        form.filesTecno &&
        form.filesTecno.length > 0 &&
        requierePlacaYFechas
      ) {
        for (const uri of form.filesTecno) {
          const upload = await DocumentService.uploadImage(
            uri,
            `tecno_${placaFinal}`,
            id_usuario
          );
          if (
            upload.success &&
            form.fechaTecno &&
            typeof upload.url === "string"
          ) {
            const res = await registrarDocumentoVehicular({
              placa_vehiculo: placaFinal,
              imagen: upload.url,
              tipo: "tecnomecanica",
              fecha_vencimiento: form.fechaTecno,
            });
            if (!res.success) {
              Alert.alert(
                "Error documento_vehicular TECNO",
                res.error || "Error desconocido"
              );
            }
          }
        }
      }
      // Tarjeta de propiedad o comprobante
      if (form.filesProp && form.filesProp.length > 0) {
        for (const uri of form.filesProp) {
          const upload = await DocumentService.uploadImage(
            uri,
            `prop_${placaFinal}`,
            id_usuario
          );
          if (upload.success && typeof upload.url === "string") {
            const res = await registrarDocumentoVehicular({
              placa_vehiculo: placaFinal,
              imagen: upload.url,
              tipo: "tarjeta_propiedad",
              fecha_vencimiento: requierePlacaYFechas
                ? form.vigenciaSoat || form.fechaTecno
                : "2099-12-31", // Dummy para cumplir el campo
            });
            if (!res.success) {
              Alert.alert(
                "Error documento_vehicular PROPIEDAD",
                res.error || "Error desconocido"
              );
            }
          }
        }
      }
      Alert.alert("Éxito", "Vehículo y documentos registrados con éxito.");
      setForm({
        placa: "",
        color: "",
        modelo: "",
        tipo: "",
        vigenciaSoat: "",
        fechaTecno: "",
        filesSoat: [],
        filesTecno: [],
        filesProp: [],
      });
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu />
      <ScrollView contentContainerStyle={styles.container}>
        <VehicleForm
          value={form}
          onChange={setForm}
          onPickFiles={handlePickFiles}
        />
        <AddVehicleButton onPress={handleSubmit} disabled={loading} />
      </ScrollView>
      <DriverHomeBottomMenu
        onGoToProfile={onGoToProfile}
        onGoToHome={onGoToHomeScreen}
        onGoToMyVehicles={onGoToMyVehicles}
        onGoToMyTrips={() => {}}
        activeButton="vehicles"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 120, // para que el botón no tape el contenido
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "flex-start",
  },
});
