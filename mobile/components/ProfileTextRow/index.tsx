import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface ProfileTextRowProps {
  label: string;
  value: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  horizontal?: boolean;
}

const ProfileTextRow: React.FC<ProfileTextRowProps> = ({
  label,
  value,
  style,
  labelStyle,
  valueStyle,
  horizontal = false,
}) => {
  return (
    <View style={[styles.row, horizontal && styles.horizontal, style]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontWeight: "bold",
    color: "#111",
    fontSize: 15,
  },
  value: {
    color: "#222",
    fontSize: 15,
    marginLeft: 4,
  },
});

export default ProfileTextRow;
