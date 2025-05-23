
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon } from "lucide-react";
import { useRoutes } from '../hooks/useRoutes';
import RouteMap from '../components/RouteMap';
import DashboardLayout from '../components/layout/DashboardLayout';

const SearchRoutes = () => {
  const [origin, setOrigin] = useState('Tu ubicación');
  const [destination, setDestination] = useState('Carrera 86');
  const [transportType, setTransportType] = useState('');
  
  const { routes, isLoading } = useRoutes();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Rutas</h1>
        </div>

        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origen:</label>
              <Input 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Tu ubicación"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destino:</label>
              <Input 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Carrera 86"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Select value={transportType} onValueChange={setTransportType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Elige tu medio de transporte preferido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="bicicleta">Bicicleta</SelectItem>
                <SelectItem value="transporte-publico">Transporte público</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <RouteMap />
        </div>

        {/* Routes List */}
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500">Cargando rutas...</p>
          </div>
        ) : routes?.length ? (
          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg">{route.origin} → {route.destination}</h3>
                <p className="text-gray-600">Conductor: {route.driverName}</p>
                <p className="text-sm text-gray-500">Horario: {route.departureTime}</p>
                <p className="text-sm text-gray-500">Precio: ${route.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500">No se encontraron rutas disponibles.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SearchRoutes;
