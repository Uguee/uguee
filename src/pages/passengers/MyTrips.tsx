import { useState, useEffect } from 'react';
import { Trip, Route } from '../../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';
import { useToast } from '../../hooks/use-toast';

const mockData = [
  {
    trip: {
      id: 'trip1',
      routeId: 'route1',
      userId: 'user1',
      status: 'confirmed',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      passengerCount: 1,
    } as Trip,
    route: {
      id: 'route1',
      origin: {
        name: 'Menga',
        coordinates: { lat: 3.4516, lng: -76.5320 }
      },
      destination: {
        name: 'Universidad del Valle',
        coordinates: { lat: 3.3750, lng: -76.5335 }
      },
      driverId: 'driver1',
      vehicleId: 'vehicle1',
      departureTime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      estimatedArrivalTime: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 30 * 60000).toISOString(),
      status: 'completed',
      capacity: 4,
      availableSeats: 3,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      transportType: 'car'
    } as Route
  },
  {
    trip: {
      id: 'trip2',
      routeId: 'route2',
      userId: 'user1',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      passengerCount: 2,
    } as Trip,
    route: {
      id: 'route2',
      origin: {
        name: 'Universidad del Valle',
        coordinates: { lat: 3.3750, lng: -76.5335 }
      },
      destination: {
        name: 'Centro Comercial Chipichape',
        coordinates: { lat: 3.4607, lng: -76.5252 }
      },
      driverId: 'driver2',
      vehicleId: 'vehicle2',
      departureTime: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
      estimatedArrivalTime: new Date(Date.now() + 1 * 24 * 3600 * 1000 + 25 * 60000).toISOString(),
      status: 'active',
      capacity: 4,
      availableSeats: 2,
      createdAt: new Date().toISOString(),
      transportType: 'car'
    } as Route
  },
  {
    trip: {
      id: 'trip3',
      routeId: 'route3',
      userId: 'user1',
      status: 'cancelled',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      passengerCount: 1,
    } as Trip,
    route: {
      id: 'route3',
      origin: {
        name: 'Jardín Plaza',
        coordinates: { lat: 3.3726, lng: -76.5382 }
      },
      destination: {
        name: 'Universidad del Valle',
        coordinates: { lat: 3.3750, lng: -76.5335 }
      },
      driverId: 'driver3',
      vehicleId: 'vehicle3',
      departureTime: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      estimatedArrivalTime: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 20 * 60000).toISOString(),
      status: 'cancelled',
      capacity: 4,
      availableSeats: 3,
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      transportType: 'car'
    } as Route
  },
];

const MyTrips = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<{trip: Trip, route: Route}[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // TODO: Implementar la llamada real a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrips(mockData);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError('No se pudieron cargar tus viajes. Por favor, intenta de nuevo más tarde.');
        toast({
          title: "Error",
          description: "No se pudieron cargar tus viajes. Por favor, intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchTrips();
    }
  }, [user, toast]);
  
  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'Fecha no disponible';
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch (err) {
      return 'Fecha no disponible';
    }
  };
  
  const formatTime = (isoDate?: string) => {
    if (!isoDate) return 'Hora no disponible';
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return 'Hora no disponible';
    }
  };
  
  // Filter trips based on active tab
  const filteredTrips = trips.filter(({ trip, route }) => {
    const departureDate = route.departureTime ? new Date(route.departureTime) : null;
    const now = new Date();
    
    switch(activeTab) {
      case 'upcoming':
        return departureDate && departureDate > now && trip.status !== 'cancelled';
      case 'past':
        return (
          (departureDate && departureDate < now && trip.status !== 'cancelled') || 
          route.status === 'completed'
        );
      case 'cancelled':
        return trip.status === 'cancelled' || route.status === 'cancelled';
      default:
        return true;
    }
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mis viajes</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'upcoming'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'past'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Historial
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'cancelled'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cancelados
          </button>
        </div>

        {/* Trips list */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tienes viajes {activeTab === 'upcoming' ? 'programados' : activeTab === 'past' ? 'en tu historial' : 'cancelados'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map(({ trip, route }) => (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {route.origin.name} → {route.destination.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(route.departureTime)} - {formatTime(route.departureTime)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    trip.status === 'confirmed' && route.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : trip.status === 'cancelled' || route.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {trip.status === 'confirmed' && route.status === 'active'
                      ? 'Confirmado'
                      : trip.status === 'cancelled' || route.status === 'cancelled'
                      ? 'Cancelado'
                      : 'Completado'}
                  </span>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {trip.passengerCount}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {trip.passengerCount} pasajero{trip.passengerCount !== 1 && 's'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {route.transportType === 'car' ? 'Carro' : 'Moto'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/routes/${route.id}`}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyTrips;