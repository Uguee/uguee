import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRoutes } from "@/hooks/useRoutes";
import { RouteMap } from "@/components/map/RouteMap";
import { GeocodingService, Location } from "@/services/geocodingService";
import { useToast } from "@/hooks/use-toast";

const StartTrip = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [transportType, setTransportType] = useState<"car" | "bus" | "bike" | "walk">("car");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const { searchRoutes } = useRoutes();
  const { toast } = useToast();

  // New state for map functionality
  const [originLocation, setOriginLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<Location[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Location[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Debounce function for address search
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced search functions
  const debouncedOriginSearch = useRef(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setOriginSuggestions([]);
        return;
      }
      const suggestions = await GeocodingService.searchAddress(query);
      setOriginSuggestions(suggestions);
    }, 300)
  ).current;

  const debouncedDestinationSearch = useRef(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setDestinationSuggestions([]);
        return;
      }
      const suggestions = await GeocodingService.searchAddress(query);
      setDestinationSuggestions(suggestions);
    }, 300)
  ).current;

  // Handle origin input change
  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrigin(value);
    debouncedOriginSearch(value);
    setShowOriginSuggestions(true);
  };

  // Handle destination input change
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    debouncedDestinationSearch(value);
    setShowDestinationSuggestions(true);
  };

  // Handle suggestion selection
  const handleOriginSelect = (location: Location) => {
    setOrigin(location.address);
    setOriginLocation(location);
    setOriginSuggestions([]);
    setShowOriginSuggestions(false);
  };

  const handleDestinationSelect = (location: Location) => {
    setDestination(location.address);
    setDestinationLocation(location);
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!originLocation || !destinationLocation) {
        throw new Error("Por favor selecciona ubicaciones válidas");
      }

      // Get route between points
      const routeData = await GeocodingService.getRoute(originLocation, destinationLocation);
      if (routeData) {
        setRoute(routeData.coordinates);
      }

      // Search for available routes
      const results = await searchRoutes(origin, destination, transportType);
      setRoutes(Array.isArray(results) ? results : []);
    } catch (err: any) {
      setError(err.message || "Error al buscar rutas");
      toast({
        title: "Error",
        description: err.message || "Error al buscar rutas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Iniciar Viaje</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen
                </label>
                <Input
                  type="text"
                  value={origin}
                  onChange={handleOriginChange}
                  placeholder="Ingresa tu ubicación de origen"
                  className="w-full"
                />
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                    {originSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleOriginSelect(suggestion)}
                      >
                        {suggestion.address}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </label>
                <Input
                  type="text"
                  value={destination}
                  onChange={handleDestinationChange}
                  placeholder="Ingresa tu destino"
                  className="w-full"
                />
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                    {destinationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleDestinationSelect(suggestion)}
                      >
                        {suggestion.address}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Transporte
              </label>
              <Select value={transportType} onValueChange={(value: "car" | "bus" | "bike" | "walk") => setTransportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de transporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Carro</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="bike">Bicicleta</SelectItem>
                  <SelectItem value="walk">A pie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !originLocation || !destinationLocation}
              className="w-full"
            >
              {isLoading ? "Buscando..." : "Buscar ruta"}
            </Button>
          </form>

          {/* Map and Routes Container */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Component */}
            <div className="lg:col-span-2">
              <RouteMap
                origin={originLocation}
                destination={destinationLocation}
                route={route}
              />
            </div>

            {/* Routes List */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Rutas Disponibles</h2>
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                  {error}
                </div>
              )}
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : routes.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {routes.map((route, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {route.driver?.name || "Conductor"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {route.departureTime} - {route.estimatedArrival}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">
                            ₡{route.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {route.availableSeats} asientos disponibles
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="capitalize">{route.transportType}</span>
                        <span className="mx-2">•</span>
                        <span>{route.distance} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No se encontraron rutas disponibles
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StartTrip; 