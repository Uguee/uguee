import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function VehicleCard({
  image,
  title,
  description,
  plate,
}: {
  image: any;
  title: string;
  description: string;
  plate: string;
}) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.img} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
      <View style={styles.plateBox}>
        <Text style={styles.plate}>{plate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    gap: 10,
  },
  img: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#A259FF",
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
  },
  desc: {
    color: "#555",
    fontSize: 13,
  },
  plateBox: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  plate: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
  },
});
