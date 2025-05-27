
import { useState, useEffect } from 'react';
import { Stats } from '../types';

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    availableVehicles: 0,
    activeRoutes: 0,
    connectedTravelers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, this would be an API call to backend
        // For now, simulate a fetch with mock data
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data
        setStats({
          availableVehicles: 24,
          activeRoutes: 8,
          connectedTravelers: 130,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Error cargando estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
};
