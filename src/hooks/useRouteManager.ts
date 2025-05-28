import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { coordsToPointWKT, coordsToLineStringWKT, calculateRouteLength } from '../lib/postgis';

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
      
      // Convertir coordenadas a formato PostGIS WKT
      const puntoPartidaWKT = coordsToPointWKT(origin.lat, origin.lng);
      const puntoLlegadaWKT = coordsToPointWKT(destination.lat, destination.lng);
      const trayectoWKT = coordsToLineStringWKT(path);
      
      // Calcular longitud de la ruta
      const longitud = calculateRouteLength(path);

      // Insertar en la base de datos usando funciones PostGIS
      const { data, error } = await supabase.rpc('insertar_ruta', {
        p_longitud: longitud,
        p_punto_partida_wkt: puntoPartidaWKT,
        p_punto_llegada_wkt: puntoLlegadaWKT,
        p_trayecto_wkt: trayectoWKT
      });

      if (error) {
        throw error;
      }

      console.log('Ruta guardada exitosamente:', data);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
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
      const { data, error } = await supabase.rpc('obtener_rutas_con_coordenadas');

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener rutas';
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
    error
  };
}; 