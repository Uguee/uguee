import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { TopMenu } from "../components/TopMenu";
import { BottomNavigation } from "../components/BottomNavigationBar";
import { InstitutionCard } from "../components/InstitutionCard";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import SearchBarInst from "../components/SearchBarInst";

interface InstitutionListScreenProps {
  onGoHome: () => void;
  onSelectInstitution: (institution: any) => void;
}

const institutions = [
  {
    name: "Universidad del Valle",
    logo: require("../assets/univalle-logo.png"),
  },
  {
    name: "Universidad del Valle",
    logo: require("../assets/univalle-logo.png"),
  },
  {
    name: "Universidad del Valle",
    logo: require("../assets/univalle-logo.png"),
  },
  {
    name: "Unversidad del Valle",
    logo: require("../assets/univalle-logo.png"),
  },
  {
    name: "Universidad del Valle",
    logo: require("../assets/univalle-logo.png"),
  },
  {
    name: "Universidad del Valle",
    logo: require("../assets/univalle-logo.png"),
  },
];

export default function InstitutionListScreen({
  onGoHome,
  onSelectInstitution,
}: InstitutionListScreenProps) {
  const [search, setSearch] = useState("");

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopMenu onMenuPress={() => {}} />
      <View style={styles.content}>
        <SearchBarInst value={search} onChangeText={setSearch} />
        <Text style={styles.title}>Instituciones disponibles</Text>
        <FlatList
          data={filteredInstitutions}
          keyExtractor={(item, index) => item.name + index}
          renderItem={({ item }) => (
            <InstitutionCard
              name={item.name}
              logo={item.logo}
              onPress={() => onSelectInstitution(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>
      <BottomNavigation
        buttons={[
          {
            label: "Inicio",
            icon: <Ionicons name="home-outline" size={28} color="#000" />,
            active: false,
            onPress: onGoHome,
          },
          {
            label: "Mis viajes",
            icon: (
              <MaterialIcons name="airport-shuttle" size={28} color="#000" />
            ),
            onPress: () => alert("Mis viajes"),
          },
          {
            label: "Servicios",
            icon: <Ionicons name="settings-outline" size={28} color="#000" />,
            onPress: () => alert("Servicios"),
          },
          {
            label: "Perfil",
            icon: <FontAwesome name="user-o" size={26} color="#000" />,
            onPress: () => alert("Perfil"),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
});
