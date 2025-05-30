import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { UserService } from '@/services/userService';

const PendingValidation = () => {
  const { user } = useAuth();
  const [registrationStatus, setRegistrationStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (user?.id) {
        const status = await UserService.getUserRegistrationStatus(user.id);
        setRegistrationStatus(status);
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isDenied = registrationStatus?.institutionStatus === 'denegado';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {isDenied ? (
            <>
              {/* Solicitud Denegada */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Solicitud Denegada
              </h2>
              <p className="text-gray-600 mb-6">
                Tu solicitud para unirte a la institución ha sido denegada. 
                Puedes contactar al administrador de la institución para más información.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/select-institution'}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Intentar con Otra Institución
                </button>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Solicitud Pendiente */}
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Validación Pendiente
              </h2>
              <p className="text-gray-600 mb-6">
                Tu cuenta está siendo revisada por nuestro equipo de administración. 
                Te notificaremos por email una vez que la validación esté completa.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      ¿Qué sigue?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Nuestro equipo revisará tu solicitud</li>
                        <li>Recibirás una notificación por email</li>
                        <li>El proceso puede tomar de 24 a 48 horas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                Verificar Estado
              </button>
            </>
          )}

          {/* Información del usuario */}
          {user && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Usuario: {user.email}
              </p>
              <p className="text-xs text-gray-500">
                Estado: {isDenied ? 'Denegado' : 'Pendiente de validación'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingValidation; 