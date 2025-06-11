import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface TripScheduledCardProps {
  route?: string;
  arrivalDateTime?: string;
  onPress?: () => void;
}

const TripScheduledCard: React.FC<TripScheduledCardProps> = ({
  route = "Univalle ➔ Multicentro",
  arrivalDateTime = "2025-06-17 ➔ 08:00:00 p.m",
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.route}>{route}</Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Estado:</Text> Programado
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Fecha y hora de llegada:</Text>{" "}
          {arrivalDateTime}
        </Text>
      </View>
    </TouchableOpacity>
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
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#B84CF6",
    marginRight: 12,
  },
  route: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    color: "#222",
    marginBottom: 1,
  },
  bold: {
    fontWeight: "bold",
  },
});

export default TripScheduledCard;
