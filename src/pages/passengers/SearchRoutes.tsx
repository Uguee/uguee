import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon } from "lucide-react";
import { useRoutes } from '@/hooks/useRoutes';
import { RouteMap } from '@/components/map/RouteMap';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { TripService, Trip } from "@/services/tripService";
import { supabase } from "@/integrations/supabase/client";
import { useRouteManager } from "@/hooks/useRouteManager";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { useCurrentUser } from '@/hooks/useCurrentUser';

const SearchRoutes = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRouteDetails, setSelectedRouteDetails] = useState<any>(null);
  const { toast } = useToast();
  const { fetchRoutes } = useRouteManager();
  const { vehicleTypes, isLoading: isLoadingTypes, error: typesError, fetchVehicleTypes } = useVehicleTypes();
  const { currentUserId, isLoading: isLoadingUser } = useCurrentUser();
  const [isReserving, setIsReserving] = useState(false);
  const [userTripStatus, setUserTripStatus] = useState<Record<number, boolean>>({});
  const [reservedTrips, setReservedTrips] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchTrips();
    fetchAvailableRoutes();
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    let filtered = trips;

    // Filter by vehicle type
    if (selectedVehicleType !== "all") {
      filtered = filtered.filter(trip => 
        trip.vehiculo?.tipo.tipo.toLowerCase() === selectedVehicleType.toLowerCase()
      );
    }

    // Filter by route
    if (selectedRoute !== "all") {
      filtered = filtered.filter(trip => 
        trip.id_ruta.toString() === selectedRoute
      );
    }

    setFilteredTrips(filtered);
  }, [selectedVehicleType, selectedRoute, trips]);

  // Add effect to check user status for each trip
  useEffect(() => {
    const checkUserTripStatus = async () => {
      if (!currentUserId || trips.length === 0) return;

      const statusMap: Record<number, boolean> = {};
      for (const trip of trips) {
        const isDriverOrCreator = await isUserDriver(trip);
        statusMap[trip.id_viaje] = isDriverOrCreator;
      }
      setUserTripStatus(statusMap);
    };

    checkUserTripStatus();
  }, [currentUserId, trips]);

  // Add effect to check user's reservations
  useEffect(() => {
    const checkUserReservations = async () => {
      if (!currentUserId || trips.length === 0) return;

      try {
        const { data: reservations, error } = await supabase
          .from('reserva')
          .select('id_viaje')
          .eq('id_usuario', currentUserId);

        if (error) throw error;

        const reservationMap: Record<number, boolean> = {};
        reservations?.forEach(reservation => {
          reservationMap[reservation.id_viaje] = true;
        });

        setReservedTrips(reservationMap);
      } catch (error) {
        console.error('Error checking reservations:', error);
      }
    };

    checkUserReservations();
  }, [currentUserId, trips]);

  const fetchAvailableRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('ruta')
        .select('id_ruta, longitud')
        .order('id_ruta', { ascending: false });

      if (error) throw error;
      setAvailableRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutas disponibles",
        variant: "destructive",
      });
    }
  };

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const data = await TripService.getUpcomingTrips();
      setTrips(data);
      setFilteredTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los viajes disponibles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRoute = async (routeId: number) => {
    try {
      const { data, error } = await supabase
        .rpc('obtener_ruta_con_coordenadas', {
          p_id_ruta: routeId
        });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setSelectedRouteDetails(data[0]);
      } else {
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

  const formatDate = (dateString: string) => {
    try {
      // First try to parse as ISO string
      try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return format(date, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });
        }
      } catch (e) {
        // If ISO parsing fails, try to parse as custom format
        try {
          // Assuming the date is in format "YYYY-MM-DD HH:mm:ss"
          const date = parse(dateString, "yyyy-MM-dd HH:mm:ss", new Date());
          if (!isNaN(date.getTime())) {
            return format(date, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });
          }
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
      return 'Fecha no disponible';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  // Función para verificar si el usuario es el conductor o el pasajero que creó la ruta
  const isUserDriver = async (trip: Trip) => {
    console.log('Checking if user is driver or creator:', {
      currentUserId,
      tripDriverId: trip.id_conductor,
      tripId: trip.id_viaje
    });

    // Check if user is the driver
    if (trip.id_conductor === currentUserId) {
      console.log('User is the driver');
      return true;
    }

    // Check if user is the passenger who created the route
    try {
      const { data: routeCreator, error } = await supabase
        .from('reserva')
        .select('id_usuario')
        .eq('id_viaje', trip.id_viaje)
        .single();

      console.log('Route creator check:', { routeCreator, error });

      if (error) {
        console.error('Error checking route creator:', error);
        return false;
      }

      const isCreator = routeCreator?.id_usuario === currentUserId;
      console.log('Is user the creator?', isCreator);
      return isCreator;
    } catch (error) {
      console.error('Error checking route creator:', error);
      return false;
    }
  };

  // Función para realizar la reserva
  const handleReserve = async (trip: Trip) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para reservar un viaje",
        variant: "destructive",
      });
      return;
    }

    console.log('Attempting to reserve trip:', {
      tripId: trip.id_viaje,
      currentUserId
    });

    const isDriverOrCreator = await isUserDriver(trip);
    console.log('Is user driver or creator?', isDriverOrCreator);

    if (isDriverOrCreator) {
      toast({
        title: "Error",
        description: "No puedes reservar un viaje que has creado",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReserving(true);

      // Verificar si ya existe una reserva para este usuario y viaje
      const { data: existingReservation, error: checkError } = await supabase
        .from('reserva')
        .select('*')
        .eq('id_usuario', currentUserId)
        .eq('id_viaje', trip.id_viaje)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingReservation) {
        toast({
          title: "Información",
          description: "Ya tienes una reserva para este viaje",
          variant: "default",
        });
        return;
      }

      // Crear la reserva
      const { error: insertError } = await supabase
        .from('reserva')
        .insert({
          id_usuario: currentUserId,
          id_viaje: trip.id_viaje
        });

      if (insertError) throw insertError;

      // Update local state to show reservation
      setReservedTrips(prev => ({
        ...prev,
        [trip.id_viaje]: true
      }));

      toast({
        title: "¡Éxito!",
        description: "Viaje reservado correctamente",
      });

    } catch (error) {
      console.error('Error al reservar:', error);
      toast({
        title: "Error",
        description: "No se pudo realizar la reserva",
        variant: "destructive",
      });
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Viajes Disponibles</h1>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filtrar por tipo de vehículo" />
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
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedVehicleType("all");
                  setSelectedRoute("all");
                }}
              >
                <FilterIcon className="w-4 h-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
            <div className="flex gap-4">
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filtrar por ruta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las rutas</SelectItem>
                  {availableRoutes.map((route) => (
                    <SelectItem key={route.id_ruta} value={route.id_ruta.toString()}>
                      Ruta #{route.id_ruta} ({Number(route.longitud).toFixed(2)} km)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden relative lg:col-span-2" style={{ zIndex: 1, height: '600px' }}>
            <RouteMap 
              origin={selectedRouteDetails ? {
                lat: selectedRouteDetails.origen_coords.y,
                lng: selectedRouteDetails.origen_coords.x,
                address: "Origen"
              } : null}
              destination={selectedRouteDetails ? {
                lat: selectedRouteDetails.destino_coords.y,
                lng: selectedRouteDetails.destino_coords.x,
                address: "Destino"
              } : null}
              route={selectedRouteDetails?.trayecto_coords?.map((coord: any) => [coord.y, coord.x]) || null}
              allowClickToSetPoints={false}
            />
          </div>

          {/* Routes List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <div
                  key={trip.id_viaje}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">
                        {trip.conductor?.nombre} {trip.conductor?.apellido}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(trip.fecha + ' ' + trip.hora_salida)}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Teléfono:</span> {trip.conductor?.celular}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Vehículo:</span> {trip.vehiculo?.tipo.tipo} {trip.vehiculo?.color} {trip.vehiculo?.modelo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <button
                        className={`w-full px-4 py-2 ${
                          reservedTrips[trip.id_viaje]
                            ? 'bg-green-500 cursor-default'
                            : userTripStatus[trip.id_viaje]
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90'
                        } text-white rounded-md transition-colors`}
                        onClick={() => handleReserve(trip)}
                        disabled={reservedTrips[trip.id_viaje] || userTripStatus[trip.id_viaje] || isReserving}
                      >
                        {reservedTrips[trip.id_viaje]
                          ? 'Reservado'
                          : userTripStatus[trip.id_viaje]
                          ? 'No puedes reservar tu propio viaje'
                          : isReserving
                          ? 'Reservando...'
                          : 'Reservar'}
                      </button>
                      <button
                        className="w-full px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                        onClick={() => handleViewRoute(trip.id_ruta)}
                      >
                        Ver ruta
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">
                  {selectedVehicleType !== "all" || selectedRoute !== "all"
                    ? "No hay viajes disponibles con los filtros seleccionados"
                    : "No hay viajes disponibles"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchRoutes; 