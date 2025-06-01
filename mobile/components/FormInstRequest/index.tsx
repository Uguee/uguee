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
import { Ionicons } from "@expo/vector-icons";

const roles = ["Estudiante", "Docente", "Administrativo", "Otro"];

interface Props {
  onChange: (data: {
    code: string;
    email: string;
    role: string;
    files: string[];
    address: string;
  }) => void;
  value: {
    code: string;
    email: string;
    role: string;
    files: string[];
    address: string;
  };
  onPickFiles: () => void;
}

export default function InstitutionRequestForm({
  value,
  onChange,
  onPickFiles,
}: Props) {
  const [showRoles, setShowRoles] = useState(false);

  return (
    <View>
      <Text style={styles.label}>Código institucional</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa tu código institucional"
        value={value.code}
        onChangeText={(code) => onChange({ ...value, code })}
      />

      <Text style={styles.label}>Correo institucional</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo institucional"
        value={value.email}
        onChangeText={(email) => onChange({ ...value, email })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Rol</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowRoles(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: value.role ? "#222" : "#888" }}>
          {value.role || "Rol en tu institución"}
        </Text>
      </TouchableOpacity>
      <Modal visible={showRoles} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          onPress={() => setShowRoles(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={roles}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.roleOption}
                  onPress={() => {
                    onChange({ ...value, role: item });
                    setShowRoles(false);
                  }}
                >
                  <Text style={styles.roleText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={styles.label}>Dirección de residencia</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa tu dirección de residencia"
        value={value.address}
        onChangeText={(address) => onChange({ ...value, address })}
      />

      <Text style={styles.label}>Fotos de documento institucional</Text>
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
