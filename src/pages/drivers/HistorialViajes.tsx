import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { UserService } from '../../services/userService';
import { User } from '../../types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../../components/ui/accordion";
import { RouteMap } from '../../components/map/RouteMap';
import { TripReviews } from '../../components/reviews/TripReviews';
import { Star } from 'lucide-react';
import { ReviewService } from '@/services/reviewService';

interface ViajeDetalle {
  id_viaje: number;
  id_ruta: number;
  id_conductor: number;
  id_vehiculo: string;
  programado_at: string;
  salida_at: string | null;
  llegada_at: string | null;
  ruta?: {
    id_ruta: number;
    punto_partida: {
      type: string;
      coordinates: number[];
    };
    punto_llegada: {
      type: string;
      coordinates: number[];
    };
    longitud: number;
    trayecto?: {
      type: string;
      coordinates: number[][];
    };
  };
  vehiculo?: {
    placa: string;
    tipo: number;
    tipo_vehiculo: {
      tipo: string;
    };
  };
  pasajeros: {
    id_usuario: number;
    usuario?: {
      nombre: string;
      apellido: string;
      celular: string | number;
    };
  }[];
}

interface RegistroData {
  id_usuario: number;
  validacion_conductor: string;
}

interface ExtendedUser extends User {
  raw_data?: {
    id_usuario: number;
  };
}

interface RutaSupabase {
  id_ruta: number;
  punto_partida: { coordinates: number[] };
  punto_llegada: { coordinates: number[] };
  trayecto: { coordinates: number[][] };
  longitud: number;
}

const HistorialViajes = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viajes, setViajes] = useState<ViajeDetalle[]>([]);
  const [activeTab, setActiveTab] = useState<'proximos' | 'pasados'>('proximos');
  const { user } = useAuth();
  const { toast } = useToast();
  const [viajeACancelar, setViajeACancelar] = useState<number | null>(null);
  const [expandedViajes, setExpandedViajes] = useState<Record<number, boolean>>({});
  const [viajesReviews, setViajesReviews] = useState<Record<number, { promedio: number, total: number }>>({});

  useEffect(() => {
    const cargarViajes = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Primero obtener el id_usuario usando getUserDataFromUsuarios
        const userData = await UserService.getUserDataFromUsuarios(user.id);
        console.log('UserData completo:', userData);
        
        if (!userData || !userData.id_usuario) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        const id_usuario = userData.id_usuario;

        const { data: viajesData, error: viajesError } = await supabase
          .from('viaje')
          .select(`
            *,
            ruta (
              id_ruta,
              punto_partida,
              punto_llegada,
              longitud,
              trayecto
            ),
            vehiculo (
              placa,
              tipo,
              tipo_vehiculo (
                tipo
              )
            ),
            pasajeros:reserva (
              id_usuario,
              usuario:usuario (
                nombre,
                apellido,
                celular
              )
            )
          `)
          .eq('id_conductor', id_usuario)
          .order('programado_at', { ascending: true });

        if (viajesError) throw viajesError;

        // Also fetch accepted trip requests for this driver
        const { data: solicitudesData, error: solicitudesError } = await supabase
          .from('solicitud_viaje')
          .select(`
            id_solicitud,
            salida_at,
            llegada_at,
            estado,
            created_at,
            ruta (
              id_ruta,
              punto_partida,
              punto_llegada,
              longitud,
              trayecto
            ),
            pasajero:usuario!solicitud_viaje_id_pasajero_fkey (
              nombre,
              apellido,
              celular
            ),
            vehiculo:vehiculo!solicitud_viaje_id_vehiculo_fkey (
              placa,
              tipo,
              tipo_vehiculo (
                tipo
              )
            )
          `)
          .eq('id_conductor', id_usuario)
          .eq('estado', 'aceptada')
          .order('salida_at', { ascending: true });

        if (solicitudesError) throw solicitudesError;

        if (viajesData || solicitudesData) {
          console.log('Viajes data:', viajesData);
          console.log('Solicitudes data:', solicitudesData);
          
          // Process regular trips
          const viajesProcesados = (viajesData || []).map(viaje => ({
            ...viaje,
            pasajeros: Array.isArray(viaje.pasajeros) ? viaje.pasajeros : [],
            ruta: viaje.ruta ? {
              ...viaje.ruta,
              punto_partida: {
                type: 'Point',
                coordinates: ((viaje.ruta as RutaSupabase).punto_partida as { coordinates: number[] }).coordinates || [0, 0]
              },
              punto_llegada: {
                type: 'Point',
                coordinates: ((viaje.ruta as RutaSupabase).punto_llegada as { coordinates: number[] }).coordinates || [0, 0]
              },
              trayecto: {
                type: 'LineString',
                coordinates: ((viaje.ruta as RutaSupabase).trayecto as { coordinates: number[][] }).coordinates || []
              }
            } : undefined,
            tipo: 'viaje' as const
          }));

          // Process trip requests (convert to same format as trips)
          const solicitudesProcesadas = ((solicitudesData as any) || []).map((solicitud: any) => ({
            id_viaje: solicitud.id_solicitud, // Use id_solicitud as id_viaje for consistency
            id_ruta: solicitud.ruta.id_ruta,
            id_conductor: id_usuario,
            id_vehiculo: solicitud.vehiculo?.placa || null,
            programado_at: solicitud.salida_at, // Use salida_at as programado_at
            salida_at: solicitud.salida_at,
            llegada_at: solicitud.llegada_at,
            ruta: solicitud.ruta ? {
              ...solicitud.ruta,
              punto_partida: {
                type: 'Point',
                coordinates: ((solicitud.ruta as RutaSupabase).punto_partida as { coordinates: number[] }).coordinates || [0, 0]
              },
              punto_llegada: {
                type: 'Point',
                coordinates: ((solicitud.ruta as RutaSupabase).punto_llegada as { coordinates: number[] }).coordinates || [0, 0]
              },
              trayecto: {
                type: 'LineString',
                coordinates: ((solicitud.ruta as RutaSupabase).trayecto as { coordinates: number[][] }).coordinates || []
              }
            } : undefined,
            vehiculo: solicitud.vehiculo ? {
              placa: solicitud.vehiculo.placa,
              tipo: solicitud.vehiculo.tipo,
              tipo_vehiculo: solicitud.vehiculo.tipo_vehiculo
            } : null,
            pasajeros: [{
              id_usuario: solicitud.pasajero?.id_usuario || 0,
              usuario: solicitud.pasajero
            }],
            tipo: 'solicitud' as const
          }));

          // Combine both arrays
          const todosLosViajes = [...viajesProcesados, ...solicitudesProcesadas];
          
          setViajes(todosLosViajes as ViajeDetalle[]);
        }
      } catch (err) {
        console.error('Error cargando viajes:', err);
        const mensaje = err instanceof Error ? err.message : 'Error al cargar los viajes';
        setError(mensaje);
        toast({
          title: "Error",
          description: mensaje,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    cargarViajes();
  }, [user, toast]);

  useEffect(() => {
    const cargarReviews = async () => {
      const reviewsPromises = viajes.filter(viaje => viaje.id_viaje).map(async (viaje) => {
        const reviews = await ReviewService.getTripReviews(viaje.id_viaje);
        return { id: viaje.id_viaje, reviews };
      });

      const reviews = await Promise.all(reviewsPromises);
      const reviewsMap = reviews.reduce((acc, { id, reviews }) => ({
        ...acc,
        [id]: { promedio: reviews.promedio, total: reviews.total_resenas }
      }), {});

      setViajesReviews(reviewsMap);
    };

    if (viajes.length > 0) {
      cargarReviews();
    }
  }, [viajes]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Hora no disponible';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar viajes según la pestaña activa
  const viajesFiltrados = viajes.filter(viaje => {
    const fechaViaje = new Date(viaje.programado_at);
    const ahora = new Date();
    return activeTab === 'proximos' ? fechaViaje > ahora : fechaViaje <= ahora;
  });

  // Función para cancelar viaje
  const cancelarViaje = async (idViaje: number) => {
    try {
      const { error } = await supabase
        .from('viaje')
        .delete()
        .eq('id_viaje', idViaje);

      if (error) throw error;

      // Actualizar el estado local eliminando el viaje
      setViajes(viajes.filter(viaje => viaje.id_viaje !== idViaje));

      toast({
        title: "Viaje cancelado",
        description: "El viaje ha sido eliminado exitosamente",
      });
    } catch (err) {
      console.error('Error cancelando viaje:', err);
      toast({
        title: "Error",
        description: "No se pudo cancelar el viaje",
        variant: "destructive",
      });
    } finally {
      setViajeACancelar(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Historial de Viajes</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus viajes programados y revisa el historial
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('proximos')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'proximos'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Próximos Viajes
            </button>
            <button
              onClick={() => setActiveTab('pasados')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pasados'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Viajes Pasados
            </button>
          </nav>
        </div>

        {/* Contenido */}
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Cargando viajes...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : viajesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes viajes {activeTab === 'proximos' ? 'próximos' : 'pasados'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'proximos'
                  ? 'Crea un nuevo viaje para comenzar.'
                  : 'Los viajes completados aparecerán aquí.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {viajesFiltrados.map((viaje) => (
                <Accordion
                  key={viaje.id_viaje}
                  type="single"
                  collapsible
                  className="bg-white rounded-lg shadow"
                >
                  <AccordionItem value={`viaje-${viaje.id_viaje}`}>
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <h3 className="font-medium">Viaje #{viaje.id_viaje}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(viaje.programado_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            {viaje.pasajeros?.length || 0} pasajeros
                          </span>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            viaje.llegada_at 
                              ? 'bg-green-100 text-green-800' 
                              : viaje.salida_at
                              ? 'bg-blue-100 text-blue-800'
                              : new Date(viaje.programado_at) < new Date()
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {viaje.llegada_at 
                              ? 'Completado' 
                              : viaje.salida_at
                              ? 'En curso'
                              : new Date(viaje.programado_at) < new Date()
                              ? 'No realizado'
                              : 'Programado'}
                          </span>
                          {/* Botón de eliminar solo para viajes futuros que no han comenzado */}
                          {!viaje.llegada_at && !viaje.salida_at && new Date(viaje.programado_at) > new Date() && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViajeACancelar(viaje.id_viaje);
                              }}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm">Horario</h4>
                            <p className="text-gray-600">
                              Programado: {formatTime(viaje.programado_at)}
                            </p>
                            {viaje.salida_at && (
                              <p className="text-gray-600">
                                Salida: {formatTime(viaje.salida_at)}
                              </p>
                            )}
                            {viaje.llegada_at && (
                              <p className="text-gray-600">
                                Llegada: {formatTime(viaje.llegada_at)}
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Vehículo</h4>
                            <p className="text-gray-600">
                              Placa: {viaje.vehiculo?.placa}
                            </p>
                            <p className="text-gray-600">
                              Tipo: {viaje.vehiculo?.tipo_vehiculo.tipo}
                            </p>
                          </div>
                        </div>

                        {/* Mapa de la ruta */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Ruta</h4>
                          <div className="h-[300px] rounded-lg overflow-hidden border">
                            <RouteMap
                              origin={{
                                lat: viaje.ruta?.punto_partida.coordinates[1] || 0,
                                lng: viaje.ruta?.punto_partida.coordinates[0] || 0,
                                address: "Origen"
                              }}
                              destination={{
                                lat: viaje.ruta?.punto_llegada.coordinates[1] || 0,
                                lng: viaje.ruta?.punto_llegada.coordinates[0] || 0,
                                address: "Destino"
                              }}
                              route={viaje.ruta?.trayecto?.coordinates.map(([lng, lat]) => [lat, lng]) || []}
                              allowClickToSetPoints={false}
                            />
                          </div>
                        </div>

                        {/* Reseñas */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Reseñas</h4>
                          <TripReviews id_viaje={viaje.id_viaje} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación */}
      <AlertDialog open={viajeACancelar !== null} onOpenChange={() => setViajeACancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará el viaje y notificará a los pasajeros registrados.
              No podrás deshacer esta acción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => viajeACancelar && cancelarViaje(viajeACancelar)}
              className="bg-red-500 hover:bg-red-600"
            >
              Sí, cancelar viaje
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default HistorialViajes;
