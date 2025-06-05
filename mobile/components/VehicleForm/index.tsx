import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const tipos = [
  { label: "Automóvil", value: 1 },
  { label: "Motocicleta", value: 2 },
  { label: "Bicicleta", value: 3 },
  { label: "Camioneta", value: 4 },
  { label: "Van", value: 5 },
  { label: "Monopatín", value: 6 },
  { label: "Bus", value: 7 },
];

interface VehicleFormProps {
  value: {
    placa: string;
    color: string;
    modelo: string;
    tipo: string;
    vigenciaSoat: string;
    fechaTecno: string;
    filesSoat: string[];
    filesTecno: string[];
    filesProp: string[];
  };
  onChange: (data: VehicleFormProps["value"]) => void;
  onPickFiles: (field: string) => void;
}

export default function VehicleForm({
  value,
  onChange,
  onPickFiles,
}: VehicleFormProps) {
  const [showTipo, setShowTipo] = useState(false);
  const [showDate, setShowDate] = useState({ field: "", visible: false });
  const [showHelp, setShowHelp] = useState(false);

  const tipoNum = Number(value.tipo);
  const esBicicleta = tipoNum === 3;
  const esMonopatin = tipoNum === 6;
  const requierePlacaYFechas = !esBicicleta && !esMonopatin;
  const maxSoatTecno = 2;
  const maxProp = 2;

  const handleDateChange = (
    field: string,
    event: any,
    date?: Date | undefined
  ) => {
    setShowDate({ field: "", visible: false });
    if (date) {
      onChange({ ...value, [field]: date.toISOString().split("T")[0] });
    }
  };

  return (
    <View>
      {/* Botón de ayuda arriba a la derecha */}
      <TouchableOpacity
        style={styles.helpBtn}
        onPress={() => setShowHelp(true)}
      >
        <Ionicons name="help-circle-outline" size={28} color="#A259FF" />
      </TouchableOpacity>
      <Modal visible={showHelp} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          onPress={() => setShowHelp(false)}
        >
          <View style={styles.helpModalContent}>
            <Text style={styles.helpTitle}>¿Cómo registrar tu vehículo?</Text>
            <Text style={styles.helpText}>
              El formulario se adapta automáticamente según el tipo de vehículo
              seleccionado.\n\n- Para automóviles, motos, camionetas, vans y
              buses: debes ingresar la placa (6 caracteres alfanuméricos), SOAT
              y tecnomecánica, y adjuntar hasta 2 imágenes de cada documento.\n-
              Para bicicletas y monopatines: la placa se generará
              automáticamente, y solo debes adjuntar el comprobante de pago o la
              tarjeta de propiedad.\n\nRecuerda que todos los campos
              obligatorios deben completarse para poder registrar el vehículo.
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowHelp(false)}
            >
              <Text style={{ color: "#A259FF", fontWeight: "bold" }}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Selector de tipo */}
      <Text style={styles.label}>Tipo de vehículo</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTipo(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: value.tipo ? "#222" : "#888" }}>
          {tipos.find((t) => t.value.toString() === value.tipo)?.label ||
            "Selecciona el tipo"}
        </Text>
      </TouchableOpacity>
      <Modal visible={showTipo} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          onPress={() => setShowTipo(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={tipos}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.roleOption}
                  onPress={() => {
                    onChange({ ...value, tipo: item.value.toString() });
                    setShowTipo(false);
                  }}
                >
                  <Text style={styles.roleText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Placa */}
      {requierePlacaYFechas ? (
        <>
          <Text style={styles.label}>Placa</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su placa (6 caracteres alfanuméricos)"
            value={value.placa}
            onChangeText={(placa) => onChange({ ...value, placa })}
            maxLength={6}
            autoCapitalize="characters"
          />
        </>
      ) : (
        <Text style={styles.label}>
          Placa: se generará automáticamente para bicicleta o monopatín
        </Text>
      )}

      {/* Color */}
      <Text style={styles.label}>Color</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese el color"
        value={value.color}
        onChangeText={(color) => onChange({ ...value, color })}
      />

      {/* Modelo */}
      <Text style={styles.label}>Modelo (año)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese el año del modelo"
        value={value.modelo}
        onChangeText={(modelo) => onChange({ ...value, modelo })}
        keyboardType="numeric"
        maxLength={4}
      />

      {/* SOAT y Tecnomecánica solo para tipos distintos de 3 y 6 */}
      {requierePlacaYFechas && (
        <>
          <Text style={styles.label}>Vigencia de SOAT</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() =>
              setShowDate({ field: "vigenciaSoat", visible: true })
            }
          >
            <Text style={{ color: value.vigenciaSoat ? "#222" : "#888" }}>
              {value.vigenciaSoat ||
                "Ingrese fecha de vigencia de SOAT (obligatorio)"}
            </Text>
          </TouchableOpacity>
          {showDate.visible && showDate.field === "vigenciaSoat" && (
            <DateTimePicker
              value={
                value.vigenciaSoat ? new Date(value.vigenciaSoat) : new Date()
              }
              mode="date"
              display="calendar"
              onChange={(e, d) => handleDateChange("vigenciaSoat", e, d)}
            />
          )}

          <Text style={styles.label}>Fecha de tecnomecánica</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDate({ field: "fechaTecno", visible: true })}
          >
            <Text style={{ color: value.fechaTecno ? "#222" : "#888" }}>
              {value.fechaTecno ||
                "Ingrese fecha de la tecnomecánica (obligatorio)"}
            </Text>
          </TouchableOpacity>
          {showDate.visible && showDate.field === "fechaTecno" && (
            <DateTimePicker
              value={value.fechaTecno ? new Date(value.fechaTecno) : new Date()}
              mode="date"
              display="calendar"
              onChange={(e, d) => handleDateChange("fechaTecno", e, d)}
            />
          )}

          {/* Imágenes SOAT */}
          <Text style={styles.label}>Fotos de SOAT (máx 2)</Text>
          <View style={styles.fileInputRow}>
            {value.filesSoat.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.previewImg} />
            ))}
            {value.filesSoat.length < maxSoatTecno && (
              <TouchableOpacity onPress={() => onPickFiles("filesSoat")}>
                <Ionicons
                  name="attach"
                  size={24}
                  color="#B84CF6"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Imágenes Tecnomecánica */}
          <Text style={styles.label}>Fotos de tecnomecánica (máx 2)</Text>
          <View style={styles.fileInputRow}>
            {value.filesTecno.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.previewImg} />
            ))}
            {value.filesTecno.length < maxSoatTecno && (
              <TouchableOpacity onPress={() => onPickFiles("filesTecno")}>
                <Ionicons
                  name="attach"
                  size={24}
                  color="#B84CF6"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* Tarjeta de propiedad o comprobante */}
      <Text style={styles.label}>
        {esBicicleta || esMonopatin
          ? "Comprobante de pago o tarjeta de propiedad (frontal y trasera, obligatorio)"
          : "Tarjeta de propiedad (frontal y trasera, obligatorio)"}
      </Text>
      <View style={styles.fileInputRow}>
        {value.filesProp.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.previewImg} />
        ))}
        {value.filesProp.length < maxProp && (
          <TouchableOpacity onPress={() => onPickFiles("filesProp")}>
            <Ionicons
              name="attach"
              size={24}
              color="#B84CF6"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "bold", marginTop: 12, marginBottom: 4, color: "#222" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  fileInputRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  previewImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
  },
  helpBtn: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  helpModalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 40,
    borderRadius: 12,
    padding: 18,
    elevation: 4,
    alignItems: "center",
  },
  helpTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#A259FF",
    marginBottom: 8,
    textAlign: "center",
  },
  helpText: {
    color: "#222",
    fontSize: 15,
    marginBottom: 16,
    textAlign: "center",
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#F3E8FF",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 40,
    borderRadius: 12,
    padding: 12,
    elevation: 4,
  },
  roleOption: { padding: 12 },
  roleText: { fontSize: 16, color: "#222" },
});
