import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { TopMenu } from "../components/DriverTopMenu";
import { SearchBar } from "../components/SearchBar";
import TripCompletedCard from "../components/TripCompletedCard";
import TripScheduledCard from "../components/TripScheduledCard";
import DriverTripButton from "../components/DriverTripButton";
import { DriverHomeBottomMenu } from "../components/DriverHomeBottomMenu";
import TripCompletedDetailsModal from "../components/TripCompletedDetailsModal";
import TripScheduledDetailsModal from "../components/TripScheduledDetailsModal";
import { useDriverTrips } from "../hooks/useDriverTrips";
import { getRouteById } from "../services/routeService";

function formatPlaceName(nombre: string | null): string {
  if (!nombre) return "";
  const partes = nombre.split(",").map((p) => p.trim());
  // Tomar las primeras 3 partes y añadir "Cali"
  return `${partes.slice(0, 3).join(", ")}, Cali`;
}

const FILTERS = [
  { label: "Terminado", value: "completed" },
  { label: "Programado", value: "scheduled" },
  { label: "Todos", value: "all" },
];

const DriverMyTripsScreen = ({
  onGoToHomeScreen = () => {},
  onGoToMyVehicles = () => {},
  onGoToProfile = () => {},
  onGoToCreateTripScreen = () => {},
  onStartTripScreen = (_trip: any) => {},
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterModal, setFilterModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showScheduledModal, setShowScheduledModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  // Elimina el array TRIPS y usa los viajes reales
  const { trips, loading, error } = useDriverTrips();
  console.log("[DriverMyTripsScreen] trips:", trips);

  // Log para verificar el orden original
  if (trips.length > 0) {
    console.log("[DriverMyTripsScreen] Orden original de viajes:");
    trips.slice(0, 3).forEach((trip, index) => {
      console.log(
        `${index + 1}. Viaje ${trip.id_viaje} - ${trip.programado_at} - ${
          trip.estado
        }`
      );
    });
  }

  const handleSelectTrip = async (trip: any) => {
    // Usar directamente los datos del viaje que ya vienen de la edge function
    setSelectedTrip(trip);
    setShowScheduledModal(true);
  };

  // Filtrado por estado
  let filteredTrips =
    filter === "all"
      ? trips
      : trips.filter((trip) =>
          filter === "completed"
            ? trip.estado === "completado"
            : trip.estado !== "completado"
        );

  // Filtrado por búsqueda
  filteredTrips = filteredTrips.filter((trip: any) => {
    const routeName =
      trip.ruta?.nombre_partida && trip.ruta?.nombre_llegada
        ? `${formatPlaceName(trip.ruta.nombre_partida)} ➔ ${formatPlaceName(
            trip.ruta.nombre_llegada
          )}`
        : `Ruta ${trip.id_ruta}`;
    return routeName.toLowerCase().includes(search.toLowerCase());
  });

  // Ordenar por fecha programada (más recientes primero)
  console.log("[DriverMyTripsScreen] Antes del sort - primeros 3 viajes:");
  filteredTrips.slice(0, 3).forEach((trip, index) => {
    console.log(
      `${index + 1}. Viaje ${trip.id_viaje} - ${trip.programado_at} - ${
        trip.estado
      }`
    );
  });

  filteredTrips.sort((a, b) => {
    const dateA = new Date(a.programado_at);
    const dateB = new Date(b.programado_at);
    const diff = dateB.getTime() - dateA.getTime(); // Descendente (más reciente primero)

    console.log(
      `[Sort] Comparando: Viaje ${
        a.id_viaje
      } (${dateA.toISOString()}) vs Viaje ${
        b.id_viaje
      } (${dateB.toISOString()}) = ${diff}`
    );

    return diff;
  });

  // Log para verificar el orden después del sort
  console.log("[DriverMyTripsScreen] Después del sort - primeros 3 viajes:");
  filteredTrips.slice(0, 3).forEach((trip, index) => {
    console.log(
      `${index + 1}. Viaje ${trip.id_viaje} - ${trip.programado_at} - ${
        trip.estado
      }`
    );
  });

  const canStartTrip = (trip: any) => {
    // Permitir iniciar viajes pendientes y programados si están cerca de la hora
    if (trip.estado !== "pendiente" && trip.estado !== "programado")
      return false;

    // Verificar si la fecha/hora actual está cerca de la hora programada
    const now = new Date();
    const tripDate = new Date(trip.programado_at);
    const diffInMinutes = Math.abs(
      (tripDate.getTime() - now.getTime()) / (1000 * 60)
    );

    // Log para debuggear
    console.log(`[canStartTrip] Viaje ${trip.id_viaje}:`, {
      estado: trip.estado,
      programado_at: trip.programado_at,
      hora_actual: now.toISOString(),
      diffInMinutes: diffInMinutes,
      puedeIniciar: diffInMinutes <= 30,
    });

    // Permitir iniciar el viaje si estamos dentro de los 30 minutos antes o después de la hora programada
    return diffInMinutes <= 30;
  };

  const handleStartTrip = async (trip: any) => {
    console.log("[DriverMyTripsScreen] handleStartTrip - trip:", trip);
    console.log(
      "[DriverMyTripsScreen] onStartTripScreen function:",
      typeof onStartTripScreen
    );

    // Pasa el objeto trip completo
    onStartTripScreen(trip);
  };

  const renderTrip = ({ item }: { item: any }) => {
    // Usar el estado que viene de la edge function
    const estado = item.estado;

    if (estado === "completado") {
      // Completado - sin color de reborde
      return (
        <TripCompletedCard
          route={
            formatPlaceName(item.ruta?.nombre_partida) +
              " ➔ " +
              formatPlaceName(item.ruta?.nombre_llegada) || `${item.id_ruta}`
          }
          passengers={item.pasajeros || 0}
          onPress={() => {
            setSelectedTrip(item);
            setShowCompletedModal(true);
          }}
        />
      );
    } else if (estado === "en-curso") {
      // En curso
      return (
        <View
          style={{
            borderRadius: 12,
            marginBottom: 8,
            marginHorizontal: 12,
            padding: 2,
          }}
        >
          <TripScheduledCard
            trip={item}
            onPress={() => {
              handleSelectTrip(item);
            }}
            canStartTrip={false} // No se puede iniciar si ya está en curso
            onStartTrip={() => {}}
          />
        </View>
      );
    } else if (estado === "pendiente") {
      // Pendiente
      return (
        <View
          style={{
            borderRadius: 12,
            marginBottom: 8,
            marginHorizontal: 12,
            padding: 2,
          }}
        >
          <TripScheduledCard
            trip={item}
            onPress={() => {
              handleSelectTrip(item);
            }}
            canStartTrip={canStartTrip(item)}
            onStartTrip={() => {
              handleStartTrip(item);
            }}
          />
        </View>
      );
    } else {
      // Programado
      return (
        <View
          style={{
            borderRadius: 12,
            marginBottom: 8,
            marginHorizontal: 12,
            padding: 2,
          }}
        >
          <TripScheduledCard
            trip={item}
            onPress={() => {
              handleSelectTrip(item);
            }}
            canStartTrip={canStartTrip(item)} // Permitir iniciar si está cerca de la hora
            onStartTrip={() => {
              handleStartTrip(item);
            }}
          />
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Top menu */}
      <TopMenu />
      {/* Search bar y filtro */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 12,
          marginTop: 8,
        }}
      >
        <View style={{ flex: 1 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Busca tus viajes creados"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>Filtrar estado</Text>
        </TouchableOpacity>
      </View>
      {/* Modal de filtro */}
      <Modal
        visible={filterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setFilterModal(false)}
        >
          <View style={styles.filterModal}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={styles.filterOption}
                onPress={() => {
                  setFilter(f.value);
                  setFilterModal(false);
                }}
              >
                <Text style={styles.filterOptionText}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Lista de viajes */}
      <Text style={styles.sectionTitle}>Viajes creados</Text>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#A259FF" />
          <Text style={{ textAlign: "center", color: "#A259FF", marginTop: 8 }}>
            Cargando viajes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id_viaje.toString()}
          renderItem={renderTrip}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      {error && (
        <Text style={{ textAlign: "center", color: "red" }}>{error}</Text>
      )}
      {/* Botón de crear viaje */}
      <View style={styles.createButtonContainer} pointerEvents="box-none">
        <DriverTripButton onPress={onGoToCreateTripScreen} />
      </View>
      {/* Modales de detalles */}
      <TripCompletedDetailsModal
        visible={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        route={
          selectedTrip?.ruta?.nombre_partida &&
          selectedTrip?.ruta?.nombre_llegada
            ? `${formatPlaceName(
                selectedTrip.ruta.nombre_partida
              )} ➔ ${formatPlaceName(selectedTrip.ruta.nombre_llegada)}`
            : `Ruta ${selectedTrip?.id_ruta}`
        }
        address={formatPlaceName(selectedTrip?.ruta?.nombre_partida)}
        departureDate={
          selectedTrip?.programado_at
            ? new Date(selectedTrip.programado_at).toLocaleDateString("es-CO")
            : "No disponible"
        }
        departureTime={
          selectedTrip?.programado_at
            ? new Date(selectedTrip.programado_at).toLocaleTimeString("es-CO")
            : "No disponible"
        }
        arrivalDate={
          selectedTrip?.llegada_at
            ? new Date(selectedTrip.llegada_at).toLocaleDateString("es-CO")
            : "No disponible"
        }
        arrivalTime={
          selectedTrip?.llegada_at
            ? new Date(selectedTrip.llegada_at).toLocaleTimeString("es-CO")
            : "No disponible"
        }
        passengers={selectedTrip?.pasajeros || 0}
      />
      <TripScheduledDetailsModal
        visible={showScheduledModal}
        onClose={() => setShowScheduledModal(false)}
        pickupPlace={formatPlaceName(selectedTrip?.ruta?.nombre_partida)}
        destinationPlace={formatPlaceName(selectedTrip?.ruta?.nombre_llegada)}
        departureDate={
          selectedTrip?.programado_at
            ? new Date(selectedTrip.programado_at).toLocaleDateString("es-CO")
            : "No disponible"
        }
        departureTime={
          selectedTrip?.programado_at
            ? new Date(selectedTrip.programado_at).toLocaleTimeString("es-CO")
            : "No disponible"
        }
        onStartTrip={() => {
          if (selectedTrip) {
            handleStartTrip(selectedTrip);
            setShowScheduledModal(false);
          }
        }}
      />
      {/* Menú inferior */}
      <DriverHomeBottomMenu
        onGoToProfile={onGoToProfile}
        onGoToHome={onGoToHomeScreen}
        onGoToMyVehicles={onGoToMyVehicles}
        onGoToMyTrips={() => {}}
        activeButton="trips"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    backgroundColor: "#B84CF6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 12,
    marginLeft: 16,
    color: "#222",
  },
  createButtonContainer: {
    position: "absolute",
    right: 16,
    bottom: 70,
    zIndex: 2,
    backgroundColor: "transparent",
    alignItems: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  filterModal: {
    backgroundColor: "#F5E9FF",
    borderRadius: 10,
    marginTop: 80,
    marginRight: 20,
    paddingVertical: 8,
    width: 140,
    elevation: 5,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  filterOptionText: {
    fontSize: 15,
    color: "#7C3AED",
  },
});

export default DriverMyTripsScreen;
