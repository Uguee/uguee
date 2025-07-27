import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/useAdminStats';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Clock, CheckCircle, XCircle, AlertCircle, Users, Car, MapPin, Route, Star, TrendingUp, BarChart3, UserCheck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, loading, error, refetch, setMockData } = useAdminStats();

  // Función para formatear números
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  // Función para formatear calificaciones
  const formatRating = (rating: number | undefined) => {
    if (rating === undefined || rating === null) return '0.0';
    return rating.toFixed(1);
  };





  return (
    <DashboardLayout>
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-sm text-gray-600 mt-1">Gestiona las solicitudes de instituciones y monitorea el sistema</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Card principal para solicitudes de instituciones */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mb-3">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Bienvenido Administrador
              </h2>
              <p className="text-xs text-gray-600 mb-3">
                Gestiona las solicitudes de instituciones educativas
              </p>
              <Button 
                onClick={() => navigate('/admin/institution-requests')}
                className="flex items-center gap-2"
                size="sm"
              >
                <Building2 className="w-3 h-3" />
                Gestionar Solicitudes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estado de solicitudes */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Solicitudes Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-yellow-600">
                {loading ? '...' : formatNumber(stats?.institutions?.pending)}
              </div>
              <p className="text-xs text-muted-foreground">
                Esperando revisión
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Instituciones Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">
                {loading ? '...' : formatNumber(stats?.institutions?.total)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de instituciones
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Solicitudes Rechazadas</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-600">
                {loading ? '...' : formatNumber(stats?.institutions?.rejected)}
              </div>
              <p className="text-xs text-muted-foreground">
                Rechazadas o canceladas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Información general del sistema */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center text-base">
                <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                Información General del Sistema
              </CardTitle>
              <Button
                onClick={refetch}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Instituciones */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                  Instituciones
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Total registradas</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.institutions?.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Activas</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.institutions?.active)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Usuarios */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  Usuarios
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Total registrados</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.users?.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Estudiantes</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.users?.students)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Conductores</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.users?.drivers)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Profesores</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.users?.professors)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehículos */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center text-sm">
                  <Car className="h-4 w-4 mr-2 text-purple-500" />
                  Vehículos
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Total registrados</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.vehicles?.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Automóviles</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.vehicles?.cars)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Motocicletas</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.vehicles?.motorcycles)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Otros</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.vehicles?.others)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rutas y Viajes */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center text-sm">
                  <Route className="h-4 w-4 mr-2 text-orange-500" />
                  Rutas y Viajes
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Rutas activas</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.routes?.totalRoutes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Viajes realizados</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.routes?.tripsCompleted)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Viajes hoy</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatNumber(stats?.routes?.tripsToday)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Promedio pasajeros</span>
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatRating(stats?.routes?.averagePassengers)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas adicionales */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Calidad del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Calificación promedio</span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span className="text-xs font-medium">
                      {loading ? '...' : formatRating(stats?.quality?.averageRating)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Total de reseñas</span>
                  <span className="text-xs font-medium">
                    {loading ? '...' : formatNumber(stats?.quality?.totalReviews)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Reseñas este mes</span>
                  <span className="text-xs font-medium">
                    {loading ? '...' : formatNumber(stats?.quality?.monthlyReviews)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Usuarios activos hoy</span>
                  <span className="text-xs font-medium">
                    {loading ? '...' : formatNumber(stats?.activity?.activeUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Nuevos registros (7 días)</span>
                  <span className="text-xs font-medium">
                    {loading ? '...' : formatNumber(stats?.activity?.newRegistrations)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Documentos validados</span>
                  <span className="text-xs font-medium">
                    {loading ? '...' : formatNumber(stats?.activity?.validatedDocuments)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información sobre el proceso de validación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
              Proceso de Validación de Instituciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">1. Revisión de Documentos</h4>
                <p className="text-sm text-gray-600">
                  Verifica que todos los documentos legales y administrativos estén completos y sean válidos.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">2. Validación de Información</h4>
                <p className="text-sm text-gray-600">
                  Confirma que la información proporcionada sobre la institución sea correcta y actualizada.
                </p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">3. Aprobación Final</h4>
                <p className="text-sm text-gray-600">
                  Una vez verificado todo, la institución será activada en el sistema y podrá comenzar a operar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
