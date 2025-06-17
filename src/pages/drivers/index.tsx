import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../integrations/supabase/client';
import { 
  MapIcon, 
  UsersIcon,
} from '@heroicons/react/24/outline';
import { ReviewService } from '@/services/reviewService';
import { UserService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Star, Clock, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RouteMap } from '@/components/map/RouteMap';

interface AcceptedRequest {
  id_solicitud: number;
  fecha: string;
  hora_salida: string;
  hora_llegada: string | null;
  estado: 'aceptada';
  created_at: string;
  ruta: {
    id_ruta: number;
    punto_partida: {
      type: string;
      coordinates: [number, number];
    };
    punto_llegada: {
      type: string;
      coordinates: [number, number];
    };
    trayecto: {
      type: string;
      coordinates: [number, number][];
    };
  };
  pasajero: {
    nombre: string;
    apellido: string;
    celular: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ id_usuario: number; nombre: string } | null>(null);
  const [proximasRutas, setProximasRutas] = useState<any[]>([]);
  const [reservasHoy, setReservasHoy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calificacion, setCalificacion] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requesters, setRequesters] = useState<any[]>([]);
  const [loadingRequesters, setLoadingRequesters] = useState(false);
  const [acceptedRequests, setAcceptedRequests] = useState<AcceptedRequest[]>([]);
  const [loadingAcceptedRequests, setLoadingAcceptedRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AcceptedRequest | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select('*')
          .eq('id_usuario', parseInt(user.id))
          .single();

        if (userError) throw userError;
        setUserData(userData as { id_usuario: number; nombre: string });

        // Cargar próximas rutas
        const { data: rutas, error: rutasError } = await supabase
          .from('viaje')
          .select(`
            id_viaje,
            fecha,
            hora_salida,
            hora_llegada,
            id_ruta,
            ruta (
              punto_partida,
              punto_llegada,
              trayecto
            )
          `)
          .eq('id_conductor', parseInt(user?.id || '0'))
          .gte('fecha', new Date().toISOString().split('T')[0])
          .order('fecha', { ascending: true });

        if (rutasError) throw rutasError;
        setProximasRutas(rutas || []);

        // Cargar solicitudes aceptadas
        const { data: acceptedRequestsData, error: acceptedRequestsError } = await supabase
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
            pasajero:usuario!solicitud_viaje_id_pasajero_fkey (
              nombre,
              apellido,
              celular
            )
          `)
          .eq('id_conductor', parseInt(user?.id || '0'))
          .eq('estado', 'aceptada')
          .order('fecha', { ascending: true });

        if (acceptedRequestsError) throw acceptedRequestsError;
        setAcceptedRequests(acceptedRequestsData as unknown as AcceptedRequest[]);

        // Obtener estadísticas del conductor
        const driverStats = await ReviewService.getDriverStats(userData.id_usuario);
        setCalificacion(driverStats.promedio);

        // Obtener próximos viajes
        const today = new Date().toISOString().split('T')[0];
        
        // Primero obtenemos los viajes
        const { data: viajesData, error: viajesError } = await supabase
          .from('viaje')
          .select(`
            id_viaje,
            fecha,
            hora_salida,
            hora_llegada,
            id_ruta,
            ruta (
              punto_partida,
              punto_llegada,
              trayecto
            )
          `)
          .eq('id_conductor', userData.id_usuario)
          .gte('fecha', today)
          .order('fecha', { ascending: true });

        if (viajesError) throw viajesError;

        // Luego, para cada viaje, obtenemos sus reservas
        const viajesConReservas = await Promise.all(viajesData?.map(async (viaje) => {
          const { data: reservas, error: reservasError } = await supabase
            .from('reserva')
            .select('id_usuario')
            .eq('id_viaje', viaje.id_viaje);

          if (reservasError) {
            console.error('Error obteniendo reservas:', reservasError);
            return {
              ...viaje,
              cantidadReservas: 0
            };
          }

          return {
            ...viaje,
            cantidadReservas: reservas?.length || 0
          };
        }) || []);

        // Procesar los viajes
        const viajesFiltrados = viajesConReservas.map(viaje => {
          const fechaHoraViaje = new Date(`${viaje.fecha}T${viaje.hora_salida}`);
          const now = new Date();
          
          return {
            ...viaje,
            esFuturo: fechaHoraViaje > now
          };
        });

        // Filtrar solo los viajes futuros
        const viajesProximos = viajesFiltrados.filter(viaje => viaje.esFuturo);
        setProximasRutas(viajesProximos);
        
        // Contar reservas de hoy
        const reservasDeHoy = viajesFiltrados
          .filter(viaje => viaje.fecha === today)
          .reduce((total, viaje) => total + viaje.cantidadReservas, 0);

        setReservasHoy(reservasDeHoy);

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
        setLoadingAcceptedRequests(false);
      }
    };

    cargarDatos();
  }, [user]);

  const handleViewRequesters = async (tripId: number) => {
    setLoadingRequesters(true);
    try {
      const { data: reservas, error } = await supabase
        .from('reserva')
        .select(`
          id_usuario,
          usuario:usuario (
            nombre,
            apellido,
            celular
          )
        `)
        .eq('id_viaje', tripId);

      if (error) throw error;

      setRequesters(reservas?.map(r => r.usuario) || []);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching requesters:', error);
    } finally {
      setLoadingRequesters(false);
    }
  };

  // Componente para mostrar estrellas
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
      // Add T00:00:00 to ensure proper timezone handling
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      return date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const getRouteData = (trip: any) => {
    if (!trip?.ruta?.punto_partida || !trip?.ruta?.punto_llegada) {
      return null;
    }

    try {
      const puntoPartida = trip.ruta.punto_partida;
      const puntoLlegada = trip.ruta.punto_llegada;
      const trayecto = trip.ruta.trayecto;

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-text">
            Bienvenido conductor, {userData?.nombre || ''}
          </h1>
          <button
            onClick={() => navigate('/driver/create-trip')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span>Iniciar Viaje</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card: Próximas Rutas */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => navigate('/driver/historial-viajes')}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{proximasRutas.length}</h2>
                <p className="text-gray-600">Próximas rutas</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <MapIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Card: Reservas de Hoy */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{reservasHoy}</h2>
                <p className="text-gray-600">Reservas programadas hoy</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <UsersIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Card: Calificación */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col">
              <p className="text-gray-600 mb-2">Calificación promedio</p>
              <StarRating rating={calificacion} />
              <p className="text-xl font-bold mt-2">{calificacion.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Accepted Requests Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-text">Solicitudes Aceptadas</h2>
          {loadingAcceptedRequests ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : acceptedRequests.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No tienes solicitudes aceptadas</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {acceptedRequests.map((request) => (
                <div 
                  key={request.id_solicitud}
                  className="bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsRequestDialogOpen(true);
                  }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">
                            {formatDate(request.fecha)}
                          </span>
                          <span className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                            Aceptada
                          </span>
                        </div>
                        <h3 className="text-xl mt-2">
                          <span className="font-medium">Pasajero:</span> {request.pasajero?.nombre} {request.pasajero?.apellido}
                        </h3>
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

        {/* Next Routes Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Próximas Rutas</h2>
            <Link
              to="/driver/history"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Ver historial completo →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando rutas...</div>
          ) : proximasRutas.length > 0 ? (
            <div className="space-y-4">
              {proximasRutas.map((viaje) => (
                <div 
                  key={viaje.id_viaje} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setSelectedTrip(viaje);
                    setIsDialogOpen(true);
                  }}
                >
                  <div>
                    <h3 className="font-medium">Viaje #{viaje.id_viaje}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(viaje.fecha)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(viaje.hora_salida)} - {formatTime(viaje.hora_llegada)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRequesters(viaje.id_viaje);
                      }}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                      disabled={loadingRequesters}
                    >
                      {viaje.cantidadReservas} reservas
                    </button>
                    <span className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-full">
                      Programado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No hay rutas próximas programadas
            </div>
          )}
        </div>
      </div>

      {/* Dialog para mostrar los pasajeros */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Viaje</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Ruta</h3>
                <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
                  {(() => {
                    const routeData = getRouteData(selectedTrip);
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
                <h3 className="font-medium">Horario</h3>
                <div className="text-gray-600">
                  {formatDate(selectedTrip.fecha)} - {formatTime(selectedTrip.hora_salida)} a {formatTime(selectedTrip.hora_llegada)}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Pasajeros</h3>
                {requesters.length > 0 ? (
                  <div className="space-y-2">
                    {requesters.map((requester, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{requester.nombre} {requester.apellido}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Smartphone className="w-4 h-4" />
                            {requester.celular}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay pasajeros registrados</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                <h3 className="font-medium">Pasajero</h3>
                <div className="text-gray-600">
                  {selectedRequest.pasajero?.nombre} {selectedRequest.pasajero?.apellido}
                </div>
                <div className="text-gray-600 flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  {selectedRequest.pasajero?.celular || 'No disponible'}
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
    </DashboardLayout>
  );
};

export default Dashboard; 