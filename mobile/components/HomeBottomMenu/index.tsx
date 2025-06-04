import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

interface HomeBottomMenuProps {
  onGoToProfile: () => void;
  onGoToHome: () => void;
  activeButton?: "home" | "trips" | "services" | "profile";
}

export const HomeBottomMenu = ({
  onGoToProfile,
  onGoToHome,
  activeButton = "home",
}: HomeBottomMenuProps) => {
  const buttons = [
    {
      label: "Inicio",
      icon: <Ionicons name="home-outline" size={28} color="#000" />,
      active: activeButton === "home",
      onPress: onGoToHome,
    },
    {
      label: "Mis viajes",
      icon: <MaterialIcons name="airport-shuttle" size={28} color="#000" />,
      active: activeButton === "trips",
      onPress: () => alert("Mis viajes"),
    },
    {
      label: "Servicios",
      icon: <Ionicons name="settings-outline" size={28} color="#000" />,
      active: activeButton === "services",
      onPress: () => alert("Servicios"),
    },
    {
      label: "Perfil",
      icon: <FontAwesome name="user-o" size={26} color="#000" />,
      active: activeButton === "profile",
      onPress: onGoToProfile,
    },
  ];

  return (
    <View style={styles.container}>
      {buttons.map((btn) => (
        <TouchableOpacity
          key={btn.label}
          style={styles.button}
          onPress={btn.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.icon}>{btn.icon}</View>
          <Text style={[styles.label, btn.active && styles.activeLabel]}>
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    color: "#222",
  },
  activeLabel: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
});
