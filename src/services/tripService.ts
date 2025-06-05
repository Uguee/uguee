import { supabase } from '@/integrations/supabase/client';

export interface Trip {
  id_viaje: number;
  id_conductor: number;
  id_ruta: number;
  id_vehiculo: string;
  fecha: string;
  hora_salida: string;
  hora_llegada: string;
  reseña: number;
  conductor: {
    nombre: string;
    apellido: string;
    celular: number;
  };
  vehiculo: {
    placa: string;
    color: string;
    modelo: number;
    tipo: {
      tipo: string;
    };
  };
}

export class TripService {
  static async getUpcomingTrips(): Promise<Trip[]> {
    try {
      const { data, error } = await supabase
        .from('viaje')
        .select(`
          *,
          conductor:id_conductor (
            nombre,
            apellido,
            celular
          ),
          vehiculo:id_vehiculo (
            placa,
            color,
            modelo,
            tipo:tipo (
              tipo
            )
          )
        `)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error fetching trips:', error);
        throw new Error(`Failed to fetch upcoming trips: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUpcomingTrips:', error);
      throw error;
    }
  }

  static async getUserTrips(userId: number): Promise<Trip[]> {
    try {
      // Obtener las rutas que el usuario ha reservado
      const { data: userRoutes, error: routesError } = await supabase
        .from('usuario_ruta')
        .select('id_ruta')
        .eq('id_usuario', userId);

      if (routesError) throw routesError;

      if (!userRoutes || userRoutes.length === 0) {
        return [];
      }

      // Obtener los viajes asociados a esas rutas
      const { data: trips, error: tripsError } = await supabase
        .from('viaje')
        .select(`
          *,
          conductor:id_conductor (
            nombre,
            apellido,
            celular
          ),
          vehiculo:id_vehiculo (
            placa,
            color,
            modelo,
            tipo:tipo (
              tipo
            )
          ),
          ruta:id_ruta (
            id_ruta,
            longitud,
            punto_partida,
            punto_llegada,
            trayecto
          )
        `)
        .in('id_ruta', userRoutes.map(r => r.id_ruta));

      if (tripsError) throw tripsError;

      return trips || [];
    } catch (error) {
      console.error('Error in getUserTrips:', error);
      throw error;
    }
  }
} 