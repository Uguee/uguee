import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, Building2, User, MapPin, Palette, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InstitutionValidationService } from '@/services/institutionValidationService';

interface InstitutionRequest {
  id_institucion: number;
  nombre_oficial: string;
  direccion: string;
  colores: string;
  logo?: string;
  validacion: string;
  created_at: string;
  admin_institucional: string;
  admin_name?: string;
  admin_phone?: string;
}

const InstitutionRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<InstitutionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Usar el servicio para obtener instituciones pendientes
      const result = await InstitutionValidationService.getPendingInstitutions();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener solicitudes');
      }
      
      // Transformar los datos para que coincidan con la interfaz
      const transformedRequests = (result.data || []).map(institution => ({
        id_institucion: institution.id_institucion,
        nombre_oficial: institution.nombre_oficial,
        direccion: institution.direccion,
        colores: institution.colores,
        logo: institution.logo,
        validacion: institution.validacion,
        created_at: new Date().toISOString(), // Placeholder, ya que no tenemos created_at en la tabla
        admin_institucional: institution.admin_institucional,
        admin_name: institution.usuario ? `${institution.usuario.nombre} ${institution.usuario.apellido}` : 'Usuario no encontrado',
        admin_phone: 'No disponible' // Placeholder
      }));

      setRequests(transformedRequests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleValidation = async (institutionId: number, action: 'aprobar' | 'denegar') => {
    if (!user) return;

    setProcessingId(institutionId);

    try {
      // Obtener el UUID desde la sesión de Supabase en lugar de usar user.id (que es la cédula)
      const { data: { session } } = await supabase.auth.getSession();
      const userUuid = session?.user?.id;
      
      if (!userUuid) {
        throw new Error('No se pudo obtener el UUID del usuario de la sesión');
      }

      // Obtener el ID numérico del usuario admin usando el UUID correcto
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('uuid', userUuid)
        .single();

      if (userError || !userData) {
        throw new Error('No se pudo obtener el ID del usuario admin');
      }

      let result;
      
      if (action === 'aprobar') {
        result = await InstitutionValidationService.approveInstitution(institutionId, userData.id_usuario);
      } else {
        result = await InstitutionValidationService.denyInstitution(institutionId, userData.id_usuario);
      }

      if (!result.success) {
        throw new Error(result.error || 'Error procesando la solicitud');
      }

      toast({
        title: "Éxito",
        description: result.message,
        variant: "default"
      });

      // Refrescar la lista
      await fetchRequests();

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Error al procesar la solicitud',
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando solicitudes de instituciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Instituciones</h1>
          </div>
          <p className="text-gray-600">
            Gestiona las solicitudes de registro de nuevas instituciones educativas
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Solicitudes Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{requests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-gray-600">
                Todas las solicitudes de instituciones han sido procesadas
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id_institucion} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl">{request.nombre_oficial}</CardTitle>
                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Solicitado el {new Date(request.created_at).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </span>
                      </CardDescription>
                    </div>
                    
                    {request.logo && (
                      <div className="ml-4">
                        <img 
                          src={request.logo} 
                          alt={`Logo de ${request.nombre_oficial}`}
                          className="w-16 h-16 object-contain bg-gray-50 rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Institution Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">Datos de la Institución</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Dirección</p>
                            <p className="text-sm text-gray-600">{request.direccion}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Palette className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Color Institucional</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div 
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: request.colores }}
                              ></div>
                              <span className="text-sm text-gray-600">{request.colores}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admin Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">Administrador Institucional</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <User className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Nombre Completo</p>
                            <p className="text-sm text-gray-600">{request.admin_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <User className="w-4 h-4 text-gray-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Teléfono</p>
                            <p className="text-sm text-gray-600">{request.admin_phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6 pt-6 border-t">
                    <Button
                      onClick={() => handleValidation(request.id_institucion, 'aprobar')}
                      disabled={processingId === request.id_institucion}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingId === request.id_institucion ? 'Procesando...' : 'Aprobar Institución'}
                    </Button>
                    
                    <Button
                      onClick={() => handleValidation(request.id_institucion, 'denegar')}
                      disabled={processingId === request.id_institucion}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {processingId === request.id_institucion ? 'Procesando...' : 'Denegar Solicitud'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionRequests; 