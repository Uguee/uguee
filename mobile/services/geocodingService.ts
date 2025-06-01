export interface Location {
    lat: number;
    lng: number;
    address: string;
    city?: string;
  }
  
  export interface Route {
    coordinates: [number, number][];
    distance: number;
    duration: number;
  }
  
  export class GeocodingService {
    static async searchAddress(query: string, currentLocation?: Location): Promise<Location[]> {
      try {
        // Use OpenStreetMap Nominatim API for address search
        const response = await fetch(
          https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1
        );
        
        const data = await response.json();
        
        return data.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.display_name,
          city: item.address?.city || item.address?.town || item.address?.village
        }));
      } catch (error) {
        console.error('Error searching addresses:', error);
        return [];
      }
    }
  
    static async getRoute(origin: Location, destination: Location): Promise<Route | null> {
      try {
        // Use OSRM API for route calculation
        const response = await fetch(
          https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // Convert coordinates from [lng, lat] to [lat, lng] for consistency
          const coordinates: [number, number][] = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
          
          return {
            coordinates,
            distance: route.distance, // in meters
            duration: route.duration // in seconds
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error calculating route:', error);
        return null;
      }
    }
  
    static async reverseGeocode(lat: number, lng: number): Promise<Location | null> {
      try {
        // Use OpenStreetMap Nominatim API for reverse geocoding
        const response = await fetch(
          https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1
        );
        
        const data = await response.json();
        
        if (data && data.display_name) {
          return {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lon),
            address: data.display_name,
            city: data.address?.city || data.address?.town || data.address?.village
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
      }
    }
  }