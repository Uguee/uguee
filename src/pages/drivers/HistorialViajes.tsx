import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { UserService } from '../../services/userService';
import { User } from '../../types';

interface ViajeDetalle {
  id_viaje: number;
  id_ruta: number;
  id_conductor: number;
  id_vehiculo: string;
  fecha: string;
  hora_salida: string;
  hora_llegada: string;
  estado: 'pendiente' | 'en_curso' | 'completado' | 'cancelado';
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
            const fechaViaje = new Date(`${viaje.fecha}T${viaje.hora_salida}`);
            const now = new Date();
            const estado = fechaViaje > now ? 'pendiente' : 'completado';

            return {
              ...viaje,
              origen: 'Origen',  // Placeholder simple
              destino: 'Destino', // Placeholder simple
              pasajeros: Array.isArray(viaje.pasajeros) ? viaje.pasajeros.length : 0,
              estado,
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
    const fechaViaje = new Date(viaje.fecha);
    const now = new Date();
    
    return activeTab === 'proximos' 
      ? fechaViaje >= now && viaje.estado !== 'cancelado'
      : fechaViaje < now || viaje.estado === 'completado';
  });

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
                <div
                  key={viaje.id_viaje}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-1">
                        <span className="font-medium mr-2">
                          {formatDate(viaje.fecha)}
                        </span>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          viaje.estado === 'completado' 
                            ? 'bg-green-100 text-green-800'
                            : viaje.estado === 'cancelado'
                            ? 'bg-red-100 text-red-800'
                            : viaje.estado === 'en_curso'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {viaje.estado.charAt(0).toUpperCase() + viaje.estado.slice(1).replace('_', ' ')}
                        </span>
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
                      <button
                        onClick={() => {/* TODO: Implementar vista detalle */}}
                        className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-colors text-center"
                      >
                        Ver detalles
                      </button>
                      
                      {activeTab === 'proximos' && viaje.estado === 'pendiente' && (
                        <button 
                          onClick={() => {/* TODO: Implementar cancelación */}}
                          className="border border-red-500 text-red-500 hover:bg-red-50 py-2 px-4 rounded-md transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HistorialViajes;
