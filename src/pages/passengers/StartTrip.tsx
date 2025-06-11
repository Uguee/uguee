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
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TripService } from "@/services/tripService";

const StartTrip = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [transportType, setTransportType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const { searchRoutes } = useRoutes();
  const { toast } = useToast();
  const { vehicleTypes, isLoading: isLoadingTypes, error: typesError, fetchVehicleTypes } = useVehicleTypes();

  // New state for map functionality
  const [originLocation, setOriginLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<Location[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Location[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [departureTime, setDepartureTime] = useState<Date | null>(null);
  const [isDepartureDialogOpen, setIsDepartureDialogOpen] = useState(false);

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
      console.log('Searching origin with query:', query);
      if (query.length < 3) {
        setOriginSuggestions([]);
        return;
      }
      try {
        const suggestions = await GeocodingService.searchAddress(query, currentLocation);
        console.log('Origin suggestions received:', suggestions);
        setOriginSuggestions(suggestions);
      } catch (error) {
        console.error('Error searching origin:', error);
      }
    }, 300)
  ).current;

  const debouncedDestinationSearch = useRef(
    debounce(async (query: string) => {
      console.log('Searching destination with query:', query);
      if (query.length < 3) {
        setDestinationSuggestions([]);
        return;
      }
      try {
        const suggestions = await GeocodingService.searchAddress(query, currentLocation);
        console.log('Destination suggestions received:', suggestions);
        setDestinationSuggestions(suggestions);
      } catch (error) {
        console.error('Error searching destination:', error);
      }
    }, 300)
  ).current;

  // Handle current location change
  const handleCurrentLocationChange = (location: Location) => {
    setCurrentLocation(location);
    // Only set origin to current location if it hasn't been set yet
    if (!originLocation) {
      setOrigin(location.address);
      setOriginLocation(location);
    }
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number, isRightClick: boolean = false) => {
    try {
      const location = await GeocodingService.reverseGeocode(lat, lng);
      if (!location) return;

      if (isRightClick) {
        // Right click sets origin
        setOrigin(location.address);
        setOriginLocation(location);
        setDestination("");
        setDestinationLocation(null);
        setRoute(null);
      } else {
        // Left click sets destination
        if (!originLocation) {
          toast({
            title: "Aviso",
            description: "Primero debes establecer el origen (clic derecho)",
            variant: "default",
          });
          return;
        }
        setDestination(location.address);
        setDestinationLocation(location);
        // Generate route between origin and new destination
        generateRoute(originLocation, location);
      }
    } catch (error) {
      console.error('Error handling map click:', error);
      toast({
        title: "Error",
        description: "No se pudo establecer la ubicación",
        variant: "destructive",
      });
    }
  };

  // Handle origin input change
  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Origin input changed:', value);
    setOrigin(value);
    setShowOriginSuggestions(true);
    
    if (value.length >= 3) {
      debouncedOriginSearch(value);
    } else {
      setOriginSuggestions([]);
    }
  };

  // Handle destination input change
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Destination input changed:', value);
    setDestination(value);
    setShowDestinationSuggestions(true);
    
    if (value.length >= 3) {
      debouncedDestinationSearch(value);
    } else {
      setDestinationSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleOriginSelect = (location: Location) => {
    setOrigin(location.address);
    setOriginLocation(location);
    setOriginSuggestions([]);
    setShowOriginSuggestions(false);
    
    // If we have both origin and destination, generate the route
    if (destinationLocation) {
      generateRoute(location, destinationLocation);
    }
  };  

  const handleDestinationSelect = (location: Location) => {
    setDestination(location.address);
    setDestinationLocation(location);
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
    
    // If we have both origin and destination, generate the route
    if (originLocation) {
      generateRoute(originLocation, location);
    }
  };

  // Generate route between two points
  const generateRoute = async (start: Location, end: Location) => {
    try {
      const routeData = await GeocodingService.getRoute(start, end);
      if (routeData) {
        setRoute(routeData.coordinates);
      }
    } catch (error) {
      console.error('Error generating route:', error);
    }
  };

  // Handle clicking outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.suggestions-container')) {
        setShowOriginSuggestions(false);
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add useEffect to fetch vehicle types
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!originLocation || !destinationLocation) {
        throw new Error("Por favor completa todos los campos");
      }

      // Get route between points
      const routeData = await GeocodingService.getRoute(originLocation, destinationLocation);
      if (routeData) {
        setRoute(routeData.coordinates);
      }

      // Search for similar trips
      const similarTrips = await TripService.findSimilarTrips(
        { lat: originLocation.lat, lng: originLocation.lng },
        { lat: destinationLocation.lat, lng: destinationLocation.lng },
        transportType === "all" ? undefined : transportType
      );

      // Transform the trips into the format expected by the UI
      const formattedRoutes = similarTrips.map(trip => ({
        id: trip.id_viaje,
        driver: {
          name: `${trip.conductor?.nombre} ${trip.conductor?.apellido}`,
          phone: trip.conductor?.celular
        },
        departureTime: trip.hora_salida,
        estimatedArrival: trip.hora_llegada,
        price: 0, // You might want to add price to your trip model
        availableSeats: 4, // You might want to add capacity to your trip model
        transportType: trip.vehiculo?.tipo?.tipo,
        distance: 0 // You might want to calculate this based on the route
      }));

      setRoutes(formattedRoutes);
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

  // Add new function to reset origin to current location
  const resetOriginToCurrentLocation = () => {
    if (currentLocation) {
      setOrigin(currentLocation.address);
      setOriginLocation(currentLocation);
      setDestination("");
      setDestinationLocation(null);
      setRoute(null);
    }
  };

  // Handle new request
  const handleNewRequest = () => {
    setOrigin("");
    setOriginLocation(null);
    setDestination("");
    setDestinationLocation(null);
    setRoute(null);
    setRoutes([]);
    setError(null);
    setDepartureTime(null);
    setIsDepartureDialogOpen(true);
  };

  // Handle departure time selection
  const handleDepartureTimeChange = (value: string) => {
    if (value === "now") {
      setDepartureTime(new Date());
    } else {
      const [hours, minutes] = value.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setDepartureTime(date);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Iniciar Viaje</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative suggestions-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={origin}
                    onChange={handleOriginChange}
                    onFocus={(e) => {
                      e.target.select();
                      if (origin.length >= 3) setShowOriginSuggestions(true);
                    }}
                    placeholder="Ingresa tu ubicación de origen"
                    className="w-full"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={resetOriginToCurrentLocation}
                    title="Usar mi ubicación actual"
                    disabled={!currentLocation}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </Button>
                </div>
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div className="fixed z-[9999] w-[calc(100%-2rem)] max-w-[calc(50%-1.5rem)] mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                    {originSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleOriginSelect(suggestion)}
                      >
                        <div className="font-medium text-gray-900">{suggestion.address}</div>
                        {suggestion.city && (
                          <div className="text-sm text-gray-500">{suggestion.city}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative suggestions-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </label>
                <Input
                  type="text"
                  value={destination}
                  onChange={handleDestinationChange}
                  onFocus={(e) => {
                    e.target.select();
                    if (destination.length >= 3) setShowDestinationSuggestions(true);
                  }}
                  placeholder="Ingresa tu destino"
                  className="w-full"
                />
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div className="fixed z-[9999] w-[calc(100%-2rem)] max-w-[calc(50%-1.5rem)] mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                    {destinationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleDestinationSelect(suggestion)}
                      >
                        <div className="font-medium text-gray-900">{suggestion.address}</div>
                        {suggestion.city && (
                          <div className="text-sm text-gray-500">{suggestion.city}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Transporte
              </label>
              <Select value={transportType || "all"} onValueChange={setTransportType}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Elige tu medio de transporte preferido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los vehículos</SelectItem>
                  {isLoadingTypes ? (
                    <SelectItem value="loading" disabled>
                      Cargando tipos...
                    </SelectItem>
                  ) : vehicleTypes.length > 0 ? (
                    vehicleTypes.map((type) => (
                      <SelectItem key={type.id_tipo} value={type.tipo}>
                        {type.tipo}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-types" disabled>
                      No hay tipos disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {typesError && (
                <p className="text-sm text-red-500 mt-1">{typesError}</p>
              )}
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
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
            {/* Map Component */}
            <div className="lg:col-span-2 relative z-0 h-[600px]">
              <RouteMap
                origin={originLocation}
                destination={destinationLocation}
                route={route}
                onCurrentLocationChange={handleCurrentLocationChange}
                allowClickToSetPoints={true}
                onMapClick={handleMapClick}
              />
            </div>

            {/* Routes List */}
            <div className="lg:col-span-1 h-[600px] overflow-y-auto">
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
                <div className="space-y-4 pr-2">
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
              <div className="mt-4">
                <Dialog open={isDepartureDialogOpen} onOpenChange={setIsDepartureDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleNewRequest}
                    >
                      Hacer nueva solicitud
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Selecciona la hora de partida</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <RadioGroup
                        defaultValue="now"
                        onValueChange={handleDepartureTimeChange}
                        className="space-y-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="now" id="now" />
                          <Label htmlFor="now">Ahora mismo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom">Personalizar hora</Label>
                        </div>
                      </RadioGroup>
                      {departureTime && (
                        <div className="mt-4 text-sm text-gray-600">
                          Hora seleccionada: {format(departureTime, "HH:mm", { locale: es })}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StartTrip; 