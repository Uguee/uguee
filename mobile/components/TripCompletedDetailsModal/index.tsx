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
  route?: string;
  address?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  passengers?: number;
  reviews?: Review[];
}

const TripCompletedDetailsModal: React.FC<TripCompletedDetailsModalProps> = ({
  visible,
  onClose,
  route = "Univalle ➔ Multicentro",
  address = "Campus Meléndez Calle 13 # 100",
  departureDate = "2025-05-31",
  departureTime = "07:00:00 p.m",
  arrivalDate = "2025-05-31",
  arrivalTime = "08:00:00 p.m",
  passengers = 3,
  reviews = [
    { rating: 3, comment: "Muy buen viaje" },
    { rating: 4, comment: "Buen viaje, muy cómodo" },
    { rating: 3, comment: "Me gustó el viaje" },
  ],
}) => {
  const [expanded, setExpanded] = useState<number | null>(null);

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
              <Text style={styles.bold}>{route}</Text>
            </Text>
            <Text style={styles.address}>Salida: {address}</Text>
            <Text style={styles.label}>
              Fecha de salida: <Text style={styles.value}>{departureDate}</Text>
            </Text>
            <Text style={styles.label}>
              Hora de salida: <Text style={styles.value}>{departureTime}</Text>
            </Text>
            <Text style={styles.label}>
              Fecha de llegada: <Text style={styles.value}>{arrivalDate}</Text>
            </Text>
            <Text style={styles.label}>
              Hora de llegada: <Text style={styles.value}>{arrivalTime}</Text>
            </Text>
            <Text style={styles.label}>
              Numero de pasajeros:{" "}
              <Text style={styles.value}>{passengers}</Text>
            </Text>
            <Text style={[styles.label, { marginTop: 10 }]}>Reseñas:</Text>
            {reviews.map((review, idx) => (
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
