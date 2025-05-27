
import React from 'react';
import { Route } from '../types';

interface RouteMapProps {
  route?: Route;
  className?: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ route, className = "" }) => {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-green-100 ${className}`}>
      {/* This is a placeholder for a real map component */}
      <div className="w-full h-full min-h-[200px] flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-green-800 mb-2 font-medium">Mapa de Ruta</p>
          <p className="text-sm text-gray-600">
            {route ? `De ${route.origin.name} a ${route.destination.name}` : 'Cargando mapa...'}
          </p>
          <p className="text-xs mt-4 text-gray-500">
            En una implementación real, aquí se mostraría un mapa interactivo
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
