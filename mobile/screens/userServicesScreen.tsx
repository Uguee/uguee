import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TopMenu } from "../components/TopMenu";
import { HomeBottomMenu } from "../components/HomeBottomMenu";

interface UserServicesScreenProps {
  onGoToHome?: () => void;
  onGoToProfile?: () => void;
  onGoToMyTrips?: () => void;
  onGoToServices?: () => void;
  onGoToScanQR?: () => void;
}

const ServiciosScreen = ({
  onGoToHome = () => {},
  onGoToProfile = () => {},
  onGoToMyTrips = () => {},
  onGoToServices = () => {},
  onGoToScanQR = () => {},
}: UserServicesScreenProps) => {
  const historialViajes = [
    {
      id: 1,
      fechaInicio: "18 junio 2025, 3:00 p.m.",
      fechaLlegada: "18 junio 2025, 3:40 p.m.",
      desde: "Universidad del Valle",
      hasta: "Unicentro - Sur",
      estado: "Pendiente a calificar", // info fija por ahora
    },
    {
      id: 2,
      fechaInicio: "15 junio 2025, 10:00 a.m.",
      fechaLlegada: "15 junio 2025, 10:40 a.m.",
      desde: "Unicentro - Sur",
      hasta: "Universidad del Valle",
      estado: "Calificado", // info fija por ahora
    },
    // Puedes agregar más entradas aquí
  ];

  // Componente para la tarjeta de historial de viaje
  const TripsHistoryCard = ({
    item,
    onPress,
  }: {
    item: any;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.tripCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={styles.tripRoute} numberOfLines={2} ellipsizeMode="tail">
        {item.desde} ➔ {item.hasta}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 6,
          marginBottom: 6,
        }}
      >
        <View
          style={[
            styles.estadoBadge,
            item.estado === "Pendiente a calificar"
              ? styles.estadoPendiente
              : styles.estadoCalificado,
          ]}
        >
          <Text style={styles.estadoBadgeText}>{item.estado}</Text>
        </View>
      </View>
      <View style={styles.fechaRow}>
        <Text style={styles.fechaLabel}>Inicio:</Text>
        <Text style={styles.fechaValue}>{item.fechaInicio}</Text>
      </View>
      <View style={styles.fechaRow}>
        <Text style={styles.fechaLabel}>Llegada:</Text>
        <Text style={styles.fechaValue}>{item.fechaLlegada}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Top menu */}
      <TopMenu onMenuPress={() => {}} />
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: 20, paddingTop: 20 }]}>
        <Text style={styles.title}>Servicios</Text>
        <Ionicons name="qr-code-outline" size={28} color="black" />
      </View>

      {/* Escaneo */}
      <TouchableOpacity
        style={[styles.scanButton, { marginHorizontal: 20 }]}
        onPress={onGoToScanQR}
      >
        <Ionicons name="camera-outline" size={24} color="white" />
        <Text style={styles.scanText}>Escanear código para iniciar viaje</Text>
        <Text style={styles.subText}>Escanea el código del conductor</Text>
      </TouchableOpacity>

      {/* Historial */}
      <Text style={[styles.sectionTitle, { marginLeft: 27 }]}>
        Historial de viajes
      </Text>
      <FlatList
        data={historialViajes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TripsHistoryCard item={item} onPress={() => {}} />
        )}
        showsVerticalScrollIndicator={false}
      />
      {/* Menú inferior */}
      <HomeBottomMenu
        onGoToHome={onGoToHome}
        onGoToProfile={onGoToProfile}
        onGoToMyTrips={onGoToMyTrips}
        onGoToServices={onGoToServices}
        activeButton="services"
      />
    </View>
  );
};

export default ServiciosScreen;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5f00ba",
  },
  scanButton: {
    backgroundColor: "#a259ff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  subText: {
    color: "#f2f2f2",
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 12,
    color: "#222",
    marginLeft: 10,
  },
  scrollArea: {
    flex: 1,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  cardDate: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardRoute: {
    fontSize: 14,
    color: "#333",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5f00ba",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 13,
  },
  tripCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 16,
    elevation: 2,
    flexDirection: "column",
    alignItems: "flex-start",
    minWidth: 0,
  },
  tripRoute: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    marginBottom: 2,
    width: "100%",
  },
  estadoBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    maxWidth: 160,
  },
  estadoPendiente: {
    backgroundColor: "#B84CF6",
  },
  estadoCalificado: {
    backgroundColor: "#A3E635",
  },
  estadoBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    flexShrink: 1,
  },
  fechaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
    width: "100%",
  },
  fechaLabel: {
    color: "#7C3AED",
    fontWeight: "bold",
    fontSize: 13,
    marginRight: 6,
    minWidth: 60,
  },
  fechaValue: {
    color: "#222",
    fontSize: 13,
    flexShrink: 1,
  },
});
