import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface TripCompletedCardProps {
  route?: string;
  passengers?: number;
  onPress?: () => void;
}

const TripCompletedCard: React.FC<TripCompletedCardProps> = ({
  route = "Univalle ➔ Multicentro",
  passengers = 3,
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.icon} />
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

export default TripCompletedCard;
