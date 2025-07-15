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

          {/* Sección de características principales */}
          <section className="py-20 bg-gradient-to-b from-purple-50 to-white" id="info">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  ¿Por qué elegir <span className="text-primary">Ugüee</span>?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Una plataforma integral diseñada para revolucionar la movilidad universitaria
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-primary">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Geolocalización en tiempo real</h3>
                  <p className="text-gray-600">
                    Rastrea tu transporte universitario en tiempo real y obtén actualizaciones precisas sobre llegadas y rutas.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-purple-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Viajes seguros</h3>
                  <p className="text-gray-600">
                    Conductores verificados, rutas seguras y sistema de calificaciones para garantizar tu tranquilidad.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-purple-400">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Conecta con estudiantes</h3>
                  <p className="text-gray-600">
                    Comparte viajes con otros estudiantes de tu institución y construye una comunidad universitaria.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección para universidades e instituciones - Rediseñada */}
          <section className="py-20 bg-gradient-to-br from-purple-900 via-primary to-purple-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Para Universidades e Instituciones</h2>
                <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                  Transforma la movilidad de tu campus con una solución integral y personalizada
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-6">Beneficios para tu institución</h3>
                  <ul className="space-y-4 text-purple-100">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-3 mt-1">✓</span>
                      <span>Gestión centralizada y monitoreo en tiempo real de todas las rutas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-3 mt-1">✓</span>
                      <span>Reportes detallados y análisis de patrones de movilidad</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-3 mt-1">✓</span>
                      <span>Soporte técnico dedicado y capacitación continua</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-3 mt-1">✓</span>
                      <span>Reducción de costos operativos y huella de carbono</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-6">¿Por qué elegir Ugüee?</h3>
                  <ul className="space-y-4 text-purple-100">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-3 mt-1">✓</span>
                      <span>Plataforma personalizada según las necesidades de tu institución</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-3 mt-1">✓</span>
                      <span>Integración perfecta con sistemas administrativos existentes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-3 mt-1">✓</span>
                      <span>Alta seguridad y confiabilidad en la gestión de datos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-3 mt-1">✓</span>
                      <span>Solución escalable que crece con tu institución</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75"></div>
                  <Link 
                    to="/institution-admin-register" 
                    className="relative inline-flex items-center justify-center bg-white text-primary font-bold py-4 px-10 rounded-xl text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105 group"
                  >
                    <span className="mr-2">Registrar mi institución</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Cómo funciona - Rediseñada */}
          <section className="py-20 bg-gradient-to-br from-primary/5 to-purple-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">¿Cómo funciona?</h2>
                <p className="text-xl text-gray-600">Solo 3 pasos para comenzar tu viaje</p>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-xl">
                      1
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Regístrate</h3>
                    <p className="text-gray-600 text-lg">
                      Crea tu cuenta con tus credenciales institucionales y completa tu perfil de forma rápida y segura.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-xl">
                      2
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Busca rutas</h3>
                    <p className="text-gray-600 text-lg">
                      Encuentra las mejores rutas desde tu ubicación hacia tu destino universitario en tiempo real.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-xl">
                      3
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">¡Viaja seguro!</h3>
                    <p className="text-gray-600 text-lg">
                      Reserva tu lugar en la ruta de tu preferencia y disfruta de un transporte seguro y confiable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      );
    }

    // For authenticated users, show their progress
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
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
              className="inline-flex items-center justify-center bg-primary hover:bg-gradient-primary text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
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
      {renderContent()}
    </Layout>
  );
};

export default LandingPage;
