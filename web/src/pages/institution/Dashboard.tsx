import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Car, MapPin, Clock, AlertTriangle, Building2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Datos de ejemplo - En producción vendrían de una API
  const stats = {
    totalStudents: 1500,
    activeDrivers: 12,
    activeRoutes: 8,
    incidents: 2,
  };

  const recentIncidents = [
    {
      id: 1,
      type: 'Retraso',
      route: 'Ruta 1 - Universidad',
      time: '08:30',
      status: 'resolved',
    },
    {
      id: 2,
      type: 'Problema Técnico',
      route: 'Ruta 2 - Centro',
      time: '12:15',
      status: 'pending',
    },
  ];

  const activeRoutes = [
    {
      id: 1,
      name: 'Ruta 1 - Universidad',
      driver: 'Juan Pérez',
      passengers: 15,
      status: 'active',
    },
    {
      id: 2,
      name: 'Ruta 2 - Centro',
      driver: 'María García',
      passengers: 12,
      status: 'active',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel de Control Institucional</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Gestionar Conductores
            </Button>
            <Button>
              <MapPin className="w-4 h-4 mr-2" />
              Crear Nueva Ruta
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Totales</CardTitle>
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
              <CardTitle className="text-sm font-medium">Conductores Activos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDrivers}</div>
              <p className="text-xs text-muted-foreground">
                En servicio actualmente
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.incidents}</div>
              <p className="text-xs text-muted-foreground">
                Reportados hoy
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="routes">Rutas Activas</TabsTrigger>
            <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Actividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Rutas completadas hoy</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estudiantes transportados</span>
                    <span className="font-semibold">342</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tiempo promedio de viaje</span>
                    <span className="font-semibold">25 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            {activeRoutes.map((route) => (
              <Card key={route.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{route.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        {route.driver}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        {route.passengers} pasajeros
                      </div>
                      <Badge variant="default">Activa</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            {recentIncidents.map((incident) => (
              <Card key={incident.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{incident.type}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {incident.route}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {incident.time}
                      </div>
                      <Badge variant={incident.status === 'resolved' ? 'default' : 'destructive'}>
                        {incident.status === 'resolved' ? 'Resuelto' : 'Pendiente'}
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