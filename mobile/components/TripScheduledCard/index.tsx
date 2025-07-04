import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface TripScheduledCardProps {
  trip: any; // Datos completos del viaje
  onPress?: () => void;
  onStartTrip?: () => void;
  canStartTrip?: boolean;
}

// Función para acortar nombres de lugares
function formatPlaceName(nombre: string | null): string {
  if (!nombre) return "";
  const partes = nombre.split(",").map((p) => p.trim());
  // Tomar las primeras 3 partes y añadir "Cali"
  return `${partes.slice(0, 3).join(", ")}, Cali`;
}

const TripScheduledCard: React.FC<TripScheduledCardProps> = ({
  trip,
  onPress = () => {},
  onStartTrip = () => {},
  canStartTrip = false,
}) => {
  // Función para formatear la ruta
  const formatRouteName = () => {
    if (trip.ruta?.nombre_partida && trip.ruta?.nombre_llegada) {
      return `${formatPlaceName(trip.ruta.nombre_partida)} ➔ ${formatPlaceName(
        trip.ruta.nombre_llegada
      )}`;
    }
    return `Ruta ${trip.id_ruta}`;
  };

  // Función para obtener el estilo según el estado
  const getCardStyle = () => {
    switch (trip.estado) {
      case "pendiente":
        return [styles.card, styles.pendingCard];
      case "programado":
        return [styles.card, styles.scheduledCard];
      case "en-curso":
        return [styles.card, styles.inProgressCard];
      case "completado":
        return [styles.card, styles.completedCard];
      case "desconocido":
        return [styles.card, styles.unknownCard];
      default:
        return [styles.card, styles.unknownCard];
    }
  };

  // Función para obtener el color del icono según el estado
  const getIconColor = () => {
    switch (trip.estado) {
      case "pendiente":
        return "#D8B4FE"; // Morado claro
      case "en-curso":
        return "#7C3AED"; // Morado oscuro
      case "terminado":
        return "#10B981"; // Verde
      default:
        return "#B84CF6"; // Morado original
    }
  };

  // Función para obtener el color del badge de estado
  const getEstadoBadgeColor = () => {
    if (trip.estado === "pendiente") return "#E9D5FF";
    if (trip.estado === "programado") return "#A855F7";
    if (trip.estado === "en-curso") return "#7C3AED";
    if (trip.estado === "completado") return "#F3F4F6";
    return "#E0E0E0";
  };
  // Función para obtener el label del estado
  const getEstadoLabel = () => {
    if (trip.estado === "completado") return "Completado";
    if (trip.estado === "en-curso") return "En curso";
    if (trip.estado === "pendiente") return "Pendiente";
    if (trip.estado === "programado") return "Programado";
    return "Desconocido";
  };

  // Función para obtener el color del borde según el estado
  const getBorderColor = () => {
    if (trip.estado === "pendiente") return "#E9D5FF";
    if (trip.estado === "programado") return "#A855F7";
    if (trip.estado === "en-curso") return "#7C3AED";
    if (trip.estado === "completado") return "#F3F4F6";
    if (trip.estado === "desconocido") return "#E0E0E0";
    return "#E0E0E0";
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: getBorderColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.icon, { backgroundColor: getIconColor() }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.route}>{formatRouteName()}</Text>
        <View style={styles.timeEstadoColumn}>
          <View style={styles.timeRow}>
            <View style={styles.timeDot} />
            <Text style={styles.time}>
              {trip.programado_local || "No disponible"}
            </Text>
          </View>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: getEstadoBadgeColor() },
            ]}
          >
            <Text style={styles.estadoBadgeText}>{getEstadoLabel()}</Text>
          </View>
        </View>
        {canStartTrip && trip.estado === "pendiente" && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={(e) => {
              e.stopPropagation();
              onStartTrip();
            }}
          >
            <Text style={styles.startButtonText}>Iniciar Viaje</Text>
          </TouchableOpacity>
        )}
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
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduledCard: {
    borderColor: "#A855F7",
  },
  pendingCard: {
    borderColor: "#E9D5FF",
  },
  inProgressCard: {
    borderColor: "#7C3AED",
  },
  completedCard: {
    borderColor: "#F3F4F6",
  },
  unknownCard: {
    borderColor: "#E0E0E0",
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
  },
  label: {
    fontSize: 13,
    color: "#222",
    marginBottom: 1,
  },
  bold: {
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: "#B84CF6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
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
  time: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#7C3AED",
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 10,
    textAlign: "left",
    overflow: "hidden",
  },
  timeEstadoColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
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

export default TripScheduledCard;
