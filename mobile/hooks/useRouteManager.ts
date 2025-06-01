import { useState } from "react";
import { supabase } from "../src/lib/supabase";
import { calculateRouteLength } from "../src/lib/postgis";

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

interface SaveRouteData {
  origin: RoutePoint;
  destination: RoutePoint;
  path: [number, number][];
  driverId: number; // ID del conductor que crea la ruta
}

export const useRouteManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Guarda una nueva ruta en la base de datos
   */
  const saveRoute = async (routeData: SaveRouteData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { origin, destination, path } = routeData;
      const longitud = calculateRouteLength(path);

      // Insertar directamente usando el formato que PostGIS entiende
      const { data, error } = await supabase
        .from("ruta")
        .insert({
          longitud: longitud,
          punto_partida: POINT(${origin.lng} ${origin.lat}),
          punto_llegada: POINT(${destination.lng} ${destination.lat}),
          trayecto: `LINESTRING(${path
            .map(([lat, lng]) => ${lng} ${lat})
            .join(", ")})`,
        })
        .select("id_ruta") // Solo seleccionar el ID que necesitamos
        .single(); // Obtener un solo resultado en lugar de array

      if (error) throw error;

      console.log("Ruta guardada:", data); // Para debug
      return data; // Ahora devuelve { id_ruta: number }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene todas las rutas de la base de datos
   */
  const fetchRoutes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Usamos funciones PostGIS para obtener las coordenadas en formato legible
      const { data, error } = await supabase.rpc(
        "obtener_rutas_con_coordenadas"
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al obtener rutas";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveRoute,
    fetchRoutes,
    isLoading,
    error,
  };
};