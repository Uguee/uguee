import { useState, useEffect } from 'react';
import { Route } from '../types';

interface UseRoutesOptions {
  origin?: string;
  destination?: string;
  transportType?: string;
}

export const useRoutes = (options?: UseRoutesOptions) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchRoutes = async (origin: string, destination: string, transportType: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockRoutes: Route[] = [
        {
          id: 'route1',
          origin: {
            name: origin,
            coordinates: { lat: 3.4516, lng: -76.5320 }
          },
          destination: {
            name: destination,
            coordinates: { lat: 3.3750, lng: -76.5335 }
          },
          stops: [],
          driverId: 'driver1',
          vehicleId: 'vehicle1',
          departureTime: new Date(Date.now() + 20 * 60000).toISOString(),
          estimatedArrivalTime: new Date(Date.now() + 50 * 60000).toISOString(),
          status: 'active',
          capacity: 4,
          availableSeats: 3,
          createdAt: new Date().toISOString(),
          transportType
        },
        {
          id: 'route2',
          origin: {
            name: origin,
            coordinates: { lat: 3.4516, lng: -76.5320 }
          },
          destination: {
            name: destination,
            coordinates: { lat: 3.3750, lng: -76.5335 }
          },
          stops: [],
          driverId: 'driver2',
          vehicleId: 'vehicle2',
          departureTime: new Date(Date.now() + 35 * 60000).toISOString(),
          estimatedArrivalTime: new Date(Date.now() + 65 * 60000).toISOString(),
          status: 'active',
          capacity: 4,
          availableSeats: 2,
          createdAt: new Date().toISOString(),
          transportType
        }
      ];

      setRoutes(mockRoutes);
      return mockRoutes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al buscar rutas";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options?.origin && options?.destination) {
      searchRoutes(options.origin, options.destination, options.transportType || 'car');
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
