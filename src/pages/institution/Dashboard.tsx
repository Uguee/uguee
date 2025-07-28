import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionalLayout from '@/components/layout/InstitutionalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RouteMap } from '@/components/map/RouteMap';
import { useInstitutionDashboard } from '@/hooks/useInstitutionDashboard';
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
  Calendar,
  User,
  UserCog,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showRouteMap, setShowRouteMap] = useState(false);

  const {
    isLoading,
    institution,
    stats,
    users,
    drivers,
    vehicles,
    activeRoutes,
    institutionRoutes,
    registrationRequests,
    driverRequests,
    handleApproveRequest,
    handleRejectRequest,
    handleApproveDriverRequest,
    handleRejectDriverRequest,
    refreshData
  } = useInstitutionDashboard();

  const handleShowRouteMap = (route: any) => {
    setSelectedRoute(route);
    setShowRouteMap(true);
  };

  const handleCloseRouteMap = () => {
    setShowRouteMap(false);
    setSelectedRoute(null);
  };

  if (isLoading) {
    return (
      <InstitutionalLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </InstitutionalLayout>
    );
  }

  return (
    <InstitutionalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Institucional</h1>
            <p className="text-gray-600 mt-1">
              {institution?.nombre_oficial || 'Panel de Control'}
            </p>
          </div>
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Usuarios Totales</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
              <p className="text-xs text-gray-600 mt-1">Usuarios registrados en la institución</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Conductores</CardTitle>
              <UserCheck className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.activeDrivers}</div>
              <p className="text-xs text-gray-600 mt-1">Conductores validados</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Vehículos</CardTitle>
              <Car className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalVehicles}</div>
              <p className="text-xs text-gray-600 mt-1">Registrados</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Rutas Creadas</CardTitle>
              <MapPin className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{institutionRoutes.length}</div>
              <p className="text-xs text-gray-600 mt-1">Por usuarios de la institución</p>
            </CardContent>
          </Card>
        </div>

                {/* Activity Summary - Resumen de actividad y rutas */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Resumen de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.completedTripsToday}</div>
                  <p className="text-sm text-gray-600">Total viajes completados</p>
                  <p className="text-xs text-gray-500 mt-1">Por conductores de la institución</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-green-600" />
                Información de Rutas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total rutas creadas</span>
                  <span className="text-xl font-bold text-green-600">{institutionRoutes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Usuarios con rutas</span>
                  <span className="text-xl font-bold text-blue-600">
                    {institutionRoutes.reduce((acc, route) => {
                      const userId = route.usuario?.id_usuario || route.id_usuario;
                      if (userId && !acc.includes(userId)) acc.push(userId);
                      return acc;
                    }, []).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rutas con viajes activos</span>
                  <span className="text-xl font-bold text-purple-600">
                    {activeRoutes.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Alert */}
        {stats.pendingRequests > 0 && (
          <Card className="border-l-4 border-l-red-500 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">
                    Tienes {stats.pendingRequests} solicitudes pendientes por revisar
                  </p>
                  <p className="text-sm text-red-600">
                    Ve a la pestaña "Solicitudes" para gestionarlas
                  </p>
        </div>
                <Button 
                  onClick={() => setActiveTab('requests')}
                  size="sm"
                  className="ml-auto bg-red-600 hover:bg-red-700"
                >
                  Ver Solicitudes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="drivers">Conductores</TabsTrigger>
            <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Solicitudes
              {stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="routes">Rutas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estadísticas Rápidas
                  </CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total de usuarios registrados</span>
                    <span className="font-semibold text-lg">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conductores activos</span>
                    <span className="font-semibold text-lg">{stats.activeDrivers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vehículos disponibles</span>
                    <span className="font-semibold text-lg">{stats.totalVehicles}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rutas creadas</span>
                    <span className="font-semibold text-lg">{institutionRoutes.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Información de la Institución
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nombre Oficial</p>
                    <p className="font-medium">{institution?.nombre_oficial}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">{institution?.direccion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Activa
                    </Badge>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conductores Validados ({drivers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <div key={driver.id_usuario} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {driver.usuario?.nombre?.charAt(0)}{driver.usuario?.apellido?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="font-semibold">
                              {driver.usuario?.nombre} {driver.usuario?.apellido}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="w-3 h-3 mr-1" />
                              {driver.correo_institucional}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-3 h-3 mr-1" />
                              {driver.usuario?.celular}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-right">
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-600">
                              <Shield className="w-3 h-3 mr-1" />
                              Conductor Validado
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Registro: {new Date(driver.fecha_registro).toLocaleDateString()}
                          </div>
                        </div>
                        
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay conductores validados en esta institución</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vehículos de la Institución ({vehicles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <div key={vehicle.placa} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Car className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold">Placa: {vehicle.placa}</h4>
                            <div className="text-sm text-gray-500">
                              Propietario: {vehicle.usuario?.nombre} {vehicle.usuario?.apellido}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.modelo} | {vehicle.color}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-right">
                            <Badge variant={
                              vehicle.validacion === 'validado' ? 'default' : 
                              vehicle.validacion === 'pendiente' ? 'secondary' : 'destructive'
                            }>
                              {vehicle.validacion === 'validado' ? 'Validado' : 
                               vehicle.validacion === 'pendiente' ? 'Pendiente' : 'Denegado'}
                            </Badge>
                          <div className="text-xs text-gray-500">
                            SOAT: {new Date(vehicle.vigencia_soat).toLocaleDateString()}
                          </div>
                        </div>
                        
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay vehículos registrados en esta institución</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid gap-6">
              {/* Registration Requests */}
              <Card>
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="text-purple-700 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                    Solicitudes de Registro ({registrationRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {registrationRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay solicitudes de registro pendientes</p>
                    </div>
                ) : (
                  <div className="space-y-4">
                    {registrationRequests.map((request) => (
                        <div key={request.id_usuario} className="border rounded-lg p-4 hover:bg-purple-50 transition-colors">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="font-semibold text-purple-700 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                                {request.usuario.nombre} {request.usuario.apellido}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <Mail className="w-3 h-3 mr-1 inline" />
                                {request.correo_institucional}
                              </p>
                          </div>
                          <div>
                              <p className="font-semibold text-purple-700">
                                <UserCog className="w-4 h-4 mr-1 inline" />
                                {request.rol_institucional}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <Calendar className="w-3 h-3 mr-1 inline" />
                                {new Date(request.fecha_registro).toLocaleDateString()}
                              </p>
                          </div>
                          </div>
                          <div className="flex justify-end space-x-2">
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

              {/* Driver Requests */}
              <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-blue-700 flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                    Solicitudes de Conductores ({driverRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {driverRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay solicitudes de conductores pendientes</p>
                    </div>
                ) : (
                  <div className="space-y-4">
                    {driverRequests.map((request) => (
                        <div key={request.id_usuario} className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                              <p className="font-semibold text-blue-700">
                                {request.usuario.nombre} {request.usuario.apellido}
                              </p>
                              <p className="text-sm text-gray-600">
                                {request.correo_institucional}
                              </p>
                          </div>
                          <div>
                              <p className="text-sm text-gray-600">
                                <Phone className="w-3 h-3 mr-1 inline" />
                                {request.usuario.celular}
                              </p>
                              <p className="text-sm text-gray-600">
                                <Calendar className="w-3 h-3 mr-1 inline" />
                                {new Date(request.fecha_registro).toLocaleDateString()}
                              </p>
                          </div>
                        </div>
                          <div className="flex justify-end space-x-2">
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
                <CardTitle>Rutas de Usuarios de la Institución ({institutionRoutes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {institutionRoutes.length > 0 ? (
                    institutionRoutes.map((route, index) => (
                      <Card key={`${route.id_ruta}-${index}`} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-3">
                              <h3 className="font-semibold text-lg">Ruta #{route.id_ruta}</h3>
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <User className="w-4 h-4 mr-2 text-blue-600" />
                                    <span className="font-medium">Creada por:</span>
                                  </div>
                                  <p className="ml-6">{route.usuario?.nombre} {route.usuario?.apellido}</p>
                                  <p className="ml-6 text-sm text-gray-500">
                                    <Phone className="w-3 h-3 mr-1 inline" />
                                    {route.usuario?.celular}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                                <span>
                                  Ruta perteneciente a usuario de {institution?.nombre_oficial}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="text-right">
                                <div className="text-sm text-gray-600 mb-1">
                                  ID Usuario: {route.id_usuario}
                                </div>
                                <div className="text-sm text-gray-600">
                                  ID Ruta: {route.id_ruta}
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
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  Ruta Creada
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay rutas creadas</p>
                      <p className="text-sm mt-2">Los usuarios de tu institución aún no han creado rutas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Route Map Modal */}
      <Dialog open={showRouteMap} onOpenChange={handleCloseRouteMap}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa de Ruta #{selectedRoute?.id_ruta}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Usuario Creador</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-blue-600" />
                      {selectedRoute.usuario?.nombre} {selectedRoute.usuario?.apellido}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-2" />
                      {selectedRoute.usuario?.celular}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Información de la Ruta</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Building2 className="w-4 h-4 mr-2" />
                      Pertenece a {institution?.nombre_oficial}
                    </div>
                  </div>
                </div>
              </div>

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

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Usuario:</span> {selectedRoute.usuario?.nombre} {selectedRoute.usuario?.apellido} (ID: {selectedRoute.id_usuario})
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Ruta Creada</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </InstitutionalLayout>
  );
};

export default Dashboard; 