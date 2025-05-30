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

export const TripService = {
  async getUpcomingTrips(): Promise<Trip[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      console.log('Fetching trips from:', 'https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-upcoming-trips');
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-upcoming-trips', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        if (response.status === 404) {
          return []; // Return empty array if no trips found
        }
        throw new Error(`Failed to fetch upcoming trips: ${response.status} ${responseText}`);
      }

      const trips = JSON.parse(responseText);
      return trips;
    } catch (error) {
      console.error('Error details:', error);
      throw error;
    }
  }
}; 