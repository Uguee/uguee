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
      case "en-curso":
        return [styles.card, styles.inProgressCard];
      case "terminado":
        return [styles.card, styles.completedCard];
      default:
        return [styles.card, styles.scheduledCard];
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

  // Función para renderizar el contenido según el estado
  const renderContent = () => {
    const routeName = formatRouteName();

    switch (trip.estado) {
      case "pendiente":
        return (
          <>
            <Text style={styles.route}>{routeName}</Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Estado:</Text> Pendiente
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Fecha programada:</Text>{" "}
              {trip.programado_local || "No disponible"}
            </Text>
          </>
        );

      case "en-curso":
        return (
          <>
            <Text style={styles.route}>{routeName}</Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Estado:</Text> En curso
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Fecha inicio:</Text>{" "}
              {trip.salida_at
                ? new Date(trip.salida_at).toLocaleString("es-CO")
                : "No disponible"}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Número de pasajeros:</Text> null
            </Text>
          </>
        );

      case "terminado":
        return (
          <>
            <Text style={styles.route}>{routeName}</Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Estado:</Text> Terminado
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Número de pasajeros:</Text> null
            </Text>
          </>
        );

      default:
        return (
          <>
            <Text style={styles.route}>{routeName}</Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Estado:</Text> Programado
            </Text>
            <Text style={styles.label}>
              <Text style={styles.bold}>Fecha programada:</Text>{" "}
              {trip.programado_local || "No disponible"}
            </Text>
          </>
        );
    }
  };

  return (
    <TouchableOpacity
      style={getCardStyle()}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.icon, { backgroundColor: getIconColor() }]} />
      <View style={{ flex: 1 }}>
        {renderContent()}
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
    borderColor: "#B84CF6", // Morado original
  },
  pendingCard: {
    borderColor: "#D8B4FE", // Morado claro
  },
  inProgressCard: {
    borderColor: "#7C3AED", // Morado oscuro
  },
  completedCard: {
    borderColor: "transparent", // Sin borde
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
});

export default TripScheduledCard;
