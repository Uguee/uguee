import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Smartphone, Calendar, Clock } from 'lucide-react';
import { UserService } from '@/services/userService';
import { RouteMap } from '@/components/map/RouteMap';

interface TripRequest {
  id_solicitud: number;
  fecha: string;
  hora_salida: string;
  hora_llegada: string | null;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  created_at: string;
  ruta?: {
    id_ruta: number;
    punto_partida: any;
    punto_llegada: any;
    trayecto: any;
  };
  viaje?: {
    conductor?: {
      nombre: string;
      apellido: string;
      celular: string;
    };
    vehiculo?: {
      placa: string;
      color: string;
      modelo: number;
      tipo_vehiculo?: {
        tipo: string;
      };
    };
  };
}

const PassengerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
      fetchReservations();
      fetchTripRequests();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    try {
      const data = await UserService.getUserDataFromUsuarios(user.id);
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchTripRequests = async () => {
    if (!user?.id) return;

    setIsLoadingRequests(true);
    try {
      const userData = await UserService.getUserDataFromUsuarios(user.id);
      
      if (!userData || !userData.id_usuario) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const { data: solicitudes, error: solicitudesError } = await supabase
        .from('solicitud_viaje')
        .select(`
          id_solicitud,
          fecha,
          hora_salida,
          hora_llegada,
          estado,
          created_at,
          ruta!inner (
            id_ruta,
            punto_partida,
            punto_llegada,
            trayecto
          ),
          conductor:usuario!solicitud_viaje_id_conductor_fkey (
            nombre,
            apellido,
            celular
          ),
          vehiculo:vehiculo!solicitud_viaje_id_vehiculo_fkey (
            placa,
            color,
            modelo,
            tipo_vehiculo (
              tipo
            )
          )
        `)
        .eq('id_pasajero', userData.id_usuario)
        .order('created_at', { ascending: false });

      if (solicitudesError) throw solicitudesError;

      const formattedSolicitudes = solicitudes.map(s => ({
        id_solicitud: s.id_solicitud,
        fecha: s.fecha,
        hora_salida: s.hora_salida,
        hora_llegada: s.hora_llegada,
        estado: s.estado as 'pendiente' | 'aceptada' | 'rechazada',
        created_at: s.created_at,
        ruta: s.ruta ? {
          id_ruta: s.ruta.id_ruta,
          punto_partida: s.ruta.punto_partida,
          punto_llegada: s.ruta.punto_llegada,
          trayecto: s.ruta.trayecto
        } : undefined,
        viaje: s.estado === 'aceptada' ? {
          conductor: (s.conductor as unknown) as { nombre: string; apellido: string; celular: string } | undefined,
          vehiculo: (s.vehiculo as unknown) as { placa: string; color: string; modelo: number; tipo_vehiculo?: { tipo: string } } | undefined
        } : undefined
      })) as TripRequest[];

      setTripRequests(formattedSolicitudes);
    } catch (err) {
      console.error('Error fetching trip requests:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes de viaje",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchReservations = async () => {
    if (!user?.id) {
      setError('No se pudo identificar el usuario actual');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Primero obtener el id_usuario usando getUserDataFromUsuarios
      const userData = await UserService.getUserDataFromUsuarios(user.id);
      
      if (!userData || !userData.id_usuario) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const { data: reservas, error: reservasError } = await supabase
        .from('reserva')
        .select(`
          id_viaje,
          viaje (
            id_viaje,
            fecha,
            hora_salida,
            hora_llegada,
            id_ruta,
            id_conductor,
            id_vehiculo,
            conductor:usuario!viaje_id_conductor_fkey (
              nombre,
              apellido,
              celular
            ),
            vehiculo:vehiculo (
              placa,
              color,
              modelo,
              tipo:tipo_vehiculo (
                tipo
              )
            ),
            ruta:ruta (
              id_ruta,
              longitud,
              punto_partida,
              punto_llegada,
              trayecto
            )
          )
        `)
        .eq('id_usuario', userData.id_usuario)
        .order('fecha', { ascending: true });

      if (reservasError) throw reservasError;

      // Procesar las reservas
      const reservasProcesadas = reservas
        ?.map(r => r.viaje)
        .filter(v => v !== null)
        .map(viaje => {
          const fechaHoraViaje = new Date(`${viaje.fecha}T${viaje.hora_salida}`);
          const now = new Date();
          
          return {
            ...viaje,
            esFuturo: fechaHoraViaje > now
          };
        }) || [];

      setReservations(reservasProcesadas);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('No se pudieron cargar tus reservas. Por favor, intenta de nuevo más tarde.');
      toast({
        title: "Error",
        description: "No se pudieron cargar tus reservas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return 'Hora no disponible';
    try {
      return timeString.substring(0, 5); // Formato HH:mm
    } catch (error) {
      return 'Hora no disponible';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      return format(date, "EEEE d 'de' MMMM", { locale: es });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const handleCancelReservation = async (tripId: number) => {
    if (!user?.id) return;

    try {
      const userData = await UserService.getUserDataFromUsuarios(user.id);
      
      if (!userData || !userData.id_usuario) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const { error } = await supabase
        .from('reserva')
        .delete()
        .eq('id_usuario', userData.id_usuario)
        .eq('id_viaje', tripId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Reserva cancelada correctamente",
      });

      // Actualizar la lista de reservas
      fetchReservations();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error al cancelar la reserva:', err);
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive",
      });
    }
  };

  // Add function to get route data for the map
  const getRouteData = (reservation: any) => {
    if (!reservation?.ruta?.punto_partida || !reservation?.ruta?.punto_llegada) {
      return null;
    }

    try {
      const puntoPartida = reservation.ruta.punto_partida;
      const puntoLlegada = reservation.ruta.punto_llegada;
      const trayecto = reservation.ruta.trayecto;

      // Extract coordinates: [longitud, latitud] -> [latitud, longitud]
      const [lngPartida, latPartida] = puntoPartida.coordinates;
      const [lngLlegada, latLlegada] = puntoLlegada.coordinates;

      const origin = {
        lat: latPartida,
        lng: lngPartida,
        address: 'Origen'
      };

      const destination = {
        lat: latLlegada,
        lng: lngLlegada,
        address: 'Destino'
      };

      // Convert the route if it exists
      let route: [number, number][] = [];
      if (trayecto && trayecto.coordinates) {
        route = trayecto.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
      }

      return { origin, destination, route };
    } catch (error) {
      console.error('Error parsing route data:', error);
      return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-text">
            Bienvenido, {userData?.nombre || 'Usuario'}
          </h1>
          <p className="text-gray-600 mt-2">
            Aquí puedes ver tus reservas activas y solicitudes de viaje
          </p>
        </div>

        {/* Trip Requests Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-text">Mis Solicitudes de Viaje</h2>
            <button
              onClick={() => navigate('/start-trip')}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              <span>Buscar Rutas</span>
            </button>
          </div>

          {isLoadingRequests ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tripRequests.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No tienes solicitudes de viaje activas</p>
              <button
                onClick={() => navigate('/start-trip')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Crear nueva solicitud
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {tripRequests.map((request) => (
                <div 
                  key={request.id_solicitud}
                  className={`bg-white rounded-lg shadow p-4 ${request.estado === 'aceptada' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                  onClick={() => {
                    if (request.estado === 'aceptada') {
                      setSelectedRequest(request);
                      setIsRequestDialogOpen(true);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-lg font-medium">
                          {formatDate(request.fecha)}
                        </span>
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          request.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          request.estado === 'aceptada' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.estado.charAt(0).toUpperCase() + request.estado.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {request.estado === 'aceptada' && request.viaje && (
                          <>
                            <p className="text-gray-600">
                              <span className="font-medium">Conductor:</span> {request.viaje.conductor?.nombre} {request.viaje.conductor?.apellido}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Vehículo:</span> {request.viaje.vehiculo?.tipo_vehiculo?.tipo} {request.viaje.vehiculo?.color} {request.viaje.vehiculo?.modelo}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Placa:</span> {request.viaje.vehiculo?.placa}
                            </p>
                          </>
                        )}
                        <p className="text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(request.hora_salida)} - {formatTime(request.hora_llegada)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reservations Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-text">Mis Reservas</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No tienes reservas activas</p>
              <button
                onClick={() => navigate('/search-routes')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Buscar rutas
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {reservations.map((reservation) => (
                <div 
                  key={reservation.id_viaje} 
                  className="bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setIsDialogOpen(true);
                  }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">
                            {formatDate(reservation.fecha)}
                          </span>
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                            {reservation.esFuturo ? 'Próximo' : 'Pasado'}
                          </span>
                        </div>
                        <h3 className="text-xl mt-2">
                          <span className="font-medium">Conductor:</span> {reservation.conductor?.nombre} {reservation.conductor?.apellido}
                        </h3>
                        <p className="text-gray-600">
                          Salida: {formatTime(reservation.hora_salida)} | Llegada estimada: {formatTime(reservation.hora_llegada)}
                        </p>
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Vehículo:</span> {reservation.vehiculo?.tipo?.tipo} {reservation.vehiculo?.color} {reservation.vehiculo?.modelo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog para detalles de la solicitud aceptada */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Ruta</h3>
                <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
                  {(() => {
                    const routeData = getRouteData(selectedRequest);
                    if (routeData && routeData.origin && routeData.destination) {
                      return (
                        <RouteMap
                          origin={routeData.origin}
                          destination={routeData.destination}
                          route={routeData.route || []}
                          allowClickToSetPoints={false}
                        />
                      );
                    } else {
                      return (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <p className="text-gray-500">No hay información de ruta disponible</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Conductor</h3>
                <div className="text-gray-600">
                  {selectedRequest.viaje?.conductor?.nombre || 'No disponible'} {selectedRequest.viaje?.conductor?.apellido || ''}
                </div>
                <div className="text-gray-600 flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  {selectedRequest.viaje?.conductor?.celular || 'No disponible'}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Vehículo</h3>
                <div className="text-gray-600">
                  {selectedRequest.viaje?.vehiculo?.tipo_vehiculo?.tipo || 'No disponible'} {selectedRequest.viaje?.vehiculo?.color || ''} {selectedRequest.viaje?.vehiculo?.modelo}
                </div>
                <div className="text-gray-600">
                  Placa: {selectedRequest.viaje?.vehiculo?.placa || 'No disponible'}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Horario</h3>
                <div className="text-gray-600">
                  {formatDate(selectedRequest.fecha)} - {formatTime(selectedRequest.hora_salida)} a {formatTime(selectedRequest.hora_llegada)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para detalles de la reserva */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Ruta</h3>
                <div className="text-gray-600 mb-4">
                  {(() => {
                    const puntoPartida = selectedReservation.ruta?.punto_partida;
                    const puntoLlegada = selectedReservation.ruta?.punto_llegada;
                    
                    // Extract coordinates from GeoJSON if available
                    const origen = puntoPartida?.coordinates ? 
                      `${puntoPartida.coordinates[1]}, ${puntoPartida.coordinates[0]}` : 
                      'No disponible';
                    const destino = puntoLlegada?.coordinates ? 
                      `${puntoLlegada.coordinates[1]}, ${puntoLlegada.coordinates[0]}` : 
                      'No disponible';
                    
                    return `${origen} → ${destino}`;
                  })()}
                </div>
                <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
                  {(() => {
                    const routeData = getRouteData(selectedReservation);
                    if (routeData && routeData.origin && routeData.destination) {
                      return (
                        <RouteMap
                          origin={routeData.origin}
                          destination={routeData.destination}
                          route={routeData.route || []}
                          allowClickToSetPoints={false}
                        />
                      );
                    } else {
                      return (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <p className="text-gray-500">No hay información de ruta disponible</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Conductor</h3>
                <div className="text-gray-600">
                  {selectedReservation.conductor?.nombre || 'No disponible'} {selectedReservation.conductor?.apellido || ''}
                </div>
                <div className="text-gray-600 flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  {selectedReservation.conductor?.celular || 'No disponible'}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Vehículo</h3>
                <div className="text-gray-600">
                  {selectedReservation.vehiculo?.tipo?.tipo || 'No disponible'} {selectedReservation.vehiculo?.color || ''} {selectedReservation.vehiculo?.modelo}
                </div>
                <div className="text-gray-600">
                  Placa: {selectedReservation.vehiculo?.placa || 'No disponible'}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Horario</h3>
                <div className="text-gray-600">
                  {formatDate(selectedReservation.fecha)} - {formatTime(selectedReservation.hora_salida)} a {formatTime(selectedReservation.hora_llegada)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            {selectedReservation?.esFuturo && (
              <Button
                variant="destructive"
                onClick={() => handleCancelReservation(selectedReservation.id_viaje)}
              >
                Cancelar Reserva
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PassengerDashboard; 