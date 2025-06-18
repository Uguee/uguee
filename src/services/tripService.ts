import { supabase } from '@/integrations/supabase/client';

export interface Trip {
  id_viaje: number;
  id_conductor: number;
  id_ruta: number;
  id_vehiculo: string;
  programado_at: string;
  salida_at: string | null;
  llegada_at: string | null;
  reseña?: number;
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
        .gte('programado_at', new Date().toISOString())
        .order('programado_at', { ascending: true });

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
      // Obtener los viajes que el usuario ha reservado
      const { data: userReservations, error: reservationsError } = await supabase
        .from('reserva')
        .select('id_viaje')
        .eq('id_usuario', userId);

      if (reservationsError) throw reservationsError;

      if (!userReservations || userReservations.length === 0) {
        return [];
      }

      // Obtener los viajes asociados a esas reservas
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
        .in('id_viaje', userReservations.map(r => r.id_viaje));

      if (tripsError) throw tripsError;

      return trips || [];
    } catch (error) {
      console.error('Error in getUserTrips:', error);
      throw error;
    }
  }

  static async findSimilarTrips(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, transportType?: string): Promise<Trip[]> {
    try {
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
          )
        `)
        .gte('programado_at', new Date().toISOString())
        .order('programado_at', { ascending: true });

      if (tripsError) throw tripsError;

      // Filter trips by transport type if specified
      let filteredTrips = trips || [];
      if (transportType) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.vehiculo?.tipo?.tipo.toLowerCase() === transportType.toLowerCase()
        );
      }

      // Get route details for each trip
      const tripsWithRoutes = await Promise.all(
        filteredTrips.map(async (trip) => {
          const { data: routeData, error: routeError } = await supabase
            .rpc('obtener_ruta_con_coordenadas', {
              p_id_ruta: trip.id_ruta
            });

          if (routeError) {
            console.error('Error fetching route details:', routeError);
            return null;
          }

          if (!routeData || routeData.length === 0) {
            return null;
          }

          return {
            ...trip,
            ruta: routeData[0]
          };
        })
      );

      // Filter out trips with no route data
      const validTrips = tripsWithRoutes.filter((trip): trip is Trip & { ruta: any } => trip !== null);

      // Calculate distance between points and filter by proximity
      const MAX_DISTANCE_KM = 2; // Maximum distance in kilometers to consider routes similar
      const filteredByProximity = validTrips.filter(trip => {
        if (!trip.ruta?.origen_coords || !trip.ruta?.destino_coords) return false;

        // Calculate distance between origin points
        const originDistance = this.calculateDistance(
          origin.lat,
          origin.lng,
          trip.ruta.origen_coords.y,
          trip.ruta.origen_coords.x
        );

        // Calculate distance between destination points
        const destinationDistance = this.calculateDistance(
          destination.lat,
          destination.lng,
          trip.ruta.destino_coords.y,
          trip.ruta.destino_coords.x
        );

        // Return true if both origin and destination are within the maximum distance
        return originDistance <= MAX_DISTANCE_KM && destinationDistance <= MAX_DISTANCE_KM;
      });

      return filteredByProximity;
    } catch (error) {
      console.error('Error in findSimilarTrips:', error);
      throw error;
    }
  }

  // Helper function to calculate distance between two points using the Haversine formula
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Helper function to convert degrees to radians
  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
} 