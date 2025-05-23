
import DashboardLayout from '../components/layout/DashboardLayout';

const MapView = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Ver mapa</h1>
          <p className="text-gray-600 mt-2">
            Visualiza rutas, incidentes y ubicaciones en tiempo real.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Mapa interactivo - Próximamente</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MapView;
