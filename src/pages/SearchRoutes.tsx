
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import RouteMap from '../components/RouteMap';
import { useRoutes } from '../hooks/useRoutes';
import { Route } from '../types';

const SearchRoutes = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [transportType, setTransportType] = useState<'car' | 'bus' | 'bike' | 'walk'>('car');
  const [hasSearched, setHasSearched] = useState(false);
  const { routes, isLoading, error, searchRoutes } = useRoutes();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchRoutes(origin, destination, transportType);
    setHasSearched(true);
  };

  const formatTime = (isoDate: string) => {
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

  const calculateDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const durationMs = endDate.getTime() - startDate.getTime();
      const minutes = Math.floor(durationMs / (1000 * 60));
      
      if (minutes < 60) {
        return `${minutes} min`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
      }
    } catch (err) {
      return 'Duración desconocida';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text">Rutas</h1>
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin */}
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                  Origen:
                </label>
                <input
                  id="origin"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Tu ubicación"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              {/* Destination */}
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Destino:
                </label>
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Universidad del Valle"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            
            {/* Transport Type */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="sm:flex-1">
                <label htmlFor="transportType" className="block text-sm font-medium text-gray-700 mb-1">
                  Elige tu medio de transporte preferido
                </label>
                <select
                  id="transportType"
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="car">Carro compartido</option>
                  <option value="bus">Bus</option>
                  <option value="bike">Bicicleta</option>
                  <option value="walk">A pie</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="bg-primary hover:bg-gradient-primary text-white py-2 px-6 rounded-md transition-colors sm:self-end"
                disabled={isLoading}
              >
                {isLoading ? 'Buscando...' : 'Buscar rutas'}
              </button>
              
              <button
                type="button"
                className="border border-gray-300 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors sm:self-end"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>
        
        {/* Results */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-2"></div>
              <p className="text-gray-600">Buscando rutas disponibles...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : hasSearched && routes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron rutas para estos criterios de búsqueda.</p>
              <p className="text-sm text-gray-500 mt-2">Intenta con otro origen, destino o medio de transporte.</p>
            </div>
          ) : (
            <>
              {routes.map((route: Route) => (
                <div 
                  key={route.id} 
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-text">
                            De {route.origin.name} a {route.destination.name}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {route.stops && route.stops.length > 0 ? (
                              <>
                                Con paradas en:{' '}
                                {route.stops.map((stop, i) => (
                                  <span key={i}>
                                    {stop.name}
                                    {i < route.stops!.length - 1 && ', '}
                                  </span>
                                ))}
                              </>
                            ) : (
                              'Ruta directa'
                            )}
                          </p>
                        </div>
                        
                        <div className="bg-primary/10 text-primary py-1 px-3 rounded-full text-sm font-medium">
                          {route.transportType === 'car' && 'Carro compartido'}
                          {route.transportType === 'bus' && 'Bus'}
                          {route.transportType === 'bike' && 'Bicicleta'}
                          {route.transportType === 'walk' && 'A pie'}
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <div className="flex-1 flex items-center">
                          <div className="mr-3 text-primary font-medium">
                            {formatTime(route.departureTime)}
                          </div>
                          <div className="flex-grow h-0.5 bg-gray-200 relative">
                            <div className="absolute -top-1.5 left-0 w-3 h-3 bg-primary rounded-full"></div>
                            <div className="absolute -top-1.5 right-0 w-3 h-3 bg-primary rounded-full"></div>
                          </div>
                          <div className="ml-3 text-primary font-medium">
                            {formatTime(route.estimatedArrivalTime)}
                          </div>
                        </div>
                        
                        <div className="ml-4 px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                          {calculateDuration(route.departureTime, route.estimatedArrivalTime)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
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
                            {route.availableSeats} de {route.capacity} asientos disponibles
                          </span>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/routes/${route.id}`)}
                          className="bg-primary hover:bg-gradient-primary text-white py-1.5 px-4 rounded-md transition-colors"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <RouteMap route={route} className="h-full min-h-[160px]" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchRoutes;
