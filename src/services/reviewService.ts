import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Resena = Database['public']['Tables']['reseña']['Row'];

export interface Review extends Resena {
  id_resena: number;
  calificacion: number;
  descripcion: string;
  id_viaje: number;
}

export interface TripReviewsResponse {
  promedio: number;
  total_resenas: number;
  resenas: Review[];
}

export class ReviewService {
  static async getTripReviews(id_viaje: number): Promise<TripReviewsResponse> {
    try {
      // Obtener todas las reseñas del viaje
      const { data: resenas, error } = await supabase
        .from('reseña')
        .select('*')
        .eq('id_viaje', id_viaje) as { data: Review[] | null, error: any };

      if (error) throw error;

      // Calcular promedio y total
      const total_resenas = resenas?.length || 0;
      const promedio = resenas?.length 
        ? resenas.reduce((acc, curr) => acc + (curr.calificacion || 0), 0) / total_resenas
        : 0;

      return {
        promedio,
        total_resenas,
        resenas: resenas || []
      };
    } catch (error) {
      console.error('Error obteniendo reseñas:', error);
      return {
        promedio: 0,
        total_resenas: 0,
        resenas: []
      };
    }
  }

  static async getDriverStats(id_conductor: number): Promise<{
    promedio: number;
    total_resenas: number;
  }> {
    try {
      // Primero obtenemos todos los viajes del conductor
      const { data: viajes, error: viajesError } = await supabase
        .from('viaje')
        .select('id_viaje')
        .eq('id_conductor', id_conductor);

      if (viajesError) throw viajesError;

      if (!viajes?.length) {
        return {
          promedio: 0,
          total_resenas: 0
        };
      }

      // Obtenemos todas las reseñas de esos viajes
      const { data: resenas, error: resenasError } = await supabase
        .from('reseña')
        .select('calificacion')
        .in('id_viaje', viajes.map(v => v.id_viaje));

      if (resenasError) throw resenasError;

      const total_resenas = resenas?.length || 0;
      const promedio = resenas?.length 
        ? resenas.reduce((acc, curr) => acc + (curr.calificacion || 0), 0) / total_resenas
        : 0;

      return {
        promedio,
        total_resenas
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del conductor:', error);
      return {
        promedio: 0,
        total_resenas: 0
      };
    }
  }
} 