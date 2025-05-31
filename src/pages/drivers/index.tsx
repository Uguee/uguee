import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../integrations/supabase/client';
import { 
  MapIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';
import { ReviewService } from '@/services/reviewService';
import { UserService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Star } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proximasRutas, setProximasRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    promedio: 0,
    total_resenas: 0
  });

  useEffect(() => {
    cargarProximasRutas();
    const cargarEstadisticas = async () => {
      if (!user?.id) return;

      try {
        // Obtener el id_usuario del conductor
        const userData = await UserService.getUserDataFromUsuarios(user.id);
        if (!userData?.id_usuario) return;

        // Obtener las estadísticas
        const driverStats = await ReviewService.getDriverStats(userData.id_usuario);
        setStats(driverStats);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    cargarEstadisticas();
  }, []);

  const cargarProximasRutas = async () => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('viaje')
        .select(`
          *,
          pasajeros (
            id_usuario
          )
        `)
        .gt('fecha', now.toISOString())
        .order('fecha', { ascending: true });

      if (error) throw error;
      setProximasRutas(data || []);
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-text">Panel de Control</h1>
          <button
            onClick={() => navigate('/driver/create-trip')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span>Iniciar Viaje</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Card: Pasajeros Totales */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">5</h2>
                <p className="text-gray-600">Pasajeros programados hoy</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <UsersIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Card: Estado Actual */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Disponible</h2>
                <p className="text-gray-600">Listo para iniciar ruta</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          {/* Card: Calificación */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{stats.promedio.toFixed(1)}</h2>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <StarIcon className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.promedio * 2) / 2
                        ? 'text-yellow-400 fill-yellow-400'
                        : star === Math.ceil(stats.promedio) && stats.promedio % 1 !== 0
                        ? 'text-yellow-400 fill-yellow-400/50'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">
                Basado en {stats.total_resenas} {
                  stats.total_resenas === 1 ? 'evaluación' : 'evaluaciones'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Próximas Rutas con vista previa */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Próximas Rutas</h2>
            <Link
              to="/driver/historial-viajes"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Ver historial completo →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando rutas...</div>
          ) : proximasRutas.length > 0 ? (
            <div className="space-y-4">
              {proximasRutas.slice(0, 3).map((ruta) => (
                <div key={ruta.id_viaje} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{ruta.origen} - {ruta.destino}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(ruta.fecha).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })} - {ruta.hora_salida.substring(0, 5)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {ruta.pasajeros?.length || 0} pasajeros
                    </span>
                    <span className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-full">
                      Programada
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

          <div className="mt-6 text-center">
            <Link
              to="/driver/historial-viajes"
              className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Ver todas las rutas
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 