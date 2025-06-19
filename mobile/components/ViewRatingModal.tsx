import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ViewRatingModalProps {
  visible: boolean;
  onClose: () => void;
  rating: number;
  comment: string;
}

const ViewRatingModal: React.FC<ViewRatingModalProps> = ({
  visible,
  onClose,
  rating,
  comment,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Calificación</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= rating ? "star" : "star-outline"}
                size={36}
                color={i <= rating ? "#FFD600" : "#222"}
                style={{ marginHorizontal: 2 }}
              />
            ))}
          </View>
          <Text style={styles.title2}>Comentario</Text>
          <View style={styles.commentBox}>
            <Text style={styles.commentText}>
              {comment || "Sin comentario"}
            </Text>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={onClose}>
            <Text style={styles.sendBtnText}>Cerrar</Text>
          </TouchableOpacity>
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: 330,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    alignItems: "stretch",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 4,
  },
  title: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 8,
    marginTop: 8,
    color: "#222",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 2,
  },
  title2: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
    color: "#222",
  },
  commentBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
    backgroundColor: "#fafafa",
    marginBottom: 18,
    marginTop: 6,
  },
  commentText: {
    color: "#222",
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: "#B84CF6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 2,
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});

export default ViewRatingModal;
