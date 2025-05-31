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
} 