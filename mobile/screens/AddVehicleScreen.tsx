import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import VehicleForm from "../components/VehicleForm";
import AddVehicleButton from "../components/AddVehicleButton";
import { BottomNavigation } from "../components/BottomNavigationBar";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
<<<<<<< HEAD
=======
import { useAuth } from "../hooks/useAuth";
import { getCedulaByUUID } from "../services/userDataService";
import { sendRegisterForVehicle } from "../services/sendRegisterForVehicleService";
import { registrarDocumentoVehicular } from "../services/documentoVehicularService";
import * as ImagePicker from "expo-image-picker";
import { DocumentService } from "../services/documentService";
import { getPendingVehiclesByIdUsuario } from "../services/pendingVehiclesService";
>>>>>>> 527a472 (Working on routes)

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

  const handlePickFiles = (field: string) => {
    // Aquí iría la lógica para seleccionar imágenes
    Alert.alert(
      "Adjuntar archivos",
      `Funcionalidad de adjuntar imágenes para ${field} pendiente.`
    );
  };

<<<<<<< HEAD
  const handleSubmit = () => {
    Alert.alert("Vehículo añadido", "Tu vehículo ha sido registrado.");
=======
  const handleSubmit = async () => {
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
      return;
    }
    if (requierePlacaYFechas) {
      if (!form.placa.trim()) {
        Alert.alert(
          "Campos requeridos",
          "La placa es obligatoria para este tipo de vehículo."
        );
        return;
      }
      if (!/^[A-Za-z0-9]{6}$/.test(form.placa)) {
        Alert.alert(
          "Formato inválido",
          "La placa debe tener exactamente 6 caracteres alfanuméricos."
        );
        return;
      }
      if (!form.vigenciaSoat || !form.fechaTecno) {
        Alert.alert(
          "Campos requeridos",
          "SOAT y Tecnomecánica son obligatorios para este tipo de vehículo."
        );
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
        return;
      }
    }
    // Validar imágenes de tarjeta de propiedad/comprobante
    if (form.filesProp.length < 1) {
      Alert.alert(
        "Documento requerido",
        "Debes adjuntar al menos una imagen de la tarjeta de propiedad o comprobante."
      );
      return;
    }
    // Obtener id_usuario real
    if (!user?.id) {
      Alert.alert("Error", "No se pudo obtener el usuario autenticado.");
      return;
    }
    const id_usuario = await getCedulaByUUID(user.id);
    if (!id_usuario) {
      Alert.alert(
        "Error",
        "No se pudo obtener el id_usuario real del usuario."
      );
      return;
    }
    // Verificar cantidad de vehículos pendientes
    const cantidadPendientes = await getPendingVehiclesByIdUsuario(id_usuario);
    if (cantidadPendientes >= 3) {
      Alert.alert(
        "Límite alcanzado",
        "No se pueden añadir más vehículos porque hay 3 en estado pendiente. Debes esperar a que la institución los valide o los deniegue."
      );
      return;
    }
    // Construir el objeto para la petición
    const vehiculo: any = {
      id_usuario,
      tipo: tipoNum,
      color: form.color,
      modelo: Number(form.modelo),
    };
    if (requierePlacaYFechas) {
      vehiculo.placa = form.placa;
      vehiculo.vigencia_soat = form.vigenciaSoat;
      vehiculo.fecha_tecnicomecanica = form.fechaTecno;
    } else if (form.placa) {
      vehiculo.placa = form.placa;
    }
    try {
      // 1. Registrar el vehículo (esto genera la placa si es necesario)
      const result = await sendRegisterForVehicle(vehiculo);
      console.log("Respuesta de registro de vehículo:", result);
      if (!result.success) {
        Alert.alert("Error", result.error || "Error desconocido");
        return;
      }
      const placaFinal = result.data?.placa;
      console.log("Placa final para documentos:", placaFinal);
      if (!placaFinal) {
        Alert.alert(
          "Error",
          "No se pudo obtener la placa del vehículo para registrar los documentos."
        );
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
          if (upload.success && form.vigenciaSoat) {
            const res = await registrarDocumentoVehicular({
              placa_vehiculo: placaFinal,
              imagen: upload.url!,
              tipo: "SOAT",
              fecha_vencimiento: form.vigenciaSoat,
            });
            console.log("Respuesta documento_vehicular SOAT:", res);
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
          if (upload.success && form.fechaTecno) {
            const res = await registrarDocumentoVehicular({
              placa_vehiculo: placaFinal,
              imagen: upload.url!,
              tipo: "tecnomecanica",
              fecha_vencimiento: form.fechaTecno,
            });
            console.log("Respuesta documento_vehicular TECNO:", res);
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
          if (upload.success) {
            const res = await registrarDocumentoVehicular({
              placa_vehiculo: placaFinal,
              imagen: upload.url!,
              tipo: "tarjeta_propiedad",
              fecha_vencimiento: requierePlacaYFechas
                ? form.vigenciaSoat || form.fechaTecno
                : "2099-12-31", // Dummy para cumplir el campo
            });
            console.log("Respuesta documento_vehicular PROPIEDAD:", res);
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
    }
>>>>>>> 527a472 (Working on routes)
  };
  const navButtons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      onPress: onGoToHomeScreen,
    },
    {
      label: "Mis vehiculos",
      icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
      onPress: onGoToMyVehicles,
    },
    {
      label: "Mis viajes",
      icon: <Ionicons name="settings-outline" size={28} color="#000" />,
      onPress: () => alert("Mis viajes"),
    },
    {
      label: "Perfil",
      icon: <FontAwesome name="user-o" size={26} color="#000" />,
      onPress: onGoToProfile,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu />
      <ScrollView contentContainerStyle={styles.container}>
        <VehicleForm
          value={form}
          onChange={setForm}
          onPickFiles={handlePickFiles}
        />
        <AddVehicleButton onPress={handleSubmit} />
      </ScrollView>
      <BottomNavigation buttons={navButtons} />
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
