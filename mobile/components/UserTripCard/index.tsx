import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface UserTripCardProps {
  route?: string;
  address?: string;
  time?: string;
  onPress?: () => void;
}

const UserTripCard: React.FC<UserTripCardProps> = ({
  route = "Univalle ➔ Multicentro",
  address = "Salida: Campus Meléndez Calle 13 # 100",
  time = "2:30 PM",
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.route}>{route}</Text>
        <Text style={styles.address}>{address}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
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
    borderColor: "#222",
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
    color: "#111",
  },
  address: {
    fontSize: 13,
    color: "#444",
  },
  time: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    marginLeft: 10,
  },
});

export default UserTripCard;
