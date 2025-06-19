import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TripScheduledDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onStartTrip?: () => void;
  pickupPlace?: string;
  destinationPlace?: string;
  departureDate?: string;
  departureTime?: string;
}

const TripScheduledDetailsModal: React.FC<TripScheduledDetailsModalProps> = ({
  visible,
  onClose,
  onStartTrip = () => {},
  pickupPlace = "Campus Meléndez Calle 13 # 100",
  destinationPlace = "Cl. 13 #98-10",
  departureDate = "2025-05-31",
  departureTime = "07:00:00 p.m",
}) => {
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
            <View style={styles.row}>
              <Ionicons name="location" size={22} color="#B84CF6" />
              <Text style={styles.pickup}>
                <Text style={styles.bold}>Lugar de recogida:</Text>{" "}
                {pickupPlace}
              </Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="flag" size={22} color="#B84CF6" />
              <Text style={styles.destination}>
                <Text style={styles.bold}>Lugar de destino:</Text>{" "}
                {destinationPlace}
              </Text>
            </View>
            <Text style={styles.label}>
              Fecha de salida: <Text style={styles.value}>{departureDate}</Text>
            </Text>
            <Text style={styles.label}>
              Hora de salida: <Text style={styles.value}>{departureTime}</Text>
            </Text>
            <Text style={styles.confirmText}>
              ¿Está seguro iniciar su viaje con la ruta actual?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.startBtn} onPress={onStartTrip}>
                <Text style={styles.startBtnText}>Iniciar viaje</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn2} onPress={onClose}>
                <Text style={styles.closeBtn2Text}>cerrar</Text>
              </TouchableOpacity>
            </View>
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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  pickup: {
    fontSize: 14,
    color: "#222",
    marginLeft: 6,
    flex: 1,
    flexWrap: "wrap",
  },
  destination: {
    fontSize: 14,
    color: "#222",
    marginLeft: 6,
    flex: 1,
    flexWrap: "wrap",
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
  confirmText: {
    marginTop: 18,
    fontSize: 15,
    color: "#333",
    marginBottom: 18,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  startBtn: {
    backgroundColor: "#B84CF6",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 8,
  },
  startBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeBtn2: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "#B84CF6",
  },
  closeBtn2Text: {
    color: "#B84CF6",
    fontWeight: "bold",
    fontSize: 16,
  },
  bold: {
    fontWeight: "bold",
  },
});

export default TripScheduledDetailsModal;
