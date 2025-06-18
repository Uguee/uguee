import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InstitutionalLayout from '@/components/layout/InstitutionalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RouteMap } from '@/components/map/RouteMap';
import { InstitutionService } from '@/services/institutionService';
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
  AlertTriangle,
  FileText,
  Calendar,
  User,
  UserCog
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVehicles: 0,
    activeDrivers: 0,
    activeRoutes: 0,
    pendingRequests: 0,
    students: 0,
    teachers: 0,
    others: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [driverRequests, setDriverRequests] = useState<any[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showRouteMap, setShowRouteMap] = useState(false);

  const loadInstitutionData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('🔍 Cargando datos para admin:', user.id);

      // Obtener el UUID desde la sesión de Supabase en lugar de usar user.id (que es la cédula)
      const { data: { session } } = await supabase.auth.getSession();
      const userUuid = session?.user?.id;
      
      if (!userUuid) {
        console.error('❌ No se pudo obtener el UUID del usuario de la sesión');
        return;
      }

      console.log('🔑 UUID obtenido de la sesión:', userUuid);

      // 1. Obtener la institución que administra este usuario usando el UUID correcto
      const institutionResult = await InstitutionService.getInstitutionByAdmin(userUuid);
      
      if (!institutionResult.success || !institutionResult.data) {
        console.error('❌ No se encontró institución para este admin:', institutionResult.error);
        return;
      }

      console.log('🏛️ Institución encontrada:', institutionResult.data);
      const institutionData = institutionResult.data;
      setInstitution(institutionData);

      const institutionId = institutionData.id_institucion;
      console.log('🆔 ID de institución obtenido:', institutionId, typeof institutionId);

      // 2. Cargar datos en paralelo incluyendo rutas activas
      const [statsResult, usersResult, driversResult, requestsResult, vehiclesResult, routesResult] = await Promise.all([
        InstitutionService.getInstitutionStats(institutionId),
        InstitutionService.getUsersByInstitution(institutionId),
        InstitutionService.getDriversByInstitution(institutionId),
        InstitutionService.getPendingRequestsByInstitution(institutionId),
        InstitutionService.getVehiclesByInstitution(institutionId),
        InstitutionService.getActiveRoutesByInstitution(institutionId)
      ]);

      // 3. Actualizar estado con los datos obtenidos
      if (statsResult.success) {
        console.log('📊 Estadísticas cargadas:', statsResult.data);
        
        setStats({
          totalStudents: statsResult.data.total_users || 0,
          totalVehicles: statsResult.data.total_vehicles || 0,
          activeDrivers: statsResult.data.total_drivers || 0,
          activeRoutes: routesResult.success ? routesResult.data?.length || 0 : 0,
          pendingRequests: statsResult.data.pending_requests || 0,
          students: statsResult.data.students || 0,
          teachers: statsResult.data.teachers || 0,
          others: statsResult.data.others || 0
        });
      }

      if (usersResult.success) {
        console.log('👥 Usuarios cargados:', usersResult.data?.length || 0);
        setUsers(usersResult.data || []);
      }

      if (driversResult.success) {
        console.log('🚗 Conductores cargados:', driversResult.data?.length || 0);
        setDrivers(driversResult.data || []);
      }

      if (requestsResult.success) {
        console.log('📋 Solicitudes cargadas:', requestsResult.data?.length || 0);
        setRequests(requestsResult.data || []);
      }

      if (vehiclesResult.success) {
        console.log('🚙 Vehículos cargados:', vehiclesResult.data?.length || 0);
        setVehicles(vehiclesResult.data || []);
      }

      if (routesResult.success) {
        console.log('🛣️ Rutas activas cargadas:', routesResult.data?.length || 0);
        setActiveRoutes(routesResult.data || []);
      }

      // 4. Cargar solicitudes de registro y conductores usando el ID de institución directamente
      console.log('🔄 Iniciando carga de solicitudes con ID de institución:', institutionId);
      
      // Primero, verificar la estructura de la tabla registro
      const { data: tableInfo, error: tableError } = await supabase
        .from('registro')
        .select('*')
        .limit(1);

      if (tableError) {
        console.error('Error checking registro table structure:', tableError);
      } else {
        console.log('📋 Estructura de la tabla registro:', tableInfo);
      }

      // Intentar cargar las solicitudes una por una para mejor debugging
      const registrationResult = await supabase
        .from('registro')
        .select(`
          id_usuario,
          validacion,
          fecha_registro,
          rol_institucional,
          correo_institucional,
          usuario:usuario (
            nombre,
            apellido,
            celular,
            fecha_nacimiento
          )
        `)
        .eq('id_institucion', institutionId)
        .eq('validacion', 'pendiente')
        .order('fecha_registro', { ascending: false });

      console.log('🔍 Resultado de la consulta de registro:', registrationResult);

      if (registrationResult.error) {
        console.error('Error loading registration requests:', registrationResult.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las solicitudes de registro",
          variant: "destructive",
        });
      } else {
        console.log('✅ Registration Requests Data:', registrationResult.data);
        console.log('📊 Number of registration requests:', registrationResult.data?.length);
        setRegistrationRequests(registrationResult.data || []);
      }

      const driverResult = await supabase
        .from('registro')
        .select(`
          id_usuario,
          validacion_conductor,
          fecha_registro,
          correo_institucional,
          usuario:usuario (
            nombre,
            apellido,
            celular
          )
        `)
        .eq('id_institucion', institutionId)
        .eq('validacion_conductor', 'pendiente')
        .order('fecha_registro', { ascending: false });

      console.log('🔍 Resultado de la consulta de conductores:', driverResult);

      if (driverResult.error) {
        console.error('Error loading driver requests:', driverResult.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las solicitudes de conductores",
          variant: "destructive",
        });
      } else {
        console.log('✅ Driver Requests Data:', driverResult.data);
        console.log('📊 Number of driver requests:', driverResult.data?.length);
        setDriverRequests(driverResult.data || []);
      }

    } catch (error) {
      console.error('❌ Error cargando datos de institución:', error);
      toast({
        title: "Error",
        description: "Hubo un error al cargar los datos de la institución",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar solicitudes de registro
  const loadRegistrationRequests = async () => {
    if (!institution?.id_institucion) {
      console.log('❌ No hay ID de institución disponible para cargar solicitudes');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('registro')
        .select(`
          id_usuario,
          validacion,
          fecha_registro,
          rol,
          usuario:usuario (
            nombre,
            apellido,
            correo_institucional,
            celular,
            fecha_nacimiento
          )
        `)
        .eq('id_institucion', institution.id_institucion)
        .eq('validacion', 'pendiente')
        .order('fecha_registro', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Registration Requests Data:', data);
      console.log('Number of registration requests:', data?.length);

      if (data.length === 0) {
        // Si no hay solicitudes pendientes, mostrar todas las solicitudes
        const { data: allData, error: allError } = await supabase
          .from('registro')
          .select(`
            id_usuario,
            validacion,
            fecha_registro,
            rol,
            usuario:usuario (
              nombre,
              apellido,
              correo_institucional,
              celular,
              fecha_nacimiento
            )
          `)
          .eq('id_institucion', institution.id_institucion)
          .order('fecha_registro', { ascending: false });

        if (allError) {
          throw allError;
        }

        console.log('All Registration Requests Data:', allData);
        console.log('Number of all registration requests:', allData?.length);
        setRegistrationRequests(allData || []);
      } else {
        setRegistrationRequests(data);
      }
    } catch (error: any) {
      console.error('Error loading registration requests:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadDriverRequests = async () => {
    if (!institution?.id_institucion) {
      console.log('❌ No hay ID de institución disponible para cargar solicitudes de conductores');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('registro')
        .select(`
          id_usuario,
          validacion_conductor,
          fecha_registro,
          usuario:usuario (
            nombre,
            apellido,
            correo_institucional,
            celular
          )
        `)
        .eq('id_institucion', institution.id_institucion)
        .eq('validacion_conductor', 'pendiente')
        .order('fecha_registro', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Driver Requests Data:', data);
      console.log('Number of driver requests:', data?.length);
      setDriverRequests(data || []);
    } catch (error: any) {
      console.error('Error loading driver requests:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInstitutionData();
  }, [user?.id]);

  // Actualizar el conteo de solicitudes pendientes cuando cambien las solicitudes de registro
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      pendingRequests: registrationRequests.length
    }));
  }, [registrationRequests]);

  // Datos de ejemplo temporales (mantener solo para development)
  const exampleDrivers = [
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

  const exampleRequests = [
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

  const handleApproveRequest = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('registro')
        .update({ validacion: 'validado' })
        .eq('id_usuario', userId)
        .eq('id_institucion', institution?.id_institucion);

      if (error) throw error;

      // Update state immediately
      setRegistrationRequests(prev => prev.filter(request => request.id_usuario !== userId));
      
      toast({
        title: "Solicitud aprobada",
        description: "El usuario ha sido aprobado exitosamente",
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('registro')
        .update({ validacion: 'denegado' })
        .eq('id_usuario', userId)
        .eq('id_institucion', institution?.id_institucion);

      if (error) throw error;

      // Update state immediately
      setRegistrationRequests(prev => prev.filter(request => request.id_usuario !== userId));
      
      toast({
        title: "Solicitud rechazada",
        description: "El usuario ha sido rechazado",
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleShowRouteMap = (route: any) => {
    console.log('🗺️ Mostrar mapa de ruta:', route);
    console.log('📊 Datos de la ruta completa:', JSON.stringify(route, null, 2));
    if (route.ruta) {
      console.log('🛣️ Datos específicos de la ruta:', JSON.stringify(route.ruta, null, 2));
      console.log('📍 Punto partida:', route.ruta.punto_partida);
      console.log('🏁 Punto llegada:', route.ruta.punto_llegada);
      console.log('🗺️ Trayecto:', route.ruta.trayecto);
    }
    setSelectedRoute(route);
    setShowRouteMap(true);
  };

  const handleCloseRouteMap = () => {
    setShowRouteMap(false);
    setSelectedRoute(null);
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

  const handleApproveDriverRequest = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('registro')
        .update({ validacion_conductor: 'validado' })
        .eq('id_usuario', userId)
        .eq('id_institucion', institution?.id_institucion);

      if (error) throw error;

      // Update state immediately
      setDriverRequests(prev => prev.filter(request => request.id_usuario !== userId));
      
      toast({
        title: "Conductor aprobado",
        description: "El conductor ha sido aprobado exitosamente",
      });
    } catch (error) {
      console.error('Error approving driver request:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la solicitud del conductor",
        variant: "destructive",
      });
    }
  };

  const handleRejectDriverRequest = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('registro')
        .update({ validacion_conductor: 'denegado' })
        .eq('id_usuario', userId)
        .eq('id_institucion', institution?.id_institucion);

      if (error) throw error;

      // Update state immediately
      setDriverRequests(prev => prev.filter(request => request.id_usuario !== userId));
      
      toast({
        title: "Conductor rechazado",
        description: "El conductor ha sido rechazado",
      });
    } catch (error) {
      console.error('Error rejecting driver request:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud del conductor",
        variant: "destructive",
      });
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
            <Button variant="outline" onClick={() => setActiveTab('vehicles')}>
              <Car className="w-4 h-4 mr-2" />
              Vehículos ({stats.totalVehicles})
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
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Cargando...
                  </div>
                ) : (
                  stats.totalStudents
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de usuarios registrados en {institution?.nombre_oficial || 'la institución'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">Registrados en la institución</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conductores</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDrivers}</div>
              <p className="text-xs text-muted-foreground">Validados como conductores</p>
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
            <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
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
                <CardTitle>Conductores Validados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <div key={driver.id_usuario} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {driver.usuario?.nombre?.charAt(0)}{driver.usuario?.apellido?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="font-semibold">
                              {driver.usuario?.nombre} {driver.usuario?.apellido}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="w-3 h-3 mr-1" />
                              {driver.correo_institucional}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="w-3 h-3 mr-1" />
                              {driver.usuario?.celular}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-right">
                          <div className="text-sm font-medium">
                            Código: {driver.codigo_institucional}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rol: {driver.rol_institucional}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Registro: {new Date(driver.fecha_registro).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-600">
                              <Shield className="w-3 h-3 mr-1" />
                              Conductor Validado
                            </Badge>
                            <Badge variant={driver.validacion === 'validado' ? 'default' : 'secondary'}>
                              {driver.validacion === 'validado' ? 'Usuario Validado' : 'Usuario Pendiente'}
                            </Badge>
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay conductores validados en esta institución
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vehículos de la Institución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <div key={vehicle.placa} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Car className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold">Placa: {vehicle.placa}</h4>
                            <div className="text-sm text-muted-foreground">
                              Propietario: {vehicle.usuario?.nombre} {vehicle.usuario?.apellido}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Modelo: {vehicle.modelo} | Color: {vehicle.color}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-right">
                          <div className="text-sm font-medium">
                            SOAT: {new Date(vehicle.vigencia_soat).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tecnicomecanica: {new Date(vehicle.fecha_tecnicomecanica).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              vehicle.validacion === 'validado' ? 'default' : 
                              vehicle.validacion === 'pendiente' ? 'secondary' : 'destructive'
                            }>
                              {vehicle.validacion === 'validado' ? 'Validado' : 
                               vehicle.validacion === 'pendiente' ? 'Pendiente' : 'Denegado'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {vehicle.validacion === 'pendiente' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={async () => {
                                  const { error } = await supabase
                                    .from('vehiculo')
                                    .update({ validacion: 'validado' })
                                    .eq('placa', vehicle.placa);
                                  if (!error) {
                                    loadInstitutionData();
                                  }
                                }}
                              >
                                Validar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  const { error } = await supabase
                                    .from('vehiculo')
                                    .delete()
                                    .eq('placa', vehicle.placa);
                                  if (!error) {
                                    loadInstitutionData();
                                  }
                                }}
                              >
                                Quitar
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay vehículos registrados en esta institución
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid gap-4">
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="text-purple-700 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Solicitudes de Registro
                </CardTitle>
                <CardDescription>Gestiona las solicitudes de registro de usuarios</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {registrationRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay solicitudes pendientes</p>
                ) : (
                  <div className="space-y-4">
                    {registrationRequests.map((request) => (
                      <div key={request.id_usuario} className="border rounded-lg p-4 bg-white hover:bg-purple-50 transition-colors">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold text-purple-700 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Nombre
                            </p>
                            <p className="text-gray-700">{request.usuario.nombre} {request.usuario.apellido}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-purple-700 flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              Correo Institucional
                            </p>
                            <p className="text-gray-700">{request.correo_institucional}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-purple-700 flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              Teléfono
                            </p>
                            <p className="text-gray-700">{request.usuario.celular}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-purple-700 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Fecha de Nacimiento
                            </p>
                            <p className="text-gray-700">{request.usuario.fecha_nacimiento}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-purple-700 flex items-center">
                              <UserCog className="w-4 h-4 mr-2" />
                              Rol Solicitado
                            </p>
                            <p className="text-gray-700">{request.rol_institucional}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-purple-700 flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Fecha de Solicitud
                            </p>
                            <p className="text-gray-700">{new Date(request.fecha_registro).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id_usuario)}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                          <Button
                            onClick={() => handleApproveRequest(request.id_usuario)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-blue-700 flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Solicitudes de Conductores
                </CardTitle>
                <CardDescription>Gestiona las solicitudes de registro de conductores</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {driverRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay solicitudes pendientes</p>
                ) : (
                  <div className="space-y-4">
                    {driverRequests.map((request) => (
                      <div key={request.id_usuario} className="border rounded-lg p-4 bg-white hover:bg-blue-50 transition-colors">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold text-blue-700 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Nombre
                            </p>
                            <p className="text-gray-700">{request.usuario.nombre} {request.usuario.apellido}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-700 flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              Correo Institucional
                            </p>
                            <p className="text-gray-700">{request.correo_institucional}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-700 flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              Teléfono
                            </p>
                            <p className="text-gray-700">{request.usuario.celular}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-700 flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Fecha de Solicitud
                            </p>
                            <p className="text-gray-700">{new Date(request.fecha_registro).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const licenseUrl = supabase.storage
                                .from('licencia')
                                .getPublicUrl(`${request.id_usuario}`).data.publicUrl;
                              window.open(licenseUrl, '_blank');
                            }}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Licencia
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleRejectDriverRequest(request.id_usuario)}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                            <Button
                              onClick={() => handleApproveDriverRequest(request.id_usuario)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprobar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rutas Activas de la Institución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeRoutes.length > 0 ? (
                    activeRoutes.map((route, index) => (
                      <Card key={`${route.id_ruta}-${index}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold">Ruta ID: {route.id_ruta}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <UserCheck className="w-4 h-4 mr-1" />
                                {route.conductor?.nombre} {route.conductor?.apellido}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Car className="w-4 h-4 mr-1" />
                                {route.vehiculo?.placa} - {route.vehiculo?.color} {route.vehiculo?.modelo}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="w-4 h-4 mr-1" />
                                {route.conductor?.celular}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-4">
                              <div className="text-right">
                                <div className="flex items-center text-sm">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  Distancia: {route.ruta?.longitud ? `${(route.ruta.longitud / 1000).toFixed(2)} km` : 'N/A'}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4 mr-2" />
                                  {route.programado_at} | {route.salida_at} - {route.llegada_at}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleShowRouteMap(route)}
                                >
                                  <MapPin className="w-4 h-4 mr-1" />
                                  Ver Mapa
                                </Button>
                                <Badge variant="default">Activa</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay rutas activas programadas para conductores de esta institución
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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

      {/* Modal del mapa de ruta */}
      <Dialog open={showRouteMap} onOpenChange={handleCloseRouteMap}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa de Ruta {selectedRoute?.id_ruta ? `#${selectedRoute.id_ruta}` : ''}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="space-y-4">
              {/* Información de la ruta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Información del Conductor</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
                      {selectedRoute.conductor?.nombre} {selectedRoute.conductor?.apellido}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {selectedRoute.conductor?.celular}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Información del Viaje</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Car className="w-4 h-4 mr-2 text-green-600" />
                      {selectedRoute.vehiculo?.placa} - {selectedRoute.vehiculo?.color} {selectedRoute.vehiculo?.modelo}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedRoute.programado_at} | {selectedRoute.salida_at} - {selectedRoute.llegada_at}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Visualización de la Ruta</h4>
                <div className="h-[400px] w-full rounded-lg overflow-hidden border">
                  {selectedRoute.ruta ? (
                    <RouteMap
                      origin={
                        selectedRoute.ruta.punto_partida
                          ? {
                              lat: selectedRoute.ruta.punto_partida.y || selectedRoute.ruta.punto_partida.lat,
                              lng: selectedRoute.ruta.punto_partida.x || selectedRoute.ruta.punto_partida.lng,
                              address: 'Punto de partida'
                            }
                          : null
                      }
                      destination={
                        selectedRoute.ruta.punto_llegada
                          ? {
                              lat: selectedRoute.ruta.punto_llegada.y || selectedRoute.ruta.punto_llegada.lat,
                              lng: selectedRoute.ruta.punto_llegada.x || selectedRoute.ruta.punto_llegada.lng,
                              address: 'Punto de llegada'
                            }
                          : null
                      }
                      route={
                        selectedRoute.ruta.trayecto && Array.isArray(selectedRoute.ruta.trayecto)
                          ? selectedRoute.ruta.trayecto.map((point: any) => [
                              point.y || point.lat,
                              point.x || point.lng
                            ])
                          : null
                      }
                      allowClickToSetPoints={false}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No hay información de trayecto disponible</p>
                        <p className="text-sm text-gray-400">
                          Distancia: {selectedRoute.ruta?.longitud ? `${(selectedRoute.ruta.longitud / 1000).toFixed(2)} km` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información adicional */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Distancia estimada:</span> {selectedRoute.ruta?.longitud ? `${(selectedRoute.ruta.longitud / 1000).toFixed(2)} km` : 'No disponible'}
                </div>
                <Badge variant="default">Ruta Activa</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </InstitutionalLayout>
  );
};

export default Dashboard; 