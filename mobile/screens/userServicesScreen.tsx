import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TopMenu } from "../components/TopMenu";
import { HomeBottomMenu } from "../components/HomeBottomMenu";
import RatingModal from "../components/RatingModal";
import ViewRatingModal from "../components/ViewRatingModal";
import {
  getFinishedTripsByUserId,
  getActivePassengerTrip,
} from "../services/tripServices";
import { getTripReview, createTripReview } from "../services/reviewService";
import { useAuth } from "../hooks/useAuth";
import { getCurrentToken } from "../services/authService";
import { getCedulaByUUID } from "../services/userDataService";
import { validateActiveTripQR } from "../lib/validateActiveTrip";

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
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [viewRatingModalVisible, setViewRatingModalVisible] = useState(false);
  const [viewRatingData, setViewRatingData] = useState<{
    rating: number;
    comment: string;
  } | null>(null);
  const [historialViajes, setHistorialViajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false); // Prevenir doble envío
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        if (!user?.id) {
          console.log("No hay user.id");
          return;
        }
        const id_usuario = await getCedulaByUUID(user.id);
        if (!id_usuario) {
          console.log("No se pudo obtener id_usuario");
          return;
        }
        const jwt = getCurrentToken();
        if (!jwt) {
          console.log("No hay JWT");
          return;
        }
        console.log("Consultando viajes con:", {
          id_usuario,
          jwt: jwt.slice(0, 10) + "...",
        });
        const { viajes } = await getFinishedTripsByUserId(id_usuario, jwt);
        console.log("Respuesta de getFinishedTripsByUserId:", viajes);
        setHistorialViajes(viajes);
      } catch (e) {
        console.error("Error al consultar viajes:", e);
        setHistorialViajes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user?.id]);

  // Componente para la tarjeta de historial de viaje
  const TripsHistoryCard = ({
    item,
    onPress,
  }: {
    item: any;
    onPress?: () => void;
  }) => {
    // Log fuera del JSX
    console.log("Conductor del viaje:", item.conductor);

    return (
      <TouchableOpacity
        style={styles.tripCard}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Text style={styles.tripRoute} numberOfLines={2} ellipsizeMode="tail">
          {item.ruta?.nombre_partida} ➔ {item.ruta?.nombre_llegada}
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
              item.tiene_resena
                ? styles.estadoCalificado
                : styles.estadoPendiente,
            ]}
          >
            <Text style={styles.estadoBadgeText}>
              {item.tiene_resena ? "Calificado" : "Pendiente a calificar"}
            </Text>
          </View>
        </View>
        <View style={styles.fechaRow}>
          <Text style={styles.fechaLabel}>Inicio:</Text>
          <Text style={styles.fechaValue}>
            {item.salida_at
              ? new Date(item.salida_at).toLocaleString("es-CO")
              : "-"}
          </Text>
        </View>
        <View style={styles.fechaRow}>
          <Text style={styles.fechaLabel}>Llegada:</Text>
          <Text style={styles.fechaValue}>
            {item.llegada_at
              ? new Date(item.llegada_at).toLocaleString("es-CO")
              : "-"}
          </Text>
        </View>
        <View style={styles.fechaRow}>
          <Text style={styles.fechaLabel}>Placa:</Text>
          <Text style={styles.fechaValue}>{item.vehiculo?.placa || "-"}</Text>
        </View>
        <View style={styles.fechaRow}>
          <Text style={styles.fechaLabel}>Conductor:</Text>
          <Text style={styles.fechaValue}>
            {item.conductor &&
            (item.conductor.nombre || item.conductor.apellido)
              ? `${item.conductor.nombre || ""} ${
                  item.conductor.apellido || ""
                }`.trim()
              : "-"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleOpenRating = async (trip: any) => {
    if (!trip || !trip.id_viaje) return;
    setSelectedTrip(trip);
    if (trip.tiene_resena) {
      // Mostrar modal de reseña existente
      if (!user?.id) return;
      const id_usuario = await getCedulaByUUID(user.id);
      if (!id_usuario) return;
      const jwt = getCurrentToken();
      if (!jwt) return;
      const res = await getTripReview(id_usuario, trip.id_viaje, jwt);
      setViewRatingData({
        rating: res.resena?.calificacion || 0,
        comment: res.resena?.descripcion || "",
      });
      setViewRatingModalVisible(true);
    } else {
      setRatingModalVisible(true);
    }
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    console.log("🌟 Iniciando envío de reseña:", {
      rating,
      comment: comment.substring(0, 50) + "...",
      selectedTrip: selectedTrip?.id_viaje,
      submittingReview,
    });

    // Prevenir doble envío
    if (submittingReview) {
      console.log("⚠️ Ya se está enviando una reseña, ignorando...");
      return;
    }

    if (!selectedTrip || !selectedTrip.id_viaje || !user?.id) {
      setRatingModalVisible(false);
      console.error("❌ Datos faltantes:", {
        selectedTrip: !!selectedTrip,
        id_viaje: selectedTrip?.id_viaje,
        user_id: !!user?.id,
      });
      Alert.alert("Error", "Datos del viaje no disponibles");
      return;
    }

    // Verificar si el viaje ya fue calificado según nuestro estado local
    if (selectedTrip.tiene_resena) {
      console.log("⚠️ El viaje ya fue calificado según el estado local");
      setRatingModalVisible(false);
      Alert.alert("Información", "Este viaje ya fue calificado anteriormente");
      return;
    }

    setSubmittingReview(true);

    try {
      console.log("📍 Paso 1: Obteniendo id_usuario");
      const id_usuario = await getCedulaByUUID(user.id);
      if (!id_usuario) {
        console.error("❌ No se pudo obtener id_usuario");
        throw new Error("No se pudo obtener el id_usuario");
      }
      console.log("✅ id_usuario obtenido:", id_usuario);

      console.log("📍 Paso 2: Obteniendo JWT");
      const jwt = getCurrentToken();
      if (!jwt) {
        console.error("❌ No hay JWT disponible");
        throw new Error("No hay JWT");
      }
      console.log("✅ JWT disponible:", jwt.substring(0, 20) + "...");

      console.log("📍 Paso 3: Verificando si ya existe reseña");
      // Verificar si ya existe una reseña en el servidor
      const existingReview = await getTripReview(
        id_usuario,
        selectedTrip.id_viaje,
        jwt
      );
      if (existingReview.success && existingReview.resena) {
        console.log(
          "⚠️ Ya existe una reseña en el servidor:",
          existingReview.resena
        );
        // Actualizar estado local para reflejar que ya tiene reseña
        setHistorialViajes((prev) =>
          prev.map((v) =>
            v.id_viaje === selectedTrip.id_viaje
              ? { ...v, tiene_resena: true }
              : v
          )
        );
        setRatingModalVisible(false);
        Alert.alert(
          "Información",
          "Este viaje ya fue calificado anteriormente"
        );
        return;
      }

      console.log("📍 Paso 4: Enviando reseña al servidor");
      const reviewData = {
        id_usuario,
        id_viaje: selectedTrip.id_viaje,
        rating,
        comment,
      };
      console.log("📄 Datos de la reseña:", reviewData);

      const res = await createTripReview(
        id_usuario,
        selectedTrip.id_viaje,
        rating,
        comment,
        jwt
      );

      console.log("📄 Respuesta del servidor:", res);

      if (res.success) {
        console.log("🎉 Reseña enviada exitosamente");
        // Actualizar el historial para reflejar el cambio
        setHistorialViajes((prev) =>
          prev.map((v) =>
            v.id_viaje === selectedTrip.id_viaje
              ? { ...v, tiene_resena: true }
              : v
          )
        );
        setRatingModalVisible(false);
        Alert.alert("Éxito", "¡Reseña guardada exitosamente!");
      } else {
        console.error("❌ Error del servidor:", res.error);
        setRatingModalVisible(false);
        Alert.alert("Error", res.error || "Error al guardar la reseña");
      }
    } catch (e: any) {
      console.error("💥 Error inesperado:", e);
      setRatingModalVisible(false);
      Alert.alert(
        "Error",
        e.message || "Error inesperado al guardar la reseña"
      );
    } finally {
      setSubmittingReview(false);
      console.log("🏁 Proceso de envío de reseña finalizado");
    }
  };

  // Handler para escanear QR con validación de viaje activo
  const handleScanQRPress = async () => {
    if (!user) return;
    try {
      const result = await validateActiveTripQR({
        userId: user.id,
        getCedulaByUUID,
        getActivePassengerTrip,
        getCurrentToken,
      });
      if (result.estado === "otro-viaje") {
        Alert.alert("Ya tienes un viaje en curso", result.mensaje, [
          {
            text: "Aceptar",
            style: "default",
          },
        ]);
        return;
      }
      if (result.estado === "no-activo") {
        onGoToScanQR();
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.message ||
          "No se pudo verificar el estado de tus viajes. Intenta de nuevo."
      );
    }
  };

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
        onPress={handleScanQRPress}
      >
        <Ionicons name="camera-outline" size={24} color="white" />
        <Text style={styles.scanText}>Escanear código para iniciar viaje</Text>
        <Text style={styles.subText}>Escanea el código del conductor</Text>
      </TouchableOpacity>

      {/* Historial */}
      <Text style={[styles.sectionTitle, { marginLeft: 27 }]}>
        Historial de viajes
      </Text>
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 30 }}>
          Cargando viajes...
        </Text>
      ) : (
        <FlatList
          data={historialViajes}
          keyExtractor={(item) =>
            item?.id_viaje ? item.id_viaje.toString() : Math.random().toString()
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TripsHistoryCard
              item={item}
              onPress={() => handleOpenRating(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleSubmitRating}
        isLoading={submittingReview}
      />
      <ViewRatingModal
        visible={viewRatingModalVisible}
        onClose={() => setViewRatingModalVisible(false)}
        rating={viewRatingData?.rating || 0}
        comment={viewRatingData?.comment || ""}
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
  infoText: {
    color: "#444",
    fontSize: 13,
    marginBottom: 1,
    width: "100%",
  },
});
