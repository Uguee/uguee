import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Car, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('today');

  // Datos de ejemplo - En producción vendrían de una API
  const todayRoutes = [
    {
      id: 1,
      time: '08:00',
      passengers: 3,
      status: 'active',
      route: 'Universidad - Centro Comercial',
    },
    {
      id: 2,
      time: '12:30',
      passengers: 2,
      status: 'scheduled',
      route: 'Centro Comercial - Universidad',
    },
  ];

  const upcomingRoutes = [
    {
      id: 3,
      date: '2024-03-20',
      time: '08:00',
      passengers: 4,
      status: 'scheduled',
      route: 'Universidad - Centro Comercial',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel de Control</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reportar Incidente
            </Button>
            <Button>
              <Car className="w-4 h-4 mr-2" />
              Iniciar Ruta
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rutas Hoy</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayRoutes.length}</div>
              <p className="text-xs text-muted-foreground">
                Rutas programadas para hoy
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pasajeros Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayRoutes.reduce((acc, route) => acc + route.passengers, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pasajeros programados hoy
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Disponible</div>
              <p className="text-xs text-muted-foreground">
                Listo para iniciar ruta
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calificación</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">
                Basado en 120 evaluaciones
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="today" className="space-y-4">
          <TabsList>
            <TabsTrigger value="today">Hoy</TabsTrigger>
            <TabsTrigger value="upcoming">Próximas Rutas</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="space-y-4">
            {todayRoutes.map((route) => (
              <Card key={route.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{route.route}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        {route.passengers} pasajeros
                      </div>
                      <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                        {route.status === 'active' ? 'En curso' : 'Programada'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingRoutes.map((route) => (
              <Card key={route.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{route.route}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.date} - {route.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        {route.passengers} pasajeros
                      </div>
                      <Badge variant="secondary">Programada</Badge>
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