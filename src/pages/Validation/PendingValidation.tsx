import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { AuthFlowService } from '@/services/authFlowService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const PendingValidation = () => {
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserStatus = async () => {
      if (!user?.id) {
        setError('No se encontró información del usuario');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const status = await AuthFlowService.getUserStatus(user.id);
        console.log('📋 Estado del usuario:', status);
        
        if (!status) {
          throw new Error('No se pudo obtener el estado del usuario');
        }

        setUserStatus(status);

        // Si el usuario ya está validado, redirigir al dashboard
        if (status.isValidated) {
          console.log('✅ Usuario validado, redirigiendo a dashboard');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error loading user status:', err);
        setError('Error al cargar el estado de validación');
        toast({
          title: "Error",
          description: "No se pudo cargar el estado de validación. Por favor, intenta de nuevo.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserStatus();
  }, [user?.id, navigate]);

  const handleRefreshStatus = async () => {
    if (!user?.id) {
      setError('No se encontró información del usuario');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const status = await AuthFlowService.getUserStatus(user.id);
      console.log('📋 Estado actualizado del usuario:', status);
      
      if (!status) {
        throw new Error('No se pudo obtener el estado del usuario');
      }

      setUserStatus(status);

      // Si el usuario ya está validado, redirigir al dashboard
      if (status.isValidated) {
        console.log('✅ Usuario validado, redirigiendo a dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error refreshing user status:', err);
      setError('Error al actualizar el estado de validación');
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de validación. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !userStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar el estado
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'No se pudo cargar el estado de validación. Por favor, intenta de nuevo.'}
            </p>
            <button 
              onClick={handleRefreshStatus}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {userStatus?.isDenied ? (
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
                  onClick={() => navigate('/select-institution')}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Intentar con Otra Institución
                </button>
                <button 
                  onClick={() => navigate('/login')}
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
              
              <div className="flex items-start mb-6">
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

              <button 
                onClick={handleRefreshStatus}
                disabled={isLoading}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verificando...
                  </div>
                ) : (
                  'Verificar Estado'
                )}
              </button>
            </>
          )}

          {/* Información del usuario */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Usuario: {user?.email}
            </p>
            <p className="text-xs text-gray-500">
              Estado: {userStatus?.isDenied ? 'Denegado' : 'Pendiente de validación'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingValidation; 