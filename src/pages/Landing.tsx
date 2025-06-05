import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Hero from '../components/Hero';
import InfoCard from '../components/InfoCard';
import Layout from '../components/layout/Layout';
import RegistrationProgress from '../components/RegistrationProgress';
import { AuthFlowService } from '@/services/authFlowService';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'Ugüee - Tu plataforma de viajes universitarios';
  }, []);

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Hero 
            title="Tu plataforma de viajes universitarios"
            subtitle="Optimiza tu movilidad dentro y fuera del campus universitario con geolocalización en tiempo real. Viaja seguro y conecta con otros estudiantes."
            primaryButtonText="Comenzar registro"
            secondaryButtonText="Más información"
            primaryButtonLink="/register"
            secondaryButtonLink="#info"
          />

          {/* Stats and Features Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50" id="info">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 gap-8">
                {/* Institution Registration */}
                <div className="col-span-1 space-y-8">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-2xl">
                    <h2 className="text-3xl font-bold text-text mb-4">Para Universidades e Instituciones</h2>
                    <p className="mb-8 text-gray-600 text-lg">
                      Transforma la movilidad de tu campus con una solución integral y personalizada. 
                      Optimiza el transporte universitario y mejora la experiencia de toda tu comunidad.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Beneficios para tu institución</h3>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Gestión centralizada y monitoreo en tiempo real de todas las rutas</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Reportes detallados y análisis de patrones de movilidad</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Soporte técnico dedicado y capacitación continua</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Reducción de costos operativos y huella de carbono</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">¿Por qué elegir Ugüee?</h3>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Plataforma personalizada según las necesidades de tu institución</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Integración perfecta con sistemas administrativos existentes</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Alta seguridad y confiabilidad en la gestión de datos</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Solución escalable que crece con tu institución</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-8 text-center">
                      <Link 
                        to="/register?type=institution" 
                        className="inline-flex items-center justify-center bg-primary hover:bg-gradient-primary text-white font-medium py-4 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <span>Registrar mi institución</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-text mb-8 text-center">Cómo funciona</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Regístrate</h3>
                  <p className="text-gray-600">
                    Crea tu cuenta con tus credenciales institucionales y completa tu perfil.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Busca rutas</h3>
                  <p className="text-gray-600">
                    Encuentra las rutas disponibles desde tu ubicación hacia tu destino universitario.
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-2">¡Viaja seguro!</h3>
                  <p className="text-gray-600">
                    Resérvate un lugar en la ruta de tu preferencia y disfruta de un transporte seguro.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      );
    }

    // For authenticated users, show their progress
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text mb-4">
              Bienvenido{user ? `, ${user.firstName}` : ''}
            </h1>
            <p className="text-xl text-gray-600">
              Sigue estos pasos para comenzar a usar Ugüee
            </p>
          </div>

          <RegistrationProgress />

          <div className="mt-12 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center bg-primary hover:bg-gradient-primary text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="bg-white">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default LandingPage;
