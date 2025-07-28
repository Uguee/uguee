import { useState, useEffect } from 'react';
import { adminStatsService, AdminStats } from '@/services/adminStatsService';

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando fetchStats...');
      const data = await adminStatsService.getStats();
      console.log('📊 Datos recibidos en useAdminStats:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Error fetching admin stats:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const setMockData = (mockData: AdminStats) => {
    setStats(mockData);
  };

  return {
    stats,
    loading,
    error,
    refetch,
    setMockData,
  };
};

// Hook específico para estadísticas individuales si se necesita
export const useInstitutionStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminStatsService.getInstitutionStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching institution stats:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}; 