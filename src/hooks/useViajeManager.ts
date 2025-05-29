import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface RouteData {
  id_ruta: number;
  longitud: number;
  // Agregar más campos según necesites
}

interface ViajeData {
  id_ruta: number;
  id_conductor: number;
  id_vehiculo: string;
  fecha: string;
  hora_salida: string;
  hora_llegada: string;
  reseña?: number;
}

export const useViajeManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene todas las rutas disponibles para el conductor
   */
  const fetchRutasDisponibles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('ruta')
        .select('id_ruta, longitud')
        .order('id_ruta', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener rutas';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crear un nuevo viaje
   */
  const crearViaje = async (viajeData: ViajeData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('viaje')
        .insert({
          id_ruta: viajeData.id_ruta,
          id_conductor: viajeData.id_conductor,
          id_vehiculo: viajeData.id_vehiculo,
          fecha: viajeData.fecha,
          hora_salida: viajeData.hora_salida,
          hora_llegada: viajeData.hora_llegada,
          reseña: 1
        })
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear viaje';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchRutasDisponibles,
    crearViaje,
    isLoading,
    error
  };
}; 