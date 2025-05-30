import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

const tipos = ["automóvil", "motocicleta", "bicicleta", "camioneta"];

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
      <Text style={styles.label}>Placa</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su placa"
        value={value.placa}
        onChangeText={(placa) => onChange({ ...value, placa })}
      />

      <Text style={styles.label}>Color</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese el color"
        value={value.color}
        onChangeText={(color) => onChange({ ...value, color })}
      />

      <Text style={styles.label}>Modelo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su modelo"
        value={value.modelo}
        onChangeText={(modelo) => onChange({ ...value, modelo })}
      />

      <Text style={styles.label}>Tipo</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTipo(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: value.tipo ? "#222" : "#888" }}>
          {value.tipo || "Tipo"}
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
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.roleOption}
                  onPress={() => {
                    onChange({ ...value, tipo: item });
                    setShowTipo(false);
                  }}
                >
                  <Text style={styles.roleText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={styles.label}>Vigencia de SOAT</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDate({ field: "vigenciaSoat", visible: true })}
      >
        <Text style={{ color: value.vigenciaSoat ? "#222" : "#888" }}>
          {value.vigenciaSoat || "Ingrese fecha de vigencia de SOAT"}
        </Text>
      </TouchableOpacity>
      {showDate.visible && showDate.field === "vigenciaSoat" && (
        <DateTimePicker
          value={value.vigenciaSoat ? new Date(value.vigenciaSoat) : new Date()}
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
          {value.fechaTecno || "Ingrese fecha de la tecnomecánica"}
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

      {/* Fotos de documentos */}
      <Text style={styles.label}>Fotos de documento SOAT</Text>
      <View style={styles.fileInputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="IMG-123.jpg, IMG-456.jpg"
          value={value.filesSoat?.join(", ")}
          editable={false}
        />
        <TouchableOpacity onPress={() => onPickFiles("filesSoat")}>
          <Ionicons
            name="attach"
            size={24}
            color="#B84CF6"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Fotos de documento tecnomecánica</Text>
      <View style={styles.fileInputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="IMG-123.jpg, IMG-456.jpg"
          value={value.filesTecno?.join(", ")}
          editable={false}
        />
        <TouchableOpacity onPress={() => onPickFiles("filesTecno")}>
          <Ionicons
            name="attach"
            size={24}
            color="#B84CF6"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Fotos de tarjeta de propiedad</Text>
      <View style={styles.fileInputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="IMG-123.jpg, IMG-456.jpg"
          value={value.filesProp?.join(", ")}
          editable={false}
        />
        <TouchableOpacity onPress={() => onPickFiles("filesProp")}>
          <Ionicons
            name="attach"
            size={24}
            color="#B84CF6"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
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
  fileInputRow: { flexDirection: "row", alignItems: "center" },
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
