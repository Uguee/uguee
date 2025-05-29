import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

interface InstitutionCardProps {
  name: string;
  logo: any; // require('ruta/al/logo.png')
  onPress?: () => void;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  name,
  logo,
  onPress,
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.logoContainer}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
    </View>
    <Text style={styles.title}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#8B5CF6",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
  },
  logoContainer: {
    borderWidth: 4,
    borderColor: "#B84CF6",
    borderRadius: 10,
    padding: 4,
    marginRight: 16,
    backgroundColor: "#fff",
  },
  logo: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
});
