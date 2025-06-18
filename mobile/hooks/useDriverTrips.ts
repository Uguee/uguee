import { useEffect, useState } from "react";
import { getDriverTrips, Trip } from "../services/tripServices";
import { getCedulaByUUID } from "../services/userDataService";
import { getCurrentToken } from "../services/authService";
import { useAuth } from "./useAuth";
import { getRouteById } from "../services/routeService";

// Función para filtrar y mostrar solo los datos relevantes de la dirección
function filtrarDireccion(direccion: string): string {
  if (!direccion) return "";
  const partes = direccion.split(",").map((p) => p.trim());
  // Palabras clave para identificar los campos relevantes
  const claves = [
    "colegio",
    "escuela",
    "universidad",
    "calle",
    "carrera",
    "avenida",
    "cll",
    "cra",
    "villa",
    "barrio",
    "neighbourhood",
    "comuna",
    "cali",
    "colombia",
  ];
  let resultado: string[] = [];
  if (partes.length > 0) resultado.push(partes[0]);
  if (partes.length > 1) resultado.push(partes[1]);
  for (let i = 2; i < partes.length; i++) {
    const parte = partes[i].toLowerCase();
    if (
      claves.some((clave) => parte.includes(clave)) &&
      !resultado.includes(partes[i])
    ) {
      resultado.push(partes[i]);
    }
  }
  resultado = [...new Set(resultado)].filter(
    (p) => !/comuna 8/i.test(p) && !/perímetro urbano/i.test(p)
  );
  return resultado.join(", ");
}

// Extender la interfaz Trip para incluir el campo ruta_nombre
interface TripWithRouteName extends Trip {
  ruta_nombre: string;
}

export function useDriverTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripWithRouteName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los detalles de una ruta específica
  const loadRouteDetails = async (tripId: number) => {
    const trip = trips.find((t) => t.id_viaje === tripId);
    if (!trip || trip.ruta) return trip; // Si ya tiene los detalles, no los cargamos de nuevo

    try {
      const rutaResponse = await getRouteById(trip.id_ruta, 0);
      if (rutaResponse.success === false) {
        console.error(
          `Error al obtener ruta ${trip.id_ruta}:`,
          rutaResponse.error
        );
        return trip;
      }
      const ruta = rutaResponse.data;
      if (ruta && ruta.nombre_partida && ruta.nombre_llegada) {
        const ruta_nombre = `${filtrarDireccion(
          ruta.nombre_partida
        )} ➔ ${filtrarDireccion(ruta.nombre_llegada)}`;
        const updatedTrip = { ...trip, ruta, ruta_nombre };

        // Actualizamos el viaje en el estado
        setTrips((prevTrips) =>
          prevTrips.map((t) => (t.id_viaje === tripId ? updatedTrip : t))
        );

        return updatedTrip;
      }
    } catch (e) {
      console.error("Error cargando detalles de la ruta:", e);
    }
    return trip;
  };

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      setTrips([]);
      try {
        if (!user?.id) throw new Error("No hay usuario autenticado");
        const id_usuario = await getCedulaByUUID(user.id);
        if (!id_usuario)
          throw new Error("No se pudo obtener la cédula del usuario");
        const token = getCurrentToken();
        if (!token) throw new Error("No se encontró un token JWT válido");

        const viajes = await getDriverTrips(id_usuario, token);

        // Procesar los viajes para agregar nombres de ruta formateados
        const viajesProcesados = viajes.map((viaje) => ({
          ...viaje,
          ruta_nombre: `${filtrarDireccion(
            viaje.ruta.nombre_partida || ""
          )} ➔ ${filtrarDireccion(viaje.ruta.nombre_llegada || "")}`,
        }));

        setTrips(viajesProcesados);
      } catch (err: any) {
        setError(err.message || "Error al obtener los viajes");
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchTrips();
  }, [user?.id]);

  return { trips, loading, error, loadRouteDetails };
}
