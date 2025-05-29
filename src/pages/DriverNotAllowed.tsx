import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const DriverNotAllowed = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Acceso no permitido
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Lo sentimos, no tienes permisos para acceder a la vista de conductor.
              Para ser conductor, necesitas completar el proceso de validación.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <Link
              to="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Volver al dashboard
            </Link>
            <Link
              to="/profile"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Ver mi perfil
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DriverNotAllowed; 