import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Review {
  rating: number;
  comment: string;
}

interface TripCompletedDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  trip?: any;
}

// Función para filtrar y mostrar solo los datos relevantes de la dirección
function filtrarDireccion(direccion: string): string {
  if (!direccion) return "";
  const partes = direccion.split(",").map((p) => p.trim());
  // Palabras clave para identificar los campos relevantes
  const claves = [
    "colegio",
    "escuela",
    "universidad", // nombre propio
    "calle",
    "carrera",
    "avenida",
    "cll",
    "cra", // vías
    "villa",
    "barrio",
    "neighbourhood", // barrios
    "comuna", // comuna
    "cali", // ciudad
    "colombia", // país
  ];
  // Siempre incluye los primeros 1-2 elementos (nombre propio y calle)
  let resultado: string[] = [];
  if (partes.length > 0) resultado.push(partes[0]);
  if (partes.length > 1) resultado.push(partes[1]);
  // Busca y agrega los campos relevantes que no estén ya incluidos
  for (let i = 2; i < partes.length; i++) {
    const parte = partes[i].toLowerCase();
    if (
      claves.some((clave) => parte.includes(clave)) &&
      !resultado.includes(partes[i])
    ) {
      resultado.push(partes[i]);
    }
  }
  // Elimina duplicados y filtra frases no deseadas
  resultado = [...new Set(resultado)].filter(
    (p) =>
      !/comuna 8/i.test(p) && // quita Comuna 8 (insensible a mayúsculas)
      !/perímetro urbano/i.test(p) // quita Perímetro Urbano
  );
  return resultado.join(", ");
}

const TripCompletedDetailsModal: React.FC<TripCompletedDetailsModalProps> = ({
  visible,
  onClose,
  trip,
}) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const reviews = trip?.reviews || [
    { rating: 3, comment: "Muy buen viaje" },
    { rating: 4, comment: "Buen viaje, muy cómodo" },
    { rating: 3, comment: "Me gustó el viaje" },
  ];
  const ruta = trip?.ruta;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#222" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Detalles de viaje:</Text>
            <Text style={styles.route}>
              <Text style={styles.bold}>
                {trip?.ruta_nombre || trip?.id_ruta}
              </Text>
            </Text>
            <Text style={styles.address}>
              Salida: {ruta?.nombre_partida || "-"}
            </Text>
            <Text style={styles.label}>
              Fecha de salida:{" "}
              <Text style={styles.value}>{trip?.fecha || "-"}</Text>
            </Text>
            <Text style={styles.label}>
              Hora de salida:{" "}
              <Text style={styles.value}>{trip?.hora_salida || "-"}</Text>
            </Text>
            <Text style={styles.label}>
              Fecha de llegada:{" "}
              <Text style={styles.value}>{trip?.fecha || "-"}</Text>
            </Text>
            <Text style={styles.label}>
              Hora de llegada:{" "}
              <Text style={styles.value}>{trip?.hora_llegada || "-"}</Text>
            </Text>
            <Text style={styles.label}>
              Numero de pasajeros:{" "}
              <Text style={styles.value}>{trip?.pasajeros || 0}</Text>
            </Text>
            <Text style={[styles.label, { marginTop: 10 }]}>Reseñas:</Text>
            {reviews.map((review: Review, idx: number) => (
              <View key={idx} style={styles.reviewBox}>
                <TouchableOpacity
                  style={styles.starsRow}
                  onPress={() => setExpanded(expanded === idx ? null : idx)}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= review.rating ? "star" : "star-outline"}
                      size={22}
                      color={n <= review.rating ? "#FFD600" : "#bbb"}
                    />
                  ))}
                </TouchableOpacity>
                {expanded === idx && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 320,
    maxHeight: 480,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 4,
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 8,
    color: "#222",
  },
  route: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
    color: "#222",
  },
  address: {
    fontSize: 13,
    color: "#444",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 2,
    color: "#222",
  },
  value: {
    fontWeight: "normal",
    color: "#222",
  },
  bold: {
    fontWeight: "bold",
  },
  reviewBox: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: "#fafafa",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  reviewComment: {
    marginTop: 4,
    fontSize: 13,
    color: "#333",
  },
});

export default TripCompletedDetailsModal;
