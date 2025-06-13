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
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { TripService } from "@/services/tripService";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from "@/integrations/supabase/client";
import { useViajeManager } from '@/hooks/useViajeManager';

const StartTrip = () => {
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [transportType, setTransportType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const { searchRoutes } = useRoutes();
  const { toast } = useToast();
  const { vehicleTypes, isLoading: isLoadingTypes, error: typesError, fetchVehicleTypes } = useVehicleTypes();
  const { currentUserId } = useCurrentUser();

  // New state for map functionality
  const [originLocation, setOriginLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<Location[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Location[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [departureTime, setDepartureTime] = useState<string>("");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [selectedTripRoute, setSelectedTripRoute] = useState<[number, number][] | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  const { crearSolicitudViaje } = useViajeManager();

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
      const formattedRoutes = similarTrips.map(trip => {
        // Log the raw time values
        console.log('Raw departure time:', trip.hora_salida);
        console.log('Raw arrival time:', trip.hora_llegada);

        // Parse the time strings into Date objects
        const today = new Date();
        let departureTime;
        let arrivalTime;

        try {
          // Parse times in HH:mm:ss format
          if (trip.hora_salida) {
            const [hours, minutes] = trip.hora_salida.split(':').map(Number);
            departureTime = new Date(today);
            departureTime.setHours(hours, minutes, 0, 0);
          }

          if (trip.hora_llegada) {
            const [hours, minutes] = trip.hora_llegada.split(':').map(Number);
            arrivalTime = new Date(today);
            arrivalTime.setHours(hours, minutes, 0, 0);
          }

          console.log('Parsed departure time:', departureTime);
          console.log('Parsed arrival time:', arrivalTime);
        } catch (error) {
          console.error('Error parsing times:', error);
          // Fallback to current time if parsing fails
          departureTime = new Date();
          arrivalTime = null;
        }

        return {
          id_viaje: trip.id_viaje,
          id_ruta: trip.id_ruta,
          driver: {
            name: `${trip.conductor?.nombre} ${trip.conductor?.apellido}`,
            phone: trip.conductor?.celular
          },
          departureTime,
          estimatedArrival: arrivalTime,
          price: 0, // You might want to add price to your trip model
          availableSeats: 4, // You might want to add capacity to your trip model
          transportType: trip.vehiculo?.tipo?.tipo,
          distance: 0 // You might want to calculate this based on the route
        };
      });

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
    if (!originLocation || !destinationLocation) {
      toast({
        title: "Error",
        description: "Debes especificar origen y destino antes de crear una solicitud",
        variant: "destructive",
      });
      return;
    }
    setIsRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!departureTime) {
      toast({
        title: "Error",
        description: "Debes especificar la hora de salida",
        variant: "destructive",
      });
      return;
    }

    if (!route || !originLocation || !destinationLocation) {
      toast({
        title: "Error",
        description: "Debes especificar una ruta válida con origen y destino",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingRequest(true);
    try {
      // Format the route data for PostGIS
      const routeLineString = route.map(coord => `${coord[1]} ${coord[0]}`).join(',');
      const originPoint = `${originLocation.lng} ${originLocation.lat}`;
      const destinationPoint = `${destinationLocation.lng} ${destinationLocation.lat}`;

      console.log('📍 Creando ruta con puntos:', {
        origin: originPoint,
        destination: destinationPoint,
        routeLength: route.length
      });

      // First, create the route using the PostGIS function
      const { data: routeData, error: routeError } = await supabase
        .rpc('insertar_ruta', {
          p_longitud: route.length,
          p_punto_partida_wkt: `POINT(${originPoint})`,
          p_punto_llegada_wkt: `POINT(${destinationPoint})`,
          p_trayecto_wkt: `LINESTRING(${routeLineString})`
        });

      if (routeError) {
        console.error('❌ Error creating route:', routeError);
        throw new Error('No se pudo crear la ruta');
      }

      if (!routeData || !routeData[0]?.id_ruta_nuevo) {
        throw new Error('No se pudo obtener el ID de la ruta creada');
      }

      console.log('✅ Ruta creada:', routeData[0]);

      // Format the date and time for the trip
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      const [hours, minutes] = departureTime.split(':');
      const formattedTime = `${hours}:${minutes}:00`;

      console.log('🕒 Creando solicitud de viaje con datos:', {
        id_ruta: routeData[0].id_ruta_nuevo,
        fecha: formattedDate,
        hora_salida: formattedTime
      });

      // Create the trip request using crearSolicitudViaje
      const solicitudCreada = await crearSolicitudViaje({
        id_ruta: routeData[0].id_ruta_nuevo,
        id_conductor: currentUserId, // This will be used as id_pasajero
        id_vehiculo: null,
        fecha: formattedDate,
        hora_salida: formattedTime,
        hora_llegada: null
      });

      console.log('✅ Solicitud de viaje creada:', solicitudCreada);

      toast({
        title: "Éxito",
        description: "Tu solicitud de viaje ha sido creada",
        variant: "default",
      });

      setIsRequestDialogOpen(false);
      setDepartureTime("");
    } catch (error) {
      console.error('❌ Error creating trip request:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : "No se pudo crear la solicitud de viaje";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleViewRoute = async (tripId: number) => {
    try {
      // If the same trip is clicked again, clear the route
      if (selectedTripId === tripId) {
        setSelectedTripRoute(null);
        setSelectedTripId(null);
        return;
      }

      console.log('handleViewRoute called with tripId:', tripId);
      // Get the trip from the routes array
      const trip = routes.find(r => r.id_viaje === tripId);
      console.log('Found trip:', trip);
      if (!trip) {
        console.log('No trip found with id_viaje:', tripId);
        return;
      }

      // Get the route details from the database
      console.log('Fetching route with id_ruta:', trip.id_ruta);
      const { data, error } = await supabase
        .rpc('obtener_ruta_con_coordenadas', {
          p_id_ruta: trip.id_ruta
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Route data received:', data);

      if (data && data.length > 0) {
        // trayecto_coords might be a JSON string or an array
        let trayectoCoords = data[0].trayecto_coords;
        console.log('Raw trayecto_coords:', trayectoCoords);
        
        if (typeof trayectoCoords === 'string') {
          try {
            trayectoCoords = JSON.parse(trayectoCoords);
            console.log('Parsed trayecto_coords:', trayectoCoords);
          } catch (e) {
            console.error('Error parsing trayecto_coords:', e);
            trayectoCoords = [];
          }
        }
        
        if (Array.isArray(trayectoCoords)) {
          // Convert coordinates to the format expected by the map
          const routeCoordinates = trayectoCoords
            .filter(
              (coord: any): coord is { x: number; y: number } =>
                coord &&
                typeof coord === 'object' &&
                typeof coord.y === 'number' &&
                typeof coord.x === 'number'
            )
            .map((coord) => [coord.y, coord.x] as [number, number]);
          console.log('Processed route coordinates:', routeCoordinates);
          
          if (routeCoordinates.length > 0) {
            setSelectedTripRoute(routeCoordinates);
            setSelectedTripId(tripId);
          } else {
            console.log('No valid coordinates found in trayecto_coords');
            toast({
              title: "Error",
              description: "La ruta no contiene coordenadas válidas",
              variant: "destructive",
            });
          }
        } else {
          console.log('trayectoCoords is not an array:', trayectoCoords);
          toast({
            title: "Error",
            description: "El formato de la ruta no es válido",
            variant: "destructive",
          });
          setSelectedTripRoute([]);
        }
      } else {
        console.log('No route data found');
        toast({
          title: "Error",
          description: "No se pudo encontrar la ruta",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la ruta",
        variant: "destructive",
      });
    }
  };

  // Add new function to clear the selected trip route
  const handleClearRoute = () => {
    setSelectedTripRoute(null);
    setSelectedTripId(null);
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
                selectedTripRoute={selectedTripRoute}
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
                  {routes.map((route) => (
                    <div
                      key={route.id_viaje}
                      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col space-y-4">
                        {/* Driver and Time Info */}
                        <div className="space-y-2">
                          <h3 className="font-medium text-lg">
                            {route.driver?.name || "Conductor"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {format(route.departureTime, "HH:mm", { locale: es })}
                          </p>
                        </div>

                        {/* Trip Details */}
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Teléfono:</span> {route.driver?.phone}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Vehículo:</span> {route.transportType}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                          <button
                            className={`w-full px-4 py-2 ${
                              route.id_usuario === currentUserId
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/90'
                            } text-white rounded-md transition-colors`}
                            onClick={() => {
                              // TODO: Implement reservation functionality
                              toast({
                                title: "Funcionalidad en desarrollo",
                                description: "La reserva de viajes estará disponible próximamente",
                              });
                            }}
                            disabled={route.id_usuario === currentUserId}
                          >
                            {route.id_usuario === currentUserId
                              ? 'No puedes reservar tu propio viaje'
                              : 'Reservar'}
                          </button>
                          <button
                            className={`w-full px-4 py-2 ${
                              selectedTripId === route.id_viaje
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-secondary hover:bg-secondary/90'
                            } text-white rounded-md transition-colors`}
                            onClick={() => selectedTripId === route.id_viaje ? handleClearRoute() : handleViewRoute(route.id_viaje)}
                          >
                            {selectedTripId === route.id_viaje ? 'Borrar ruta' : 'Ver ruta'}
                          </button>
                        </div>
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleNewRequest}
                >
                  Hacer nueva solicitud
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the new request dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear solicitud de viaje</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departureTime">Hora de salida</Label>
              <Input
                id="departureTime"
                type="time"
                value={departureTime}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setDepartureTime(value);
                  }
                }}
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRequestDialogOpen(false);
                  setDepartureTime("");
                }}
                disabled={isSubmittingRequest}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={isSubmittingRequest || !departureTime}
              >
                {isSubmittingRequest ? "Creando solicitud..." : "Crear solicitud"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StartTrip; 