import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface UserTripCardProps {
  route?: string;
  address?: string;
  time?: string;
  estado?:
    | "programado"
    | "pendiente"
    | "en-curso"
    | "completado"
    | "desconocido";
  onPress?: () => void;
}

function formatPlaceName(nombre: string | null | undefined): string {
  if (!nombre) return "";
  const partes = nombre.split(",").map((p) => p.trim());
  return `${partes.slice(0, 3).join(", ")}, Cali`;
}

function getEstadoBadgeColor(estado: string) {
  if (estado === "pendiente") return "#E9D5FF";
  if (estado === "programado") return "#A855F7";
  if (estado === "en-curso") return "#7C3AED";
  if (estado === "completado") return "#F3F4F6";
  return "#E0E0E0";
}

function getEstadoLabel(estado: string) {
  if (estado === "completado") return "Completado";
  if (estado === "en-curso") return "En curso";
  if (estado === "pendiente") return "Pendiente";
  if (estado === "programado") return "Programado";
  return "Desconocido";
}

const UserTripCard: React.FC<UserTripCardProps> = ({
  route = "Univalle ➔ Multicentro",
  address = "Salida: Campus Meléndez Calle 13 # 100",
  time = "2:30 PM",
  estado = "programado",
  onPress = () => {},
}) => {
  let borderColor = "#222";
  if (estado === "pendiente") borderColor = "#E9D5FF";
  else if (estado === "programado") borderColor = "#A855F7";
  else if (estado === "en-curso") borderColor = "#7C3AED";
  else if (estado === "completado") borderColor = "#F3F4F6";
  else if (estado === "desconocido") borderColor = "#E0E0E0";

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.icon, { backgroundColor: borderColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.route}>{route}</Text>
        <View style={styles.timeEstadoColumn}>
          <View style={styles.timeRow}>
            <View style={styles.timeDot} />
            <Text style={styles.time}>{time}</Text>
          </View>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: getEstadoBadgeColor(estado) },
            ]}
          >
            <Text style={styles.estadoBadgeText}>{getEstadoLabel(estado)}</Text>
          </View>
        </View>
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
    marginRight: 12,
  },
  route: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
    color: "#111",
    textAlign: "left",
  },
  time: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#7C3AED",
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginTop: 6,
    textAlign: "left",
    overflow: "hidden",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D8B4FE",
    marginRight: 8,
    marginTop: 0,
  },
  timeEstadoColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  estadoBadgeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  estadoBadge: {
    marginLeft: 18,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  estadoBadgeText: {
    color: "#7C3AED",
    fontSize: 11,
    fontWeight: "bold",
  },
});

export default UserTripCard;
