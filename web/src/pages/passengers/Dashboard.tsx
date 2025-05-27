
import { useEffect } from 'react';
import Hero from '../../components/Hero';
import StatsPanel from '../../components/StatsPanel';
import InfoCard from '../../components/InfoCard';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Ugüee - Dashboard';
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-4">Inicio</h1>
          <p className="text-gray-600 mb-6">
            "Tu plataforma de viajes universitarios: planifica, comparte y viaja de forma inteligente"
          </p>
        </div>

        {/* Stats and Features Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Panel */}
            <div className="col-span-1">
              <StatsPanel />
            </div>

            {/* Features Overview */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Información</h2>
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Discounts Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-text mb-6">Descuentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Discount 1 */}
            <InfoCard 
              title="¡20% de descuento!"
              linkText="Aplicar descuento"
              linkUrl="/discounts"
            >
              <p className="text-gray-600 text-sm">
                Viaje compartido hacia Administración central
              </p>
            </InfoCard>

            {/* Discount 2 */}
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
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
