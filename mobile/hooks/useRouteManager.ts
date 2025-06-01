import { useState } from "react";
import { supabase } from "../lib/supabaseclient";
import {
  calculateRouteLength,
  coordsToPointWKT,
  coordsToLineStringWKT,
} from "../lib/postgis";

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
          punto_partida: coordsToPointWKT(origin.lat, origin.lng),
          punto_llegada: coordsToPointWKT(destination.lat, destination.lng),
          trayecto: coordsToLineStringWKT(path),
        })
        .select("id_ruta")
        .single();

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

  /**
   * Crea la relación entre usuario y ruta en la tabla usuario_ruta
   */
  const createUserRouteRelation = async (
    id_usuario: number,
    id_ruta: number
  ) => {
    try {
      const { data, error } = await supabase
        .from("usuario_ruta")
        .insert({ id_usuario, id_ruta });
      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error creando relación usuario-ruta";
      setError(errorMessage);
      throw err;
    }
  };

  return {
    saveRoute,
    fetchRoutes,
    createUserRouteRelation,
    isLoading,
    error,
  };
};
