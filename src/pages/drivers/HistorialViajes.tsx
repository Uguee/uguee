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
  fecha: string;
  hora_salida: string;
  hora_llegada: string;
  origen: string;
  destino: string;
  pasajeros: number;
  ruta?: {
    id_ruta: number;
    punto_partida: any;
    punto_llegada: any;
    longitud: number;
  };
  vehiculo?: {
    placa: string;
    tipo: number;
    tipo_vehiculo: {
      tipo: string;
    };
  };
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
        // Obtener el id_usuario del UserService
        const userData = await UserService.getUserByUuid(user.id) as ExtendedUser;
        console.log('UserData completo:', userData);
        
        // Acceder directamente a la propiedad raw_data
        const id_usuario = userData?.id_usuario;
        if (!id_usuario) {
          throw new Error('No se pudo obtener el ID del usuario');
        }

        const { data: viajesData, error: viajesError } = await supabase
          .from('viaje')
          .select(`
            *,
            ruta (
              id_ruta,
              punto_partida,
              punto_llegada,
              longitud
            ),
            vehiculo (
              placa,
              tipo,
              tipo_vehiculo (
                tipo
              )
            ),
            pasajeros (
              id_usuario
            )
          `)
          .eq('id_conductor', id_usuario)
          .order('fecha', { ascending: true });

        if (viajesError) throw viajesError;

        if (viajesData) {
          console.log('Viajes data:', viajesData);
          setViajes(viajesData.map(viaje => {
            // Verificar si ruta es un error o es el objeto esperado
            const rutaSegura = viaje.ruta && 
                              typeof viaje.ruta === 'object' && 
                              !Object.prototype.hasOwnProperty.call(viaje.ruta, 'error')
                                ? viaje.ruta 
                                : undefined;
            
            return {
              ...viaje,
              origen: 'Origen',
              destino: 'Destino',
              pasajeros: Array.isArray(viaje.pasajeros) ? viaje.pasajeros.length : 0,
              ruta: rutaSegura,
              vehiculo: {
                placa: viaje.vehiculo?.placa || 'No disponible',
                tipo: viaje.vehiculo?.tipo || 0,
                tipo_vehiculo: viaje.vehiculo?.tipo_vehiculo || { tipo: 'No disponible' }
              }
            };
          }));
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // Formato HH:mm
  };

  // Filtrar viajes según la pestaña activa
  const viajesFiltrados = viajes.filter(viaje => {
    const fechaHoraViaje = new Date(`${viaje.fecha}T${viaje.hora_salida}`);
    const now = new Date();
    
    return activeTab === 'proximos' 
      ? fechaHoraViaje > now  // Viajes futuros
      : fechaHoraViaje <= now; // Viajes pasados
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

  // Función para convertir coordenadas de la BD a formato de RouteMap
  const getRouteData = (viaje: ViajeDetalle) => {
    if (
      !viaje.ruta ||
      !viaje.ruta.punto_partida ||
      !viaje.ruta.punto_llegada ||
      !Array.isArray(viaje.ruta.punto_partida.coordinates) ||
      !Array.isArray(viaje.ruta.punto_llegada.coordinates)
    ) {
      return null;
    }

    // Extraer coordenadas: [longitud, latitud]
    const [lngPartida, latPartida] = viaje.ruta.punto_partida.coordinates;
    const [lngLlegada, latLlegada] = viaje.ruta.punto_llegada.coordinates;

    const origin = {
      lat: latPartida,
      lng: lngPartida,
      address: viaje.origen || 'Origen'
    };

    const destination = {
      lat: latLlegada,
      lng: lngLlegada,
      address: viaje.destino || 'Destino'
    };

    return { origin, destination, route: [] };
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
                >
                  <AccordionItem value={`viaje-${viaje.id_viaje}`} className="border-none">
                    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center mb-1">
                            <span className="font-medium mr-2">
                              {formatDate(viaje.fecha)}
                            </span>
                            <span className={`text-sm px-2 py-0.5 rounded-full ${
                              new Date(`${viaje.fecha}T${viaje.hora_salida}`) > new Date()
                                ? 'bg-blue-100 text-blue-800'  // Viaje próximo
                                : 'bg-green-100 text-green-800' // Viaje pasado
                            }`}>
                              {new Date(`${viaje.fecha}T${viaje.hora_salida}`) > new Date() ? 'Próximo' : 'Completado'}
                            </span>
                            {viajesReviews[viaje.id_viaje] && (
                              <div className="flex items-center ml-3">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= viajesReviews[viaje.id_viaje].promedio
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600 ml-2">
                                  ({viajesReviews[viaje.id_viaje].total} {
                                    viajesReviews[viaje.id_viaje].total === 1 ? 'reseña' : 'reseñas'
                                  })
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg font-medium text-text">
                            De {viaje.origen} a {viaje.destino}
                          </h3>
                          <p className="text-gray-500">
                            Salida: {formatTime(viaje.hora_salida)} | Llegada estimada: {formatTime(viaje.hora_llegada)}
                          </p>
                          <div className="mt-2 flex items-center">
                            <span className="text-gray-700">
                              Vehículo ID: {viaje.vehiculo?.placa || 'No asignado'}
                              {viaje.vehiculo?.tipo_vehiculo ? ` | Tipo: ${viaje.vehiculo.tipo_vehiculo.tipo}` : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row md:flex-col justify-end gap-2">
                          <AccordionTrigger className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-colors text-center hover:no-underline justify-center">
                            Ver detalles
                          </AccordionTrigger>
                          
                          {activeTab === 'proximos' && (
                            <button 
                              onClick={() => setViajeACancelar(viaje.id_viaje)}
                              className="border border-red-500 text-red-500 hover:bg-red-50 py-2 px-4 rounded-md transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <AccordionContent>
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h4 className="text-md font-medium mb-3 text-gray-800">Detalles del viaje</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Información del viaje</h5>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start">
                                  <span className="font-medium mr-2">Origen:</span>
                                  <span>{viaje.origen}</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-medium mr-2">Destino:</span>
                                  <span>{viaje.destino}</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-medium mr-2">Fecha:</span>
                                  <span>{formatDate(viaje.fecha)}</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-medium mr-2">Hora de salida:</span>
                                  <span>{formatTime(viaje.hora_salida)}</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-medium mr-2">Hora estimada de llegada:</span>
                                  <span>{formatTime(viaje.hora_llegada)}</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-medium mr-2">Pasajeros:</span>
                                  <span>{viaje.pasajeros}</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Información del vehículo</h5>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start">
                                  <span className="font-medium mr-2">Placa:</span>
                                  <span>{viaje.vehiculo?.placa || 'No asignado'}</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-medium mr-2">Tipo:</span>
                                  <span>{viaje.vehiculo?.tipo_vehiculo?.tipo || 'No asignado'}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                          
                          {/* Mapa de la ruta */}
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Ruta del viaje</h5>
                            <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300">
                              {(() => {
                                const routeData = getRouteData(viaje);
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

                          {/* Agregar el componente TripReviews */}
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Reseñas del viaje</h5>
                            <TripReviews id_viaje={viaje.id_viaje} />
                          </div>
                        </div>
                      </AccordionContent>
                    </div>
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
