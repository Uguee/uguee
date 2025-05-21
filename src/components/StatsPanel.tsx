
import { useState, useEffect } from 'react';
import { useStats } from '../hooks/useStats';

interface StatItemProps {
  label: string;
  value: number | string;
  color?: string;
  loading?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ 
  label, 
  value, 
  color = 'text-primary',
  loading = false
}) => {
  return (
    <div className="flex flex-col items-center">
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <p className={`text-2xl lg:text-3xl font-bold ${color}`}>{value}</p>
      )}
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
};

interface StatsPanelProps {
  universityName?: string;
  campus?: string;
  location?: string;
  className?: string;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ 
  universityName = "Universidad del Valle",
  campus = "campus",
  location = "Ubicación actual",
  className = ""
}) => {
  const { stats, isLoading } = useStats();

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-text">{universityName}</h3>
        <p className="text-sm text-gray-500">{campus}</p>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm text-gray-500 mb-2">{location}</h4>
        <div className="bg-gray-100 h-10 rounded-md flex items-center px-3 text-gray-400">
          Determinando ubicación...
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <StatItem
          label="Vehículos disponibles"
          value={isLoading ? "..." : stats.availableVehicles}
          loading={isLoading}
        />
        <StatItem
          label="Rutas activas"
          value={isLoading ? "..." : stats.activeRoutes}
          loading={isLoading}
        />
        <StatItem
          label="Viajeros"
          value={isLoading ? "..." : stats.connectedTravelers}
          loading={isLoading}
          color="text-primary"
        />
      </div>
    </div>
  );
};

export default StatsPanel;
