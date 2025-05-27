
import DashboardLayout from '../../components/layout/DashboardLayout';

const FavoriteRoutes = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Rutas favoritas</h1>
          <p className="text-gray-600 mt-2">
            Aquí encontrarás todas las rutas que has marcado como favoritas para acceso rápido.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <p className="text-gray-500">No tienes rutas favoritas aún.</p>
          <p className="text-sm text-gray-400 mt-2">
            Marca rutas como favoritas desde la sección de búsqueda para verlas aquí.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FavoriteRoutes;
