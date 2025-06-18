import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { TopMenu } from "../components/TopMenu";
import { HomeBottomMenu } from "../components/HomeBottomMenu";
import { InstitutionCard } from "../components/InstitutionCard";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import SearchBarInst from "../components/SearchBarInst";
import { useInstitutions } from "../hooks/useInstitutions";

interface InstitutionListScreenProps {
  onGoHome: () => void;
  onSelectInstitution: (institution: any) => void;
  onGoToMyTripsScreen?: () => void;
}

export default function InstitutionListScreen({
  onGoHome,
  onSelectInstitution,
  onGoToMyTripsScreen,
}: InstitutionListScreenProps) {
  const [search, setSearch] = useState("");
  const { institutions, loading, error } = useInstitutions();

  // Filtrar por nombre oficial
  const filteredInstitutions = institutions.filter((inst) =>
    inst.nombre_oficial.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <View style={styles.content}>
        <SearchBarInst value={search} onChangeText={setSearch} />
        <Text style={styles.title}>Instituciones disponibles</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#900"
            style={{ marginTop: 30 }}
          />
        ) : error ? (
          <Text style={{ color: "red", marginTop: 30 }}>Error: {error}</Text>
        ) : (
          <FlatList
            data={filteredInstitutions}
            keyExtractor={(item, index) =>
              item.id_institucion?.toString() || index.toString()
            }
            renderItem={({ item }) => {
              // Si hay logo, usa la URL; si no, usa la imagen local por defecto
              const logoSource = item.logo
                ? {
                    uri: `https://ezuujivxstyuziclhvhp.supabase.co/storage/v1/object/public/logos/${item.logo}`,
                  }
                : require("../assets/univalle-logo.png");

              return (
                <InstitutionCard
                  name={item.nombre_oficial}
                  logo={logoSource}
                  onPress={() => onSelectInstitution(item)}
                />
              );
            }}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>
      <HomeBottomMenu
        onGoToProfile={() => {}}
        onGoToHome={onGoHome}
        onGoToMyTrips={onGoToMyTripsScreen ?? (() => {})}
        activeButton="home"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 12,
    color: "#222",
  },
});
