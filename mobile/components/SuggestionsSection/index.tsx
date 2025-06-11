import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

interface Suggestion {
  label: string;
  onPress?: () => void;
}

interface SuggestionsSectionProps {
  suggestions: Suggestion[];
}

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  suggestions,
}) => {
  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={styles.title}>Sugerencias</Text>
      </View>
      {/* Lista horizontal de sugerencias */}
      <FlatList
        data={suggestions.slice(0, 2)}
        keyExtractor={(item) => item.label}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionCard}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.suggestionText}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
  },
  suggestionsList: {
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 45,
  },
  suggestionCard: {
    width: 120,
    height: 120,
    backgroundColor: "#A259FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  suggestionText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 19,
    textAlign: "center",
  },
});
