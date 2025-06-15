import { supabase } from '@/integrations/supabase/client';

export interface TripRequest {
  id_solicitud: number;
  id_ruta: number;
  id_pasajero: number;
  fecha: string;
  hora_salida: string;
  hora_llegada: string | null;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  created_at: string;
  // Additional fields we'll get from joins
  pasajero_nombre?: string;
  pasajero_apellido?: string;
  punto_partida?: any;
  punto_llegada?: any;
  longitud?: number;
}

export class TripRequestService {
  static async getPendingRequests(): Promise<TripRequest[]> {
    const { data, error } = await supabase
      .from('solicitud_viaje')
      .select(`
        *,
        ruta:ruta(
          punto_partida,
          punto_llegada,
          longitud
        ),
        pasajero:usuario(
          nombre,
          apellido
        )
      `)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }

    // Transform the data to match our interface
    return data.map(request => ({
      id_solicitud: request.id_solicitud,
      id_ruta: request.id_ruta,
      id_pasajero: request.id_pasajero,
      fecha: request.fecha,
      hora_salida: request.hora_salida,
      hora_llegada: request.hora_llegada,
      estado: request.estado as 'pendiente' | 'aceptada' | 'rechazada',
      created_at: request.created_at,
      pasajero_nombre: request.pasajero?.nombre,
      pasajero_apellido: request.pasajero?.apellido,
      punto_partida: request.ruta?.punto_partida,
      punto_llegada: request.ruta?.punto_llegada,
      longitud: request.ruta?.longitud
    }));
  }

  static async updateRequestStatus(requestId: number, status: 'aceptada' | 'rechazada'): Promise<void> {
    const { error } = await supabase
      .from('solicitud_viaje')
      .update({ estado: status })
      .eq('id_solicitud', requestId);

    if (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }
} 