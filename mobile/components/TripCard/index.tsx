import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TripCardProps {
  salida: string;
  llegada: string;
  hora: string;
}

const TripCard: React.FC<TripCardProps> = ({ salida, llegada, hora }) => {
  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View style={styles.iconSquare} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {salida} → {llegada}
          </Text>
          <Text style={styles.subtitle}>Salida: {salida}</Text>
        </View>
      </View>
      <Text style={styles.hour}>{hora}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#B84CF6",
    marginRight: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#111",
  },
  subtitle: {
    fontSize: 12,
    color: "#444",
    marginTop: 2,
  },
  hour: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111",
    marginLeft: 12,
  },
});

export default TripCard;
