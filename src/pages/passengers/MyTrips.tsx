import { useState, useEffect } from 'react';
import { Trip, Route } from '../../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
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
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Mis viajes</h1>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pasados
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelados
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Cargando tus viajes...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes viajes {activeTab === 'upcoming' ? 'próximos' : activeTab === 'past' ? 'pasados' : 'cancelados'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'upcoming'
                  ? 'Busca y reserva un viaje para comenzar.'
                  : activeTab === 'past'
                  ? 'Tus viajes completados aparecerán aquí.'
                  : 'Los viajes que canceles aparecerán aquí.'}
              </p>
              {activeTab === 'upcoming' && (
                <Link
                  to="/search-routes"
                  className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-hover"
                >
                  Buscar rutas
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrips.map(({ trip, route }) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-1">
                        <span className="font-medium mr-2">
                          {formatDate(route.departureTime)}
                        </span>
                        <span className="text-sm px-2 py-0.5 rounded-full bg-gray-100">
                          {trip.status === 'confirmed' && route.status === 'active'
                            ? 'Confirmado'
                            : trip.status === 'cancelled' || route.status === 'cancelled'
                            ? 'Cancelado'
                            : 'Completado'}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-text">
                        De {route.origin.name} a {route.destination.name}
                      </h3>
                      <p className="text-gray-500">
                        Salida: {formatTime(route.departureTime)} | Llegada estimada:{' '}
                        {formatTime(route.estimatedArrivalTime)}
                      </p>
                      <div className="mt-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {trip.passengerCount} pasajero{trip.passengerCount !== 1 && 's'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row md:flex-col justify-end gap-2">
                      <Link
                        to={`/routes/${route.id}`}
                        className="bg-primary hover:bg-gradient-primary text-white py-2 px-4 rounded-md transition-colors text-center"
                      >
                        Ver detalles
                      </Link>
                      
                      {trip.status === 'confirmed' && route.status === 'active' && (
                        <button className="border border-red-500 text-red-500 hover:bg-red-50 py-2 px-4 rounded-md transition-colors">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTrips;