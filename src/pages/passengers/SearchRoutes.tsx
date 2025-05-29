import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRoutes } from '../../hooks/useRoutes';
import { Search, MapPin } from 'lucide-react';

const SearchRoutes = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [transportType, setTransportType] = useState<'car' | 'bus' | 'bike' | 'walk'>('car');
  
  const { routes, isLoading, error, searchRoutes } = useRoutes({
    origin,
    destination,
    transportType
  });

  const handleSearch = () => {
    searchRoutes(origin, destination, transportType);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Buscar rutas</h1>
          <p className="text-gray-600 mt-2">
            Encuentra la mejor ruta para tu viaje
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Origen"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Destino"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={transportType} onValueChange={(value: 'car' | 'bus' | 'bike' | 'walk') => setTransportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de transporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Carro compartido</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="bike">Bicicleta</SelectItem>
                <SelectItem value="walk">A pie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleSearch}
            className="mt-4 w-full md:w-auto"
            disabled={!origin || !destination}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar rutas
          </Button>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Buscando rutas...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron rutas
            </h3>
            <p className="text-gray-500">
              Intenta con otros lugares o tipo de transporte
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-medium text-text">
                      De {route.origin.name} a {route.destination.name}
                    </h3>
                    <p className="text-gray-500">
                      Salida: {new Date(route.departureTime).toLocaleTimeString()} | 
                      Llegada estimada: {new Date(route.estimatedArrivalTime).toLocaleTimeString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {route.transportType === 'car' && 'Carro compartido'}
                        {route.transportType === 'bus' && 'Bus'}
                        {route.transportType === 'bike' && 'Bicicleta'}
                        {route.transportType === 'walk' && 'A pie'}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {route.availableSeats} asientos disponibles
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/routes/${route.id}`}
                    className="bg-primary hover:bg-gradient-primary text-white py-2 px-4 rounded-md transition-colors text-center"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SearchRoutes; 