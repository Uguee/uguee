import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRoutes } from '../../hooks/useRoutes';
import { Search, MapPin, Car, Bus, Bike } from 'lucide-react';

const SearchRoutes = () => {
  const [selectedCarType, setSelectedCarType] = useState<string>('all');
  const { routes, isLoading, error, searchRoutes } = useRoutes();

  useEffect(() => {
    // Fetch all available routes when component mounts
    searchRoutes('', '', 'car');
  }, []);

  const filteredRoutes = selectedCarType === 'all' 
    ? routes 
    : routes.filter(route => route.transportType === selectedCarType);

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <Car className="h-5 w-5" />;
      case 'bus':
        return <Bus className="h-5 w-5" />;
      case 'bike':
        return <Bike className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Buscar rutas</h1>
          <p className="text-gray-600 mt-2">
            Explora las rutas disponibles y encuentra tu viaje ideal
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Filtrar por tipo de vehículo:</span>
            <Select value={selectedCarType} onValueChange={setSelectedCarType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="car">Carro compartido</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="bike">Bicicleta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Cargando rutas...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay rutas disponibles
            </h3>
            <p className="text-gray-500">
              Intenta con otro tipo de vehículo o vuelve más tarde
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      {getTransportIcon(route.transportType)}
                      <h3 className="text-lg font-medium text-text">
                        De {route.origin.name} a {route.destination.name}
                      </h3>
                    </div>
                    <p className="text-gray-500 mt-1">
                      Salida: {new Date(route.departureTime).toLocaleTimeString()} | 
                      Llegada estimada: {new Date(route.estimatedArrivalTime).toLocaleTimeString()}
                    </p>
                    <div className="flex items-center mt-2 gap-2">
                      <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {route.transportType === 'car' && 'Carro compartido'}
                        {route.transportType === 'bus' && 'Bus'}
                        {route.transportType === 'bike' && 'Bicicleta'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {route.availableSeats} asientos disponibles
                      </span>
                      <span className="text-sm text-gray-500">
                        ID Conductor: {route.driverId}
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