import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isLoading?: boolean;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarPress = (value: number) => {
    setRating(value);
  };

  const handleSend = () => {
    if (isLoading || rating === 0) return;
    onSubmit(rating, comment);
    // No cerrar el modal ni limpiar campos aquí
    // El componente padre se encarga de cerrar después del éxito
  };

  // Limpiar campos cuando el modal se cierre
  React.useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment("");
    }
  }, [visible]);

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
          <Text style={styles.title}>¿Cómo fue tu experiencia?</Text>
          <Text style={styles.subtitle}>
            Toca las estrellas para calificar tu viaje {"\n"}
            (5 es la mejor calificación)
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => handleStarPress(i)}>
                <Ionicons
                  name={i <= rating ? "star" : "star-outline"}
                  size={36}
                  color={i <= rating ? "#FFD600" : "#222"}
                  style={{ marginHorizontal: 2 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.title2}>¿Algo que quieras compartir?</Text>
          <Text style={styles.subtitle2}>
            Cuéntanos cómo fue el viaje o si tienes alguna sugerencia
          </Text>
          <TextInput
            style={styles.textarea}
            placeholder="Escribe tu comentario..."
            placeholderTextColor="#aaa"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={300}
          />
          <TouchableOpacity
            style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={isLoading || rating === 0}
          >
            {isLoading ? (
              <>
                <ActivityIndicator
                  color="#fff"
                  size="small"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.sendBtnText}>Enviando...</Text>
              </>
            ) : (
              <Text style={styles.sendBtnText}>Enviar</Text>
            )}
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
    marginBottom: 2,
    marginTop: 8,
    color: "#222",
  },
  subtitle: {
    color: "#444",
    fontSize: 13,
    marginBottom: 12,
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
  subtitle2: {
    color: "#444",
    fontSize: 13,
    marginBottom: 8,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 70,
    maxHeight: 120,
    marginBottom: 18,
    color: "#222",
    backgroundColor: "#fafafa",
    textAlignVertical: "top",
  },
  sendBtn: {
    backgroundColor: "#B84CF6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});

export default RatingModal;
