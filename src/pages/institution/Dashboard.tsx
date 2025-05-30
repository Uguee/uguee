import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import InstitutionalLayout from '@/components/layout/InstitutionalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Car, 
  MapPin, 
  Clock, 
  Building2, 
  UserCheck, 
  UserPlus,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  TrendingUp,
  Star,
  Shield,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userCount, setUserCount] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Datos de ejemplo - En producción vendrían de una API
  const stats = {
    totalStudents: userCount, // Ahora usa el valor real del endpoint
    totalVehicles: 24,
    activeDrivers: 12,
    activeRoutes: 8,
    pendingRequests: 5,
  };

  // Función para obtener los headers de autorización
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
      ]);
      
      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        throw new Error('No active session');
      }
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    return headers;
  };

  // Función para obtener el número de usuarios
  const fetchUserCount = async () => {
    try {
      setLoadingUsers(true);
      
      // Obtener headers de autenticación
      const headers = await getAuthHeaders();
      
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-user-data', {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener los datos de usuarios: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Verificar que la respuesta sea exitosa
      if (result.success) {
        // Usar el campo count si está disponible, o contar el array data
        const count = result.count || (Array.isArray(result.data) ? result.data.length : 0);
        setUserCount(count);
      } else {
        console.error('Error en la respuesta del endpoint:', result);
        setUserCount(0);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Mantener un valor por defecto en caso de error
      setUserCount(1500);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchUserCount();
  }, []);

  const drivers = [
    {
      id: 1,
      name: 'Juan Carlos Pérez',
      email: 'juan.perez@email.com',
      phone: '+57 300 123 4567',
      vehicle: 'Toyota Hiace - ABC123',
      activeRoute: 'Ruta 1 - Universidad',
      passengers: 15,
      rating: 4.8,
      status: 'active',
      avatar: 'JP'
    },
    {
      id: 2,
      name: 'María García López',
      email: 'maria.garcia@email.com',
      phone: '+57 310 987 6543',
      vehicle: 'Mercedes Sprinter - XYZ789',
      activeRoute: 'Ruta 2 - Centro',
      passengers: 12,
      rating: 4.9,
      status: 'active',
      avatar: 'MG'
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+57 320 456 7890',
      vehicle: 'Ford Transit - DEF456',
      activeRoute: null,
      passengers: 0,
      rating: 4.5,
      status: 'inactive',
      avatar: 'CR'
    }
  ];

  const requests = [
    {
      id: 1,
      type: 'driver',
      name: 'Andrés Felipe Morales',
      email: 'andres.morales@email.com',
      phone: '+57 315 789 0123',
      requestDate: '2024-01-15',
      status: 'pending',
      documents: ['Licencia', 'SOAT', 'Revisión Técnica'],
      vehicle: 'Chevrolet NPR - GHI789'
    },
    {
      id: 2,
      type: 'student',
      name: 'Laura Sofía Hernández',
      email: 'laura.hernandez@estudiante.edu.co',
      phone: '+57 301 234 5678',
      requestDate: '2024-01-14',
      status: 'pending',
      program: 'Ingeniería de Sistemas',
      semester: '8vo',
      studentId: '2020123456'
    },
    {
      id: 3,
      type: 'teacher',
      name: 'Dr. Roberto Silva',
      email: 'roberto.silva@universidad.edu.co',
      phone: '+57 312 345 6789',
      requestDate: '2024-01-13',
      status: 'pending',
      department: 'Facultad de Ingeniería',
      position: 'Profesor Titular'
    }
  ];

  const activeRoutes = [
    {
      id: 1,
      name: 'Ruta 1 - Universidad',
      driver: 'Juan Carlos Pérez',
      vehicle: 'Toyota Hiace - ABC123',
      passengers: 15,
      capacity: 20,
      status: 'active',
      estimatedTime: '25 min'
    },
    {
      id: 2,
      name: 'Ruta 2 - Centro',
      driver: 'María García López',
      vehicle: 'Mercedes Sprinter - XYZ789',
      passengers: 12,
      capacity: 16,
      status: 'active',
      estimatedTime: '30 min'
    },
  ];

  // Datos para reportes
  const mobilityReports = {
    frequencyByUser: [
      { name: 'Laura Hernández', trips: 45, type: 'Estudiante' },
      { name: 'Carlos Moreno', trips: 38, type: 'Estudiante' },
      { name: 'Ana García', trips: 32, type: 'Profesor' },
      { name: 'Miguel Torres', trips: 28, type: 'Administrativo' }
    ],
    frequencyByDriver: [
      { name: 'Juan Carlos Pérez', trips: 156, rating: 4.8 },
      { name: 'María García López', trips: 142, rating: 4.9 },
      { name: 'Carlos Rodríguez', trips: 98, rating: 4.5 }
    ],
    frequencyByVehicle: [
      { vehicle: 'Toyota Hiace - ABC123', trips: 156, efficiency: '95%' },
      { vehicle: 'Mercedes Sprinter - XYZ789', trips: 142, efficiency: '92%' },
      { vehicle: 'Ford Transit - DEF456', trips: 98, efficiency: '88%' }
    ],
    peakHours: [
      { time: '07:00 - 08:00', usage: '85%', routes: 'Ruta 1, Ruta 2' },
      { time: '17:00 - 18:00', usage: '78%', routes: 'Ruta 1, Ruta 3' },
      { time: '12:00 - 13:00', usage: '65%', routes: 'Ruta 2' },
      { time: '08:00 - 09:00', usage: '60%', routes: 'Ruta 1' }
    ]
  };

  const performanceReports = {
    driverRatings: [
      { 
        name: 'María García López', 
        rating: 4.9, 
        totalReviews: 156, 
        comments: ['Muy puntual', 'Conducción segura', 'Muy amable'] 
      },
      { 
        name: 'Juan Carlos Pérez', 
        rating: 4.8, 
        totalReviews: 142, 
        comments: ['Excelente conductor', 'Siempre a tiempo', 'Vehículo limpio'] 
      },
      { 
        name: 'Carlos Rodríguez', 
        rating: 4.5, 
        totalReviews: 98, 
        comments: ['Buen servicio', 'Conductor responsable', 'Mejorar puntualidad'] 
      }
    ]
  };

  const securityReports = {
    alerts: [
      { 
        id: 1, 
        type: 'Desvío de ruta', 
        driver: 'Juan Carlos Pérez', 
        route: 'Ruta 1 - Universidad', 
        time: '08:45', 
        status: 'Resuelto',
        description: 'Desvío por construcción en vía principal'
      },
      { 
        id: 2, 
        type: 'Velocidad excesiva', 
        driver: 'Carlos Rodríguez', 
        route: 'Ruta 3 - Centro', 
        time: '14:30', 
        status: 'Revisando',
        description: 'Velocidad superior a 60 km/h en zona escolar'
      },
      { 
        id: 3, 
        type: 'Parada no autorizada', 
        driver: 'María García López', 
        route: 'Ruta 2 - Centro', 
        time: '16:15', 
        status: 'Resuelto',
        description: 'Parada adicional por emergencia médica'
      }
    ]
  };

  const handleApproveRequest = (requestId: number) => {
    console.log('Aprobar solicitud:', requestId);
    // Implementar lógica de aprobación
  };

  const handleRejectRequest = (requestId: number) => {
    console.log('Rechazar solicitud:', requestId);
    // Implementar lógica de rechazo
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'driver': return 'Conductor';
      case 'student': return 'Estudiante';
      case 'teacher': return 'Profesor';
      case 'admin': return 'Administrativo';
      case 'external': return 'Externo';
      default: return type;
    }
  };

  return (
    <InstitutionalLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel de Control Institucional</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setActiveTab('drivers')}>
              <UserCheck className="w-4 h-4 mr-2" />
              Gestionar Conductores
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('requests')}>
              <UserPlus className="w-4 h-4 mr-2" />
              Solicitudes ({stats.pendingRequests})
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('reports')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Reportes
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingUsers ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Cargando...
                  </div>
                ) : (
                  stats.totalStudents.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">Registrados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">Registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conductores</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDrivers}</div>
              <p className="text-xs text-muted-foreground">Activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rutas Activas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRoutes}</div>
              <p className="text-xs text-muted-foreground">En operación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="drivers">Conductores</TabsTrigger>
            <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            <TabsTrigger value="routes">Rutas Activas</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
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
                    <span>Usuarios transportados</span>
                    <span className="font-semibold">342</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tiempo promedio de viaje</span>
                    <span className="font-semibold">25 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ocupación promedio</span>
                    <span className="font-semibold">75%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Conductores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{driver.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="font-semibold">{driver.name}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="w-3 h-3 mr-1" />
                            {driver.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-3 h-3 mr-1" />
                            {driver.phone}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-right">
                        <div className="text-sm font-medium">{driver.vehicle}</div>
                        {driver.activeRoute ? (
                          <div className="text-sm text-muted-foreground">
                            {driver.activeRoute} - {driver.passengers} pasajeros
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Sin ruta asignada</div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant={driver.status === 'active' ? 'default' : 'secondary'}>
                            {driver.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <span className="text-sm">⭐ {driver.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {/* Solicitudes de Conductores */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Conductores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.filter(request => request.type === 'driver').length > 0 ? (
                    requests.filter(request => request.type === 'driver').map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{request.name}</h4>
                              <Badge variant="outline">{getRequestTypeLabel(request.type)}</Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="w-3 h-3 mr-1" />
                              {request.email}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="w-3 h-3 mr-1" />
                              {request.phone}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Solicitado: {request.requestDate}
                          </div>
                        </div>

                        {/* Información específica de conductor */}
                        <div className="mb-3 p-3 bg-gray-50 rounded">
                          <div className="space-y-1 text-sm">
                            <div><strong>Vehículo:</strong> {request.vehicle}</div>
                            <div><strong>Documentos:</strong> {request.documents?.join(', ')}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay solicitudes de conductores pendientes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Solicitudes de Usuarios (Estudiantes, Profesores, etc.) */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.filter(request => request.type !== 'driver').length > 0 ? (
                    requests.filter(request => request.type !== 'driver').map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{request.name}</h4>
                              <Badge variant="outline">{getRequestTypeLabel(request.type)}</Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="w-3 h-3 mr-1" />
                              {request.email}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="w-3 h-3 mr-1" />
                              {request.phone}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Solicitado: {request.requestDate}
                          </div>
                        </div>

                        {/* Información específica por tipo de usuario */}
                        <div className="mb-3 p-3 bg-gray-50 rounded">
                          {request.type === 'student' && (
                            <div className="space-y-1 text-sm">
                              <div><strong>Programa:</strong> {request.program}</div>
                              <div><strong>Semestre:</strong> {request.semester}</div>
                              <div><strong>ID Estudiante:</strong> {request.studentId}</div>
                            </div>
                          )}
                          {request.type === 'teacher' && (
                            <div className="space-y-1 text-sm">
                              <div><strong>Departamento:</strong> {request.department}</div>
                              <div><strong>Cargo:</strong> {request.position}</div>
                            </div>
                          )}
                          {request.type === 'admin' && (
                            <div className="space-y-1 text-sm">
                              <div><strong>Departamento:</strong> {request.department}</div>
                              <div><strong>Cargo:</strong> {request.position}</div>
                            </div>
                          )}
                          {request.type === 'external' && (
                            <div className="space-y-1 text-sm">
                              <div><strong>Tipo:</strong> Usuario externo</div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay solicitudes de usuarios pendientes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            {activeRoutes.map((route) => (
              <Card key={route.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{route.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <UserCheck className="w-4 h-4 mr-1" />
                        {route.driver}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Car className="w-4 h-4 mr-1" />
                        {route.vehicle}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-1" />
                          {route.passengers}/{route.capacity} pasajeros
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {route.estimatedTime}
                        </div>
                      </div>
                      <Badge variant="default">Activa</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Resumen de reportes en grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card de Movilidad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Movilidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">TOP USUARIOS</h4>
                    <div className="space-y-2">
                      {mobilityReports.frequencyByUser.slice(0, 3).map((user, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{user.name}</span>
                          <Badge variant="outline" className="text-xs">{user.trips}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">HORARIOS PICO</h4>
                    <div className="space-y-1">
                      {mobilityReports.peakHours.slice(0, 2).map((hour, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{hour.time}</span>
                          <Badge variant={hour.usage.includes('85') ? 'destructive' : 'default'} className="text-xs">
                            {hour.usage}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Desempeño */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5" />
                    Desempeño
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">TOP CONDUCTORES</h4>
                    <div className="space-y-2">
                      {performanceReports.driverRatings.map((driver, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1">
                            <span>{driver.name.split(' ')[0]}</span>
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs">{driver.rating}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">{driver.totalReviews}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">VEHÍCULOS</h4>
                    <div className="space-y-1">
                      {mobilityReports.frequencyByVehicle.slice(0, 2).map((vehicle, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{vehicle.vehicle.split(' - ')[0]}</span>
                          <Badge variant="secondary" className="text-xs">{vehicle.efficiency}</Badge>
                      </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Seguridad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5" />
                    Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">ALERTAS RECIENTES</h4>
                    <div className="space-y-2">
                      {securityReports.alerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                            <span className="truncate">{alert.type}</span>
                      </div>
                          <Badge variant={alert.status === 'Resuelto' ? 'default' : 'destructive'} className="text-xs">
                            {alert.status}
                      </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total alertas:</span>
                      <span className="font-medium">{securityReports.alerts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resueltas:</span>
                      <span className="font-medium text-green-600">
                        {securityReports.alerts.filter(a => a.status === 'Resuelto').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sección detallada con tabs internos */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Detallado</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="frequency" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="frequency">Frecuencia</TabsTrigger>
                    <TabsTrigger value="performance">Rendimiento</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="frequency" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-3">Usuarios Más Activos</h4>
                        <div className="space-y-2">
                          {mobilityReports.frequencyByUser.map((user, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.name}</span>
                                <Badge variant="outline" className="text-xs">{user.type}</Badge>
                              </div>
                              <span className="font-semibold">{user.trips} viajes</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Demanda por Horario</h4>
                        <div className="space-y-2">
                          {mobilityReports.peakHours.map((hour, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                              <div>
                                <div className="font-medium">{hour.time}</div>
                                <div className="text-xs text-muted-foreground">{hour.routes}</div>
                              </div>
                              <Badge variant={hour.usage.includes('85') ? 'destructive' : hour.usage.includes('78') ? 'default' : 'secondary'} className="text-xs">
                                {hour.usage}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-3">Calificaciones de Conductores</h4>
                        <div className="space-y-3">
                          {performanceReports.driverRatings.map((driver, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm">{driver.name}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="font-medium text-sm">{driver.rating}</span>
                                  <span className="text-xs text-muted-foreground">({driver.totalReviews})</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {driver.comments.slice(0, 2).map((comment, commentIndex) => (
                                  <Badge key={commentIndex} variant="secondary" className="text-xs">
                                    {comment}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Eficiencia de Vehículos</h4>
                        <div className="space-y-2">
                          {mobilityReports.frequencyByVehicle.map((vehicle, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                              <div>
                                <div className="font-medium">{vehicle.vehicle}</div>
                                <div className="text-xs text-muted-foreground">{vehicle.trips} viajes realizados</div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {vehicle.efficiency}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="security" className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-semibold mb-3">Alertas de Seguridad Detalladas</h4>
                      <div className="space-y-3">
                        {securityReports.alerts.map((alert) => (
                          <div key={alert.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                <span className="font-medium text-sm">{alert.type}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground">{alert.time}</span>
                                <Badge variant={alert.status === 'Resuelto' ? 'default' : 'destructive'} className="text-xs">
                                  {alert.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div><strong>Conductor:</strong> {alert.driver}</div>
                              <div><strong>Ruta:</strong> {alert.route}</div>
                              <div><strong>Descripción:</strong> {alert.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </InstitutionalLayout>
  );
};

export default Dashboard; 