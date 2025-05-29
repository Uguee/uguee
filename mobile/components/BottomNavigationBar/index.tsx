import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

interface NavButton {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  active?: boolean;
}

interface BottomNavigationProps {
  buttons: NavButton[];
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  buttons,
}) => {
  return (
    <View style={styles.container}>
      {buttons.map((btn, idx) => (
        <TouchableOpacity
          key={btn.label}
          style={styles.button}
          onPress={btn.onPress}
          activeOpacity={0.7}
        >
          <View style={btn.active ? styles.iconActive : styles.icon}>
            {btn.icon}
          </View>
          <Text style={[styles.label, btn.active && styles.labelActive]}>
            {btn.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#bbb",
    backgroundColor: "#fff",
    paddingBottom: 16,
    paddingTop: 8,
  },
  button: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginBottom: 2,
  },
  iconActive: {
    marginBottom: 2,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 2,
  },
  label: {
    fontSize: 13,
    color: "#222",
  },
  labelActive: {
    fontWeight: "bold",
    color: "#000",
  },
});
