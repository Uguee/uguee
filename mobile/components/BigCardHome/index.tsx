import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";

interface BigCardProps {
  image: ImageSourcePropType;
  title: string;
  description: string;
  onPress?: () => void;
}

export const BigCard: React.FC<BigCardProps> = ({
  image,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#222",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    backgroundColor: "#A259FF",
    borderRadius: 16,
    padding: 0,
    marginRight: 16,
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  image: {
    width: 110,
    height: 110,
    marginTop: -10,
    marginLeft: -10,
    zIndex: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    color: "#444",
    fontSize: 14,
  },
});
