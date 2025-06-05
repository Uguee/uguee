import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AuthFlowService } from '@/services/authFlowService';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);

  // Verificar si el usuario necesita ser redirigido según su rol y estado
  useEffect(() => {
    const checkRedirection = async () => {
      if (!user || isLoading) return;

      console.log('🔍 Verificando redirección para usuario:', user.email, 'Rol:', user.role);

      try {
        const result = await AuthFlowService.determineUserRedirection(user);
        
        console.log('📊 Resultado de redirección:', result);

        if (result.shouldRedirect && result.redirectTo && result.redirectTo !== '/dashboard') {
          console.log('↗️ Redirigiendo a:', result.redirectTo);
          navigate(result.redirectTo, { replace: true });
          return;
        }

        // Si llegamos aquí, el usuario puede permanecer en el dashboard
        console.log('✅ Usuario puede permanecer en dashboard');
        setIsRedirecting(false);
      } catch (error) {
        console.error('❌ Error verificando redirección:', error);
        setIsRedirecting(false);
      }
    };

    checkRedirection();
  }, [user, isLoading, navigate]);

  // Mostrar loading mientras se verifica la redirección
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-white p-4">
        {/* Contenido básico para verificar que funciona */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenido{user ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-gray-600 mb-6">
            "Tu plataforma de viajes universitarios: planifica, comparte y viaja de forma inteligente"
          </p>
        </div>

        {/* Contenido de prueba simple */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de estadísticas simplificado */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border">
              <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <p className="text-2xl lg:text-3xl font-bold text-purple-600">24</p>
                  <p className="text-sm text-gray-600 mt-1">Vehículos disponibles</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-2xl lg:text-3xl font-bold text-purple-600">8</p>
                  <p className="text-sm text-gray-600 mt-1">Rutas activas</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-2xl lg:text-3xl font-bold text-purple-600">130</p>
                  <p className="text-sm text-gray-600 mt-1">Viajeros</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de información simplificada */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Información</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tarjeta 1 */}
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-5">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    ¡Mantente al tanto de los incidentes!
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    ¿Vas tarde? Infórmate en nuestra sección de incidentes para evitar trancones.
                  </p>
                  <a
                    href="/incidents"
                    className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Incidentes
                  </a>
                </div>

                {/* Tarjeta 2 */}
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-5">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    ¡Día sin carro!
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Prográmate en nuestra sección de rutas y conoce la ruta que más se ajuste a tu viaje
                  </p>
                  <a
                    href="/search-routes"
                    className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Rutas
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de descuentos simplificada */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Descuentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Descuento 1 */}
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                ¡20% de descuento!
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Viaje compartido hacia Administración central
              </p>
              <button className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200">
                Aplicar descuento
              </button>
            </div>

            {/* Descuento 2 */}
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                ¡Viaja con amigos y ahorra!
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                15% de descuento al reservar para 3 o más pasajeros
              </p>
              <button className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200">
                Aplicar descuento
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
