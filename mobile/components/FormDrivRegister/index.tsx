import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
  value: {
    licenseId: string;
    expeditionPlace: string;
    expeditionDate: string;
    expirationDate: string;
    files: string[];
  };
  onChange: (data: Props["value"]) => void;
  onPickFiles: () => void;
}

export default function DriverRegisterForm({
  value,
  onChange,
  onPickFiles,
}: Props) {
  const [showExpedition, setShowExpedition] = useState(false);
  const [showExpiration, setShowExpiration] = useState(false);

  return (
    <View>
      <Text style={styles.label}>Número de id en licencia</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa el número de identificación"
        value={value.licenseId}
        onChangeText={(licenseId) => onChange({ ...value, licenseId })}
      />

      <Text style={styles.label}>Lugar de expedición</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa el lugar de expedición"
        value={value.expeditionPlace}
        onChangeText={(expeditionPlace) =>
          onChange({ ...value, expeditionPlace })
        }
      />

      <Text style={styles.label}>Fecha de expedición</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowExpedition(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: value.expeditionDate ? "#222" : "#888" }}>
          {value.expeditionDate || "mm/dd/aaaa"}
        </Text>
      </TouchableOpacity>
      {showExpedition && (
        <DateTimePicker
          value={
            value.expeditionDate ? new Date(value.expeditionDate) : new Date()
          }
          mode="date"
          display="calendar"
          onChange={(_, date) => {
            setShowExpedition(false);
            if (date)
              onChange({
                ...value,
                expeditionDate: date.toISOString().split("T")[0],
              });
          }}
        />
      )}

      <Text style={styles.label}>Fecha de vencimiento</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowExpiration(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: value.expirationDate ? "#222" : "#888" }}>
          {value.expirationDate || "mm/dd/aaaa"}
        </Text>
      </TouchableOpacity>
      {showExpiration && (
        <DateTimePicker
          value={
            value.expirationDate ? new Date(value.expirationDate) : new Date()
          }
          mode="date"
          display="calendar"
          onChange={(_, date) => {
            setShowExpiration(false);
            if (date)
              onChange({
                ...value,
                expirationDate: date.toISOString().split("T")[0],
              });
          }}
        />
      )}

      <Text style={styles.label}>Fotos de licencia de conducir</Text>
      <View style={styles.fileInputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="IMG-123.jpg, IMG-456.jpg"
          value={value.files.join(", ")}
          editable={false}
        />
        <TouchableOpacity onPress={onPickFiles}>
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
});
