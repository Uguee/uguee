
import { useState, useEffect } from 'react';
import { Route, Driver, Vehicle, Trip } from '../types';

interface RouteDetails {
  route: Route | null;
  driver: Driver | null;
  vehicle: Vehicle | null;
  userTrip: Trip | null;
}

export const useRouteDetail = (routeId: string | undefined) => {
  const [details, setDetails] = useState<RouteDetails>({
    route: null,
    driver: null,
    vehicle: null,
    userTrip: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRouteDetails = async () => {
      if (!routeId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        const mockRoute: Route = {
          id: routeId,
          origin: {
            name: 'Tu ubicación',
            coordinates: { lat: 3.4516, lng: -76.5320 }
          },
          destination: {
            name: 'Universidad del Valle',
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
          transportType: 'car'
        };

        const mockDriver: Driver = {
          id: 'driver1',
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          email: 'carlos@universidad.edu.co',
          phoneNumber: '3001234567',
          role: 'driver',
          createdAt: new Date().toISOString(),
          isApproved: true,
          rating: 4.8,
          reviewCount: 42,
          vehicles: [],
          activeRoutes: [],
          institutionId: 'univ-001'
        };

        const mockVehicle: Vehicle = {
          id: 'vehicle1',
          driverId: 'driver1',
          model: 'Toyota Corolla',
          year: 2020,
          licensePlate: 'ABC123',
          color: 'Blanco',
          capacity: 4,
          isApproved: true,
          documents: {
            soat: true,
            technicalReview: true,
            insurance: true,
          },
          createdAt: new Date().toISOString(),
        };

        // Mock user trip (if user has booked this route)
        const mockTrip: Trip | null = null; // No trip booked yet

        setDetails({
          route: mockRoute,
          driver: mockDriver,
          vehicle: mockVehicle,
          userTrip: mockTrip,
        });
      } catch (err) {
        console.error('Failed to fetch route details:', err);
        setError('Error cargando detalles de ruta');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteDetails();
  }, [routeId]);

  const bookTrip = async (passengerCount: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock booking a trip
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        routeId: routeId || '',
        userId: 'current-user-id',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        passengerCount,
      };

      setDetails(prev => ({
        ...prev,
        userTrip: newTrip,
        route: prev.route ? {
          ...prev.route,
          availableSeats: (prev.route.availableSeats - passengerCount)
        } : null
      }));

      return newTrip;
    } catch (err) {
      console.error('Failed to book trip:', err);
      setError('Error reservando viaje');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelTrip = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update state to reflect cancellation
      setDetails(prev => {
        if (!prev.userTrip || !prev.route) return prev;
        
        return {
          ...prev,
          userTrip: {
            ...prev.userTrip,
            status: 'cancelled'
          },
          route: {
            ...prev.route,
            availableSeats: prev.route.availableSeats + (prev.userTrip?.passengerCount || 1)
          }
        };
      });
    } catch (err) {
      console.error('Failed to cancel trip:', err);
      setError('Error cancelando reserva');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...details,
    isLoading,
    error,
    bookTrip,
    cancelTrip,
  };
};
