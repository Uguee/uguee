import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { TripService } from '@/services/tripService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin } from 'lucide-react';
import { RouteMap } from '@/components/map/RouteMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';

const MyTrips = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { currentUserId } = useCurrentUser();
  const { toast } = useToast();
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [currentUserId]);

  const fetchTrips = async () => {
    if (!currentUserId) {
      setError('No se pudo identificar el usuario actual');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obtener las reservas del usuario (viajes confirmados)
      const { data: reservas, error: reservasError } = await supabase
        .from('reserva')
        .select(`
          id_viaje,
          viaje (
            id_viaje,
            programado_at,
            salida_at,
            llegada_at,
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
        .eq('id_usuario', currentUserId);

      if (reservasError) throw reservasError;

      // Obtener las solicitudes de viaje del usuario (trip requests)
      const { data: solicitudes, error: solicitudesError } = await supabase
        .from('solicitud_viaje')
        .select(`
          id_solicitud,
          salida_at,
          llegada_at,
          estado,
          created_at,
          ruta (
            id_ruta,
            longitud,
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
            tipo:tipo_vehiculo (
              tipo
            )
          )
        `)
        .eq('id_pasajero', currentUserId)
        .order('created_at', { ascending: false });

      if (solicitudesError) throw solicitudesError;

      // Procesar los viajes confirmados
      const viajesConfirmados = reservas
        ?.map(r => r.viaje)
        .filter(v => v !== null)
        .map(viaje => {
          const fechaHoraViaje = new Date(viaje.programado_at);
          const now = new Date();
          
          return {
            ...viaje,
            esFuturo: fechaHoraViaje > now,
            tipo: 'reserva' as const
          };
        }) || [];

      // Procesar las solicitudes de viaje
      const solicitudesProcesadas = (solicitudes as any || []).map((solicitud: any) => {
        const fechaHoraViaje = new Date(solicitud.salida_at);
        const now = new Date();
        
        return {
          id_viaje: solicitud.id_solicitud, // Use id_solicitud as id_viaje for consistency
          programado_at: solicitud.salida_at,
          salida_at: solicitud.salida_at,
          llegada_at: solicitud.llegada_at,
          id_ruta: solicitud.ruta.id_ruta,
          id_conductor: solicitud.conductor?.id_usuario,
          id_vehiculo: solicitud.vehiculo?.placa,
          conductor: solicitud.conductor,
          vehiculo: solicitud.vehiculo,
          ruta: solicitud.ruta,
          esFuturo: fechaHoraViaje > now,
          estado: solicitud.estado,
          tipo: 'solicitud' as const
        };
      });

      // Combinar ambos arrays
      const todosLosViajes = [...viajesConfirmados, ...solicitudesProcesadas];

      // Separar viajes futuros y pasados
      const viajesFuturos = todosLosViajes.filter(viaje => viaje.esFuturo);
      const viajesPasados = todosLosViajes.filter(viaje => !viaje.esFuturo);

      setTrips(viajesFuturos);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('No se pudieron cargar tus viajes. Por favor, intenta de nuevo más tarde.');
      toast({
        title: "Error",
        description: "No se pudieron cargar tus viajes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string | null | undefined) => {
    if (!timestamp) return 'Hora no disponible';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return 'Hora no disponible';
    }
  };

  const formatDate = (timestamp: string | null | undefined) => {
    if (!timestamp) return 'Fecha no disponible';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  // Filtrar viajes según la pestaña activa
  const filteredTrips = trips.filter(trip => {
    if (!trip?.programado_at) return false;
    try {
      const fechaHoraViaje = new Date(trip.programado_at);
      if (isNaN(fechaHoraViaje.getTime())) return false;
      const now = new Date();
      
      return activeTab === 'upcoming' 
        ? fechaHoraViaje > now  // Viajes futuros
        : fechaHoraViaje <= now; // Viajes pasados
    } catch (error) {
      return false;
    }
  });

  const handleCancelTrip = async (tripId: number) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('reserva')
        .delete()
        .eq('id_usuario', currentUserId)
        .eq('id_viaje', tripId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Viaje cancelado correctamente",
      });

      // Actualizar la lista de viajes
      fetchTrips();
    } catch (err) {
      console.error('Error al cancelar el viaje:', err);
      toast({
        title: "Error",
        description: "No se pudo cancelar el viaje",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (trip: any) => {
    try {
      const { data, error } = await supabase
        .rpc('obtener_ruta_con_coordenadas', {
          p_id_ruta: trip.id_ruta
        });

      if (error) throw error;

      if (data && data.length > 0) {
        setSelectedTrip({
          ...trip,
          routeDetails: data[0]
        });
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error al obtener detalles de la ruta:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la ruta",
        variant: "destructive",
      });
    }
  };

  // Add getRouteData helper function
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
        address: 'Punto de partida'
      };

      const destination = {
        lat: latLlegada,
        lng: lngLlegada,
        address: 'Punto de llegada'
      };

      // Convert route if it exists
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
        <div>
          <h1 className="text-3xl font-bold text-text">Mis viajes</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pasados
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay viajes {activeTab === 'upcoming' ? 'próximos' : 'pasados'}</p>
              {activeTab === 'upcoming' && (
                <Link
                  to="/search-routes"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Buscar rutas
                </Link>
              )}
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div key={trip.id_viaje} className="bg-white rounded-lg shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">
                          {formatDate(trip.programado_at)}
                        </span>
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          trip.tipo === 'solicitud' 
                            ? trip.estado === 'aceptada' 
                              ? 'bg-green-100 text-green-800'
                              : trip.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            : activeTab === 'upcoming' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {trip.tipo === 'solicitud' 
                            ? trip.estado === 'aceptada' 
                              ? 'Aceptada'
                              : trip.estado === 'pendiente'
                              ? 'Pendiente'
                              : 'Rechazada'
                            : activeTab === 'upcoming' 
                              ? 'Próximo' 
                              : 'Pasado'}
                        </span>
                      </div>
                      <h3 className="text-xl mt-2">
                        <span className="font-medium">
                          {trip.tipo === 'solicitud' ? 'Solicitud de viaje' : 'Conductor:'}
                        </span> {trip.conductor?.nombre} {trip.conductor?.apellido}
                      </h3>
                      <p className="text-gray-600">
                        Salida: {formatTime(trip.salida_at || trip.programado_at)} | Llegada estimada: {formatTime(trip.llegada_at)}
                      </p>
                      {trip.vehiculo && (
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Vehículo:</span> {trip.vehiculo?.tipo?.tipo} {trip.vehiculo?.color} {trip.vehiculo?.modelo}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewDetails(trip)}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Ver detalles
                      </button>
                      {activeTab === 'upcoming' && (
                        <button
                          onClick={() => handleCancelTrip(trip.id_viaje)}
                          className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog para detalles del viaje */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del viaje</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="mt-4">
              <div className="h-[400px] rounded-lg overflow-hidden">
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
              <div className="mt-4">
                <h3 className="font-medium">Horario</h3>
                <div className="text-gray-600">
                  {formatDate(selectedTrip.programado_at)} - {formatTime(selectedTrip.salida_at || selectedTrip.programado_at)}
                  {selectedTrip.llegada_at && ` | Llegada: ${formatTime(selectedTrip.llegada_at)}`}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyTrips;