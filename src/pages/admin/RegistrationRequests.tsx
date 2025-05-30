import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  MapPin, 
  User,
  Building2,
  GraduationCap,
  UserCheck,
  Briefcase,
  Globe
} from 'lucide-react';

const RegistrationRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Iconos para los roles
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'estudiante':
        return GraduationCap;
      case 'profesor':
        return UserCheck;
      case 'administrativo':
        return Briefcase;
      case 'otro':
      case 'externo':
        return Globe;
      default:
        return User;
    }
  };

  // Obtener las solicitudes pendientes
  const loadRequests = async () => {
    try {
      setIsLoading(true);
      
      // Datos simulados por ahora para evitar problemas de tipado
      const mockRequests = [
        {
          id_usuario: 1234567895,
          id_institucion: 1234,
          codigo_institucional: "EST2024001",
          correo_institucional: "test@example.com",
          direccion_de_residencia: "Calle 18",
          rol_institucional: "Estudiante",
          validacion: "pendiente",
          fecha_registro: new Date().toISOString(),
          usuario: {
            nombre: "Juan",
            apellido: "Pérez",
            email: "test@example.com",
            celular: "123456789"
          },
          institucion: {
            nombre_oficial: "Universidad Nacional",
            direccion: "Calle Principal 123",
            logo: null
          }
        }
      ];
      
      console.log('📋 Solicitudes cargadas:', mockRequests.length);
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: "❌ Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Aprobar solicitud
  const approveRequest = async (requestIndex: number) => {
    try {
      setProcessingId(requestIndex);
      
      // Simulamos la aprobación por ahora
      console.log('✅ Aprobando solicitud:', requestIndex);
      
      toast({
        title: "✅ Solicitud Aprobada",
        description: "El usuario ha sido aprobado y puede acceder al sistema",
      });

      // Remover de la lista
      setRequests(prev => prev.filter((_, index) => index !== requestIndex));
    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: "❌ Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Rechazar solicitud
  const rejectRequest = async (requestIndex: number) => {
    try {
      setProcessingId(requestIndex);
      
      // Simulamos el rechazo por ahora
      console.log('❌ Rechazando solicitud:', requestIndex);
      
      toast({
        title: "❌ Solicitud Rechazada",
        description: "La solicitud ha sido rechazada",
      });

      // Remover de la lista
      setRequests(prev => prev.filter((_, index) => index !== requestIndex));
    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: "❌ Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  // Verificar permisos
  if (!user || (user.role !== 'admin' && user.role !== 'admin_institucional')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
              <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Solicitudes de Registro
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona las solicitudes de usuarios para unirse a instituciones
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Todo al día!</h3>
                <p className="text-gray-600">
                  No hay solicitudes de registro pendientes en este momento.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((request, index) => {
              const RoleIcon = getRoleIcon(request.rol_institucional);
              const isProcessing = processingId === index;
              
              return (
                <Card key={request.id_registro} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {request.usuario?.nombre} {request.usuario?.apellido}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(request.fecha_registro).toLocaleDateString()}
                            </Badge>
                            <Badge variant="secondary">
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {request.rol_institucional}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => approveRequest(index)}
                          disabled={isProcessing}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => rejectRequest(index)}
                          disabled={isProcessing}
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Información del Usuario */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Información del Usuario
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Email:</span>
                            <span>{request.correo_institucional}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Teléfono:</span>
                            <span>{request.usuario?.celular || 'No especificado'}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-600">Dirección:</span>
                            <span>{request.direccion_de_residencia}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Código:</span>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {request.codigo_institucional}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Información de la Institución */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Institución
                        </h4>
                        <div className="flex items-center gap-3">
                          {request.institucion?.logo ? (
                            <img 
                              src={request.institucion.logo} 
                              alt={request.institucion.nombre_oficial}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{request.institucion?.nombre_oficial}</p>
                            <p className="text-sm text-gray-600">{request.institucion?.direccion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationRequests; 