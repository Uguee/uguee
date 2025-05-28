import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface TopMenuProps {
  onMenuPress?: () => void;
}

export const TopMenu: React.FC<TopMenuProps> = ({ onMenuPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        <Text style={styles.logoBold}>Ug</Text>
        <Text style={styles.logoAccent}>ü</Text>
        <Text style={styles.logoBold}>ee</Text>
      </Text>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  logoBold: {
    color: "#000",
  },
  logoAccent: {
    color: "#A259FF", // Morado
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 28,
    color: "#000",
  },
});
