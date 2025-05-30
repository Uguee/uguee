import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Car, MapPin, AlertTriangle, Settings, Shield, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Datos de ejemplo - En producción vendrían de una API
  const stats = {
    totalInstitutions: 5,
    totalStudents: 7500,
    totalDrivers: 45,
    activeRoutes: 32,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'Nueva Institución',
      name: 'Universidad Nacional',
      time: '10:30',
      status: 'completed',
    },
    {
      id: 2,
      type: 'Reporte de Incidente',
      name: 'Ruta 15 - Universidad de los Andes',
      time: '09:15',
      status: 'pending',
    },
  ];

  const institutions = [
    {
      id: 1,
      name: 'Universidad Nacional',
      students: 2500,
      drivers: 15,
      routes: 8,
      status: 'active',
    },
    {
      id: 2,
      name: 'Universidad de los Andes',
      students: 1800,
      drivers: 12,
      routes: 6,
      status: 'active',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Gestionar Instituciones
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configuración del Sistema
            </Button>
          </div>
        </div>

        {/* Botón grande para validar instituciones */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Validar Solicitudes de Instituciones
              </h3>
              <p className="text-gray-600 mb-6">
                Revisa y aprueba las solicitudes de registro institucional pendientes
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/admin/user-validation')}
                className="w-full sm:w-auto px-8 py-3"
              >
                <Users className="w-5 h-5 mr-2" />
                Ver Solicitudes Pendientes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botón para gestionar solicitudes de usuarios */}
        <Card className="border-2 border-green-500/20">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Gestionar Solicitudes de Usuarios
              </h3>
              <p className="text-gray-600 mb-6">
                Aprueba o rechaza las solicitudes de usuarios para unirse a instituciones
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/admin/registration-requests')}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Ver Solicitudes de Registro
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instituciones</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
              <p className="text-xs text-muted-foreground">
                Instituciones registradas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Estudiantes registrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conductores</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDrivers}</div>
              <p className="text-xs text-muted-foreground">
                Conductores activos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rutas Activas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRoutes}</div>
              <p className="text-xs text-muted-foreground">
                En operación actualmente
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="institutions">Instituciones</TabsTrigger>
            <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Usuarios activos hoy</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Viajes completados hoy</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Incidentes reportados</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tiempo promedio de respuesta</span>
                    <span className="font-semibold">5 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="institutions" className="space-y-4">
            {institutions.map((institution) => (
              <Card key={institution.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{institution.name}</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {institution.students} estudiantes
                        </div>
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-1" />
                          {institution.drivers} conductores
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {institution.routes} rutas
                        </div>
                      </div>
                    </div>
                    <Badge variant="default">Activa</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {recentActivity.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{activity.type}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 mr-1" />
                        {activity.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.time}
                      </div>
                      <Badge variant={activity.status === 'completed' ? 'default' : 'destructive'}>
                        {activity.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
