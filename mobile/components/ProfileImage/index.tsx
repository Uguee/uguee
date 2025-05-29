import React from "react";
import { View, Image, StyleSheet } from "react-native";

interface ProfileImageProps {
  source: any;
  size?: number;
  backgroundColor?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  source,
  size = 140,
  backgroundColor = "#B84CF6",
}) => {
  return (
    <View
      style={[
        styles.square,
        {
          width: size,
          height: size,
          borderRadius: 28,
          backgroundColor,
        },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={source}
          style={{
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: 16,
            resizeMode: "contain",
            backgroundColor: "transparent",
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  square: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    alignSelf: "center",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});

export default ProfileImage;
