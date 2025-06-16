import { supabase } from '@/integrations/supabase/client';

export interface TripRequest {
  id_solicitud: number;
  fecha: string;
  hora_salida: string;
  hora_llegada: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  created_at: string;
  ruta: {
    id_ruta: number;
    punto_partida: any;
    punto_llegada: any;
    trayecto: any;
    longitud: number;
  };
  pasajero: {
    nombre: string;
    apellido: string;
  };
  pasajero_nombre: string;
  pasajero_apellido: string;
  punto_partida: any;
  punto_llegada: any;
  longitud: number;
}

export class TripRequestService {
  static async getPendingRequests(): Promise<TripRequest[]> {
    const { data, error } = await supabase
      .from('solicitud_viaje')
      .select(`
        id_solicitud,
        fecha,
        hora_salida,
        hora_llegada,
        estado,
        created_at,
        ruta!inner (
          id_ruta,
          punto_partida,
          punto_llegada,
          trayecto,
          longitud
        ),
        pasajero:usuario!solicitud_viaje_id_pasajero_fkey (
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

    return data.map(request => ({
      ...request,
      pasajero_nombre: request.pasajero?.nombre || '',
      pasajero_apellido: request.pasajero?.apellido || '',
      punto_partida: request.ruta?.punto_partida,
      punto_llegada: request.ruta?.punto_llegada,
      longitud: request.ruta?.longitud,
      estado: request.estado as 'pendiente' | 'aceptada' | 'rechazada'
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