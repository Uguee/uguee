import { supabase } from '@/integrations/supabase/client';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

export class GeocodingService {
  static async searchAddress(query: string): Promise<Location[]> {
    try {
      const { data, error } = await supabase.rpc('search_addresses', {
        search_query: query
      });

      if (error) throw error;

      return data.map((item: any) => ({
        lat: item.lat,
        lng: item.lng,
        address: item.address
      }));
    } catch (error) {
      console.error('Error searching addresses:', error);
      return [];
    }
  }

  static async getRoute(origin: Location, destination: Location): Promise<Route | null> {
    try {
      const { data, error } = await supabase.rpc('calculate_route', {
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        dest_lat: destination.lat,
        dest_lng: destination.lng
      });

      if (error) throw error;

      return {
        coordinates: data.coordinates,
        distance: data.distance,
        duration: data.duration
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      return null;
    }
  }
} 