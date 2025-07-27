import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TripCompletedCardProps {
  route?: string;
  time: string;
  passengers?: number;
  onPress?: () => void;
}

const TripCompletedCard: React.FC<TripCompletedCardProps> = ({
  route = "Univalle ➔ Multicentro",
  time,
  passengers = 3,
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <Ionicons name="checkmark-circle" size={28} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.route}>{route}</Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Estado:</Text> Terminado
        </Text>
        <Text style={styles.label}>
          <Text style={styles.bold}>Número de pasajeros:</Text> {passengers}
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
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#B84CF6",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#B84CF6",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
  timeText: {
    color: "#7C3AED",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
});

export default TripCompletedCard;
