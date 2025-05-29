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
  onSeeAll?: () => void;
}

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  suggestions,
  onSeeAll,
}) => {
  return (
    <View style={styles.container}>
      {/* Título y botón "Ver todo" */}
      <View style={styles.header}>
        <Text style={styles.title}>Sugerencias</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>Ver todo</Text>
        </TouchableOpacity>
      </View>
      {/* Lista horizontal de sugerencias */}
      <FlatList
        data={suggestions}
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
    fontSize: 16,
  },
  seeAll: {
    color: "#222",
    fontWeight: "500",
    fontSize: 13,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionCard: {
    width: 100,
    height: 100,
    backgroundColor: "#A259FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 35,
  },
  suggestionText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 19,
    textAlign: "center",
  },
});
