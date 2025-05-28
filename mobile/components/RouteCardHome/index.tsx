import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface RouteCardProps {
  title: string;
  address: string;
  onPress?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  title,
  address,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <View style={styles.icon} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.address}>{address}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#222",
    marginHorizontal: 8,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#A259FF",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  address: {
    color: "#444",
    fontSize: 13,
  },
});
