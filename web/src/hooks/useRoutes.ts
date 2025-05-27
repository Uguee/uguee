
import { useState, useEffect } from 'react';
import { Route } from '../types';

interface UseRoutesOptions {
  origin?: string;
  destination?: string;
  transportType?: 'car' | 'bus' | 'bike' | 'walk';
}

export const useRoutes = (options?: UseRoutesOptions) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchRoutes = async (
    origin: string,
    destination: string,
    transportType?: 'car' | 'bus' | 'bike' | 'walk'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock routes data - in reality would be filtered based on parameters
      const mockRoutes: Route[] = [
        {
          id: 'route1',
          origin: {
            name: origin || 'Tu ubicación',
            coordinates: { lat: 3.4516, lng: -76.5320 }
          },
          destination: {
            name: destination || 'Universidad del Valle',
            coordinates: { lat: 3.3750, lng: -76.5335 }
          },
          stops: [
            {
              name: 'Estación Menga',
              coordinates: { lat: 3.4786, lng: -76.5080 }
            },
            {
              name: 'Chipichape',
              coordinates: { lat: 3.4607, lng: -76.5252 }
            }
          ],
          driverId: 'driver1',
          vehicleId: 'vehicle1',
          departureTime: new Date(Date.now() + 20 * 60000).toISOString(),
          estimatedArrivalTime: new Date(Date.now() + 50 * 60000).toISOString(),
          status: 'active',
          capacity: 4,
          availableSeats: 2,
          createdAt: new Date().toISOString(),
          transportType: transportType || 'car'
        },
        {
          id: 'route2',
          origin: {
            name: origin || 'Tu ubicación',
            coordinates: { lat: 3.4516, lng: -76.5320 }
          },
          destination: {
            name: destination || 'Universidad del Valle',
            coordinates: { lat: 3.3750, lng: -76.5335 }
          },
          driverId: 'driver2',
          vehicleId: 'vehicle2',
          departureTime: new Date(Date.now() + 35 * 60000).toISOString(),
          estimatedArrivalTime: new Date(Date.now() + 65 * 60000).toISOString(),
          status: 'active',
          capacity: 4,
          availableSeats: 3,
          createdAt: new Date().toISOString(),
          transportType: transportType || 'car'
        }
      ];

      setRoutes(mockRoutes);
    } catch (err) {
      console.error('Route search failed:', err);
      setError('Error buscando rutas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options?.origin && options?.destination) {
      searchRoutes(options.origin, options.destination, options.transportType);
    } else {
      setIsLoading(false);
    }
  }, [options?.origin, options?.destination, options?.transportType]);

  return {
    routes,
    isLoading,
    error,
    searchRoutes,
  };
};
