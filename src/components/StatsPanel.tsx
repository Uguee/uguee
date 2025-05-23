
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
  className?: string;
  universityName?: string;
  campus?: string;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ 
  className = "",
  universityName,
  campus 
}) => {
  const { stats, isLoading } = useStats();

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      {/* Display university name and campus if provided */}
      {(universityName || campus) && (
        <div className="mb-4 text-center">
          {universityName && <h3 className="font-semibold">{universityName}</h3>}
          {campus && <p className="text-sm text-gray-500">{campus}</p>}
        </div>
      )}
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
