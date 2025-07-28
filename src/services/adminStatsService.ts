import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  institutions: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    topInstitution: string;
  };
  users: {
    total: number;
    students: number;
    professors: number;
    administrative: number;
    drivers: number;
    activeToday: number;
    newRegistrations: number;
  };
  vehicles: {
    total: number;
    cars: number;
    motorcycles: number;
    others: number;
  };
  routes: {
    totalRoutes: number;
    tripsCompleted: number;
    tripsToday: number;
    averagePassengers: number;
  };
  quality: {
    averageRating: number;
    totalReviews: number;
    monthlyReviews: number;
  };
  activity: {
    activeUsers: number;
    newRegistrations: number;
    validatedDocuments: number;
  };
}

// Función para transformar los datos de la Edge Function al formato que espera el Dashboard
function transformEdgeFunctionData(edgeData: any): AdminStats {
  console.log('🔄 Transformando datos de Edge Function...', edgeData);
  
  const data = edgeData.data || edgeData;
  
  const transformed: AdminStats = {
    institutions: {
      total: data.instituciones?.total_registradas || 0,
      active: data.instituciones?.activas || 0,
      pending: data.instituciones?.pendientes || 0,
      rejected: data.instituciones?.rechazadas || 0,
      topInstitution: data.instituciones?.institucion_principal || 'N/A'
    },
    users: {
      total: data.usuarios?.total_registrados || 0,
      students: data.usuarios?.estudiantes || 0,
      professors: data.usuarios?.profesores || 0,
      administrative: data.usuarios?.administrativos || 0,
      drivers: data.usuarios?.conductores || 0,
      activeToday: data.actividad?.usuarios_activos_hoy || 0,
      newRegistrations: data.actividad?.nuevos_registros_7_dias || 0
    },
    vehicles: {
      total: data.vehiculos?.total_registrados || 0,
      cars: data.vehiculos?.automoviles || 0,
      motorcycles: data.vehiculos?.motocicletas || 0,
      others: data.vehiculos?.otros || 0
    },
    routes: {
      totalRoutes: data.rutas_y_viajes?.rutas_activas || 0,
      tripsCompleted: data.rutas_y_viajes?.viajes_realizados || 0,
      tripsToday: data.rutas_y_viajes?.viajes_hoy || 0,
      averagePassengers: data.rutas_y_viajes?.promedio_pasajeros || 0
    },
    quality: {
      averageRating: data.calidad?.calificacion_promedio || 0,
      totalReviews: data.calidad?.total_reseñas || 0,
      monthlyReviews: data.calidad?.reseñas_este_mes || 0
    },
    activity: {
      activeUsers: data.actividad?.usuarios_activos_hoy || 0,
      newRegistrations: data.actividad?.nuevos_registros_7_dias || 0,
      validatedDocuments: data.actividad?.documentos_validados || 0
    }
  };
  
  console.log('✅ Datos transformados:', transformed);
  return transformed;
}

export const adminStatsService = {
  async getStats(): Promise<AdminStats> {
    try {
      console.log('🔍 Llamando a admin-dashboard-stats...');
      const { data, error } = await supabase.functions.invoke('admin-dashboard-stats', {
        body: {},
      });

      if (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
      }

      console.log('📊 Datos recibidos de Edge Function:', data);
      
      // Transformar los datos al formato que espera el Dashboard
      const transformedData = transformEdgeFunctionData(data);
      
      return transformedData;
    } catch (error) {
      console.error('Error in adminStatsService.getStats:', error);
      throw error;
    }
  },

  async getInstitutionStats() {
    try {
      const { data, error } = await supabase.functions.invoke('admin-institution-stats', {
        body: {},
      });

      if (error) {
        console.error('Error fetching institution stats:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in adminStatsService.getInstitutionStats:', error);
      throw error;
    }
  },

  async getUserStats() {
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-stats', {
        body: {},
      });

      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in adminStatsService.getUserStats:', error);
      throw error;
    }
  },

  async getVehicleStats() {
    try {
      const { data, error } = await supabase.functions.invoke('admin-vehicle-stats', {
        body: {},
      });

      if (error) {
        console.error('Error fetching vehicle stats:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in adminStatsService.getVehicleStats:', error);
      throw error;
    }
  },

  async getTripStats() {
    try {
      const { data, error } = await supabase.functions.invoke('admin-trip-stats', {
        body: {},
      });

      if (error) {
        console.error('Error fetching trip stats:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in adminStatsService.getTripStats:', error);
      throw error;
    }
  },

  async getQualityStats() {
    try {
      const { data, error } = await supabase.functions.invoke('admin-quality-stats', {
        body: {},
      });

      if (error) {
        console.error('Error fetching quality stats:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in adminStatsService.getQualityStats:', error);
      throw error;
    }
  },
}; 