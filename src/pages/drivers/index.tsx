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
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [proximasRutas, setProximasRutas] = useState<any[]>([]);
  const [reservasHoy, setReservasHoy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calificacion, setCalificacion] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requesters, setRequesters] = useState<any[]>([]);
  const [loadingRequesters, setLoadingRequesters] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.id) return;

      try {
        // Obtener datos del usuario
        const userData = await UserService.getUserDataFromUsuarios(user.id);
        setUserData(userData);

        if (!userData?.id_usuario) return;

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
              punto_llegada
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
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
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

        {/* Lista de próximas rutas */}
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
                <div key={viaje.id_viaje} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Viaje #{viaje.id_viaje}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(viaje.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {viaje.hora_salida.substring(0, 5)} - {viaje.hora_llegada.substring(0, 5)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleViewRequesters(viaje.id_viaje)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pasajeros del viaje</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {loadingRequesters ? (
              <div className="text-center py-4">Cargando pasajeros...</div>
            ) : requesters.length > 0 ? (
              <div className="space-y-3">
                {requesters.map((requester, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{requester.nombre} {requester.apellido}</p>
                      <p className="text-sm text-gray-600">{requester.celular}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay pasajeros registrados
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard; 