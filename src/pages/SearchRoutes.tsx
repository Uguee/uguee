import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon, MapPin } from "lucide-react";
import { useRoutes } from '../hooks/useRoutes';
import DashboardLayout from '../components/layout/DashboardLayout';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Coordenadas de Cali
const CALI_CENTER: [number, number] = [3.4516, -76.5320];

interface Location {
  name: string;
  coordinates: [number, number];
}

const SearchRoutes = () => {
  const [origin, setOrigin] = useState<Location>({ name: 'Tu ubicación', coordinates: CALI_CENTER });
  const [destination, setDestination] = useState<Location>({ name: 'Carrera 86', coordinates: CALI_CENTER });
  const [transportType, setTransportType] = useState('');
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);
  
  const { routes, isLoading } = useRoutes();

  // Get current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setOrigin({
            name: 'Tu ubicación actual',
            coordinates: [latitude, longitude]
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Handle address search
  const handleAddressSearch = async (query: string, type: 'origin' | 'destination') => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      
      const locations: Location[] = data.map((item: any) => ({
        name: item.display_name,
        coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
      }));
      
      setSuggestions(locations);
      setActiveInput(type);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (location: Location) => {
    if (activeInput === 'origin') {
      setOrigin(location);
    } else {
      setDestination(location);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Rutas</h1>
        </div>

        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Origen:</label>
              <div className="relative">
                <Input 
                  value={origin.name}
                  onChange={(e) => {
                    setOrigin({ ...origin, name: e.target.value });
                    handleAddressSearch(e.target.value, 'origin');
                  }}
                  placeholder="Tu ubicación"
                  onFocus={() => setActiveInput('origin')}
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Destino:</label>
              <div className="relative">
                <Input 
                  value={destination.name}
                  onChange={(e) => {
                    setDestination({ ...destination, name: e.target.value });
                    handleAddressSearch(e.target.value, 'destination');
                  }}
                  placeholder="Carrera 86"
                  onFocus={() => setActiveInput('destination')}
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
          
          {/* Address Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
              {suggestions.map((location, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionSelect(location)}
                >
                  {location.name}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-4">
            <Select value={transportType} onValueChange={setTransportType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Elige tu medio de transporte preferido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Automóvil</SelectItem>
                <SelectItem value="van">Camioneta</SelectItem>
                <SelectItem value="bike">Bicicleta</SelectItem>
                <SelectItem value="motorcycle">Motocicleta</SelectItem>
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
          <div className="w-full h-[500px]">
            <MapContainer
              center={currentLocation || CALI_CENTER}
              zoom={13}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Origin Marker */}
              <Marker position={origin.coordinates}>
                <Popup>
                  🟢 Origen: {origin.name}
                </Popup>
              </Marker>
              
              {/* Destination Marker */}
              <Marker position={destination.coordinates}>
                <Popup>
                  🔴 Destino: {destination.name}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
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
                <h3 className="font-semibold text-lg">{route.origin.name} → {route.destination.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600">ID Conductor: {route.driverId}</p>
                  <p className="text-sm text-gray-500">Salida: {formatTime(route.departureTime)}</p>
                  <p className="text-sm text-gray-500">Llegada estimada: {formatTime(route.estimatedArrivalTime)}</p>
                  <p className="text-sm text-gray-500">Asientos disponibles: {route.availableSeats}/{route.capacity}</p>
                  <p className="text-sm text-gray-500">Tipo de transporte: {route.transportType}</p>
                  {route.stops && route.stops.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Paradas:</p>
                      <ul className="text-sm text-gray-500 ml-4">
                        {route.stops.map((stop, index) => (
                          <li key={index}>• {stop.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
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
