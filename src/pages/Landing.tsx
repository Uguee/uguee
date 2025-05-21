
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import StatsPanel from '../components/StatsPanel';
import InfoCard from '../components/InfoCard';
import Layout from '../components/layout/Layout';

const LandingPage = () => {
  // Enhanced page description for SEO
  useEffect(() => {
    document.title = 'Ugüee - Tu plataforma de viajes universitarios';
  }, []);

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <Hero 
          title="Tu plataforma de viajes universitarios"
          subtitle="Optimiza tu movilidad dentro y fuera del campus universitario con geolocalización en tiempo real. Viaja seguro y conecta con otros estudiantes."
        />

        {/* Stats and Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50" id="info">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Panel */}
              <div className="col-span-1">
                <StatsPanel />
              </div>

              {/* Features Overview */}
              <div className="col-span-1 lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-text mb-6">¿Cómo funciona Ugüee?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature 1 */}
                    <InfoCard 
                      title="¡Mantente al tanto de los incidentes!"
                      linkText="Incidentes"
                      linkUrl="/incidents"
                    >
                      <p className="text-gray-600 text-sm">
                        ¿Vas tarde? Infórmate en nuestra sección de incidentes para evitar trancones.
                      </p>
                    </InfoCard>

                    {/* Feature 2 */}
                    <InfoCard 
                      title="¡Día sin carro!"
                      linkText="Rutas"
                      linkUrl="/search-routes"
                    >
                      <p className="text-gray-600 text-sm">
                        Prográmate en nuestra sección de rutas y conoce la ruta que más se ajuste a tu viaje
                      </p>
                    </InfoCard>

                    {/* Feature 3 */}
                    <InfoCard 
                      title="¡20% de descuento!"
                      linkText="Aplicar descuento"
                      linkUrl="/discounts"
                    >
                      <p className="text-gray-600 text-sm">
                        Viaje compartido hacia Administración central
                      </p>
                    </InfoCard>

                    {/* Feature 4 */}
                    <InfoCard 
                      title="¡Viaja con amigos y ahorra!"
                      linkText="Aplicar descuento"
                      linkUrl="/discounts"
                    >
                      <p className="text-gray-600 text-sm">
                        15% de descuento al reservar para 3 o más pasajeros
                      </p>
                    </InfoCard>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-text mb-4">Para Universidades e Instituciones</h2>
                  <p className="mb-6 text-gray-600">
                    Ofrecemos una solución integral para la gestión de transporte universitario. 
                    Mejora la movilidad en tu campus y proporciona una alternativa segura y eficiente para estudiantes y personal.
                  </p>
                  <Link 
                    to="/institution-register" 
                    className="inline-block bg-primary hover:bg-gradient-primary text-white font-medium py-3 px-6 rounded-md transition-all duration-300"
                  >
                    Registrar mi institución
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
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
            
            <div className="mt-12 text-center">
              <Link 
                to="/register"
                className="inline-block bg-primary hover:bg-gradient-primary text-white font-medium py-3 px-8 rounded-md transition-all duration-300"
              >
                Comenzar ahora
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-text mb-8 text-center">Lo que dicen nuestros usuarios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4">
                    <h4 className="font-medium">María González</h4>
                    <p className="text-sm text-gray-500">Estudiante, U. del Valle</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Ugüee ha facilitado enormemente mis viajes diarios a la universidad. 
                  Ya no tengo que preocuparme por el transporte público o por llegar tarde a clases."
                </p>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4">
                    <h4 className="font-medium">Carlos Ramírez</h4>
                    <p className="text-sm text-gray-500">Conductor, U. Javeriana</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Como conductor, puedo ofrecer transporte a otros estudiantes y ahorrar en costos. 
                  El sistema es intuitivo y seguro tanto para pasajeros como para conductores."
                </p>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4">
                    <h4 className="font-medium">Laura Mendoza</h4>
                    <p className="text-sm text-gray-500">Admin. Universidad Nacional</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Implementar Ugüee en nuestra institución ha mejorado significativamente la movilidad 
                  y ha reducido los problemas de tráfico alrededor del campus."
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LandingPage;
