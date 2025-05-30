import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ValidationService, PendingUser } from '@/services/validationService';

const UserValidation = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Cargar usuarios pendientes de validación usando el servicio
  const loadPendingUsers = async () => {
    setIsLoading(true);
    
    const result = await ValidationService.getPendingUsers();
    
    if (result.success) {
      setPendingUsers(result.data || []);
    } else {
      console.error('Error cargando usuarios pendientes:', result.error);
      toast({
        title: "Error",
        description: result.error || "No se pudieron cargar los usuarios pendientes.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  // Aprobar usuario usando el servicio
  const approveUser = async (userUuid: string) => {
    setProcessingUserId(userUuid);

    const result = await ValidationService.approveUser(userUuid);

    if (result.success) {
      toast({
        title: "Usuario aprobado",
        description: result.data?.message || "El usuario ha sido aprobado como administrador institucional.",
      });
      
      // Recargar la lista
      await loadPendingUsers();
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo aprobar el usuario.",
        variant: "destructive"
      });
    }

    setProcessingUserId(null);
  };

  // Rechazar usuario usando el servicio
  const rejectUser = async (userUuid: string) => {
    setProcessingUserId(userUuid);

    const result = await ValidationService.rejectUser(userUuid);

    if (result.success) {
      toast({
        title: "Solicitud rechazada",
        description: result.data?.message || "La solicitud ha sido rechazada y el usuario ha sido notificado.",
      });
      
      // Recargar la lista
      await loadPendingUsers();
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo rechazar la solicitud.",
        variant: "destructive"
      });
    }

    setProcessingUserId(null);
  };

  useEffect(() => {
    // Verificar que el usuario sea admin
    if (!user || user.role !== 'admin') {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página.",
        variant: "destructive"
      });
      return;
    }

    loadPendingUsers();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Validación de Instituciones</h1>
          <p className="mt-2 text-gray-600">
            Revisa y aprueba las solicitudes de registro institucional
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-gray-600">
              No hay solicitudes de validación pendientes en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingUsers.map((pendingUser) => (
              <div
                key={pendingUser.uuid}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium text-lg">
                            {pendingUser.nombre.charAt(0)}{pendingUser.apellido.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {pendingUser.nombre} {pendingUser.apellido}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Teléfono: {pendingUser.celular}
                          </p>
                        </div>
                      </div>

                      {pendingUser.institucion && (
                        <div className="bg-gray-50 rounded-md p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Institución Solicitada:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Nombre:</span>
                              <p className="text-gray-600">{pendingUser.institucion.nombre_oficial}</p>
                            </div>
                            <div>
                              <span className="font-medium">Dirección:</span>
                              <p className="text-gray-600">{pendingUser.institucion.direccion}</p>
                            </div>
                            {pendingUser.institucion.logo && (
                              <div className="md:col-span-2">
                                <span className="font-medium">Logo:</span>
                                <img
                                  src={pendingUser.institucion.logo}
                                  alt="Logo de la institución"
                                  className="mt-2 h-16 w-auto object-contain border rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => approveUser(pendingUser.uuid)}
                      disabled={processingUserId === pendingUser.uuid}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingUserId === pendingUser.uuid ? 'Procesando...' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => rejectUser(pendingUser.uuid)}
                      disabled={processingUserId === pendingUser.uuid}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingUserId === pendingUser.uuid ? 'Procesando...' : 'Rechazar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserValidation; 