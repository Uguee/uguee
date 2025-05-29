import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Asegúrate de tener instalada esta librería

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onLaterPress?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onLaterPress,
  placeholder = "¿A dónde vas?",
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#fff" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#fff"
      />
      <TouchableOpacity style={styles.laterButton} onPress={onLaterPress}>
        <Ionicons name="calendar-outline" size={18} color="#A259FF" />
        <Text style={styles.laterText}>Más tarde</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#A259FF",
    borderRadius: 16,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 4,
  },
  laterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  laterText: {
    color: "#A259FF",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 14,
  },
});
