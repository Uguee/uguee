import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { InstitutionService } from '../services/institutionService';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  activeDrivers: number;
  activeRoutes: number;
  pendingRequests: number;
  students: number;
  teachers: number;
  others: number;
  completedTripsToday: number;
  usersTransportedToday: number;
  averageTripTime: string;
  averageOccupancy: string;
}

interface ActivitySummary {
  completedTripsToday: number;
  usersTransportedToday: number;
  averageTripTime: string;
  averageOccupancy: string;
}

export const useInstitutionDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVehicles: 0,
    activeDrivers: 0,
    activeRoutes: 0,
    pendingRequests: 0,
    students: 0,
    teachers: 0,
    others: 0,
    completedTripsToday: 0,
    usersTransportedToday: 0,
    averageTripTime: '0 min',
    averageOccupancy: '0%'
  });
  
  const [users, setUsers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const [institutionRoutes, setInstitutionRoutes] = useState<any[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<any[]>([]);
  const [driverRequests, setDriverRequests] = useState<any[]>([]);

  const loadInstitutionData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('🔍 Cargando datos del dashboard institucional...');

      // Obtener UUID de la sesión
      const { data: { session } } = await supabase.auth.getSession();
      const userUuid = session?.user?.id;
      
      if (!userUuid) {
        throw new Error('No se pudo obtener el UUID del usuario');
      }

      // 1. Obtener institución
      const institutionResult = await InstitutionService.getInstitutionByAdmin(userUuid);
      
      if (!institutionResult.success || !institutionResult.data) {
        throw new Error(institutionResult.error || 'No se encontró institución');
      }

      const institutionData = institutionResult.data;
      setInstitution(institutionData);
      const institutionId = institutionData.id_institucion;

      // 2. Cargar datos básicos en paralelo (limitado)
      const [statsResult, usersResult, driversResult] = await Promise.all([
        InstitutionService.getInstitutionStats(institutionId),
        InstitutionService.getUsersByInstitution(institutionId),
        InstitutionService.getDriversByInstitution(institutionId)
      ]);

      // 3. Procesar resultados básicos
      if (usersResult.success) {
        setUsers(usersResult.data || []);
      }

      if (driversResult.success) {
        setDrivers(driversResult.data || []);
      }

      // 4. Cargar datos adicionales después
      await loadAdditionalData(institutionId);

      // 5. Calcular estadísticas reales
      const activitySummary = await calculateActivitySummary(institutionId);
      
      if (statsResult.success) {
        setStats({
          totalUsers: statsResult.data.total_users || 0,
          totalVehicles: statsResult.data.total_vehicles || 0,
          activeDrivers: statsResult.data.total_drivers || 0,
          activeRoutes: 0, // Se actualizará con loadAdditionalData
          pendingRequests: statsResult.data.pending_requests || 0,
          students: statsResult.data.students || 0,
          teachers: statsResult.data.teachers || 0,
          others: statsResult.data.others || 0,
          ...activitySummary
        });
      }

    } catch (error: any) {
      console.error('❌ Error cargando datos del dashboard:', error);
      toast({
        title: "Error",
        description: error.message || "Error al cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdditionalData = async (institutionId: number) => {
    try {
      console.log('📊 Cargando datos adicionales...');
      
      const [vehiclesResult, institutionRoutesResult, activeRoutesResult, registrationResult, driverResult] = await Promise.all([
        InstitutionService.getVehiclesByInstitution(institutionId),
        InstitutionService.getRoutesByInstitution(institutionId), // Nuevo método basado en usuario_ruta
        InstitutionService.getActiveRoutesByInstitution(institutionId), // Mantener para viajes activos
        loadRegistrationRequests(institutionId),
        loadDriverRequests(institutionId)
      ]);

      if (vehiclesResult.success) {
        setVehicles(vehiclesResult.data || []);
      }

      if (institutionRoutesResult.success) {
        setInstitutionRoutes(institutionRoutesResult.data || []);
        console.log('🛣️ Rutas de usuarios de la institución cargadas:', institutionRoutesResult.data?.length || 0);
      }

      if (activeRoutesResult.success) {
        setActiveRoutes(activeRoutesResult.data || []);
        console.log('🚗 Rutas con viajes activos cargadas:', activeRoutesResult.data?.length || 0);
      }

      // Actualizar estadísticas con las rutas de usuarios de la institución
      setStats(prev => ({
        ...prev,
        activeRoutes: institutionRoutesResult.success ? institutionRoutesResult.data?.length || 0 : 0
      }));

    } catch (error) {
      console.error('❌ Error cargando datos adicionales:', error);
    }
  };

  const loadRegistrationRequests = async (institutionId: number) => {
    try {
      const { data, error } = await supabase
        .from('registro')
        .select(`
          id_usuario,
          validacion,
          fecha_registro,
          rol_institucional,
          correo_institucional,
          usuario:usuario (
            nombre,
            apellido,
            celular,
            fecha_nacimiento
          )
        `)
        .eq('id_institucion', institutionId)
        .eq('validacion', 'pendiente')
        .order('fecha_registro', { ascending: false });

      if (!error && data) {
        setRegistrationRequests(data);
      }
    } catch (error) {
      console.error('❌ Error cargando solicitudes de registro:', error);
    }
  };

  const loadDriverRequests = async (institutionId: number) => {
    try {
      const { data, error } = await supabase
        .from('registro')
        .select(`
          id_usuario,
          validacion_conductor,
          fecha_registro,
          correo_institucional,
          usuario:usuario (
            nombre,
            apellido,
            celular
          )
        `)
        .eq('id_institucion', institutionId)
        .eq('validacion_conductor', 'pendiente')
        .order('fecha_registro', { ascending: false });

      if (!error && data) {
        setDriverRequests(data);
      }
    } catch (error) {
      console.error('❌ Error cargando solicitudes de conductores:', error);
    }
  };

  const calculateActivitySummary = async (institutionId: number): Promise<ActivitySummary> => {
    try {
      console.log('📊 Calculando resumen de actividad real para institución:', institutionId);
      
      // Obtener usuarios de la institución
      const { data: registros, error: registrosError } = await supabase
        .from('registro')
        .select('id_usuario')
        .eq('id_institucion', institutionId);

      if (registrosError || !registros) {
        console.error('❌ Error obteniendo usuarios de institución:', registrosError);
        return {
          completedTripsToday: 0,
          usersTransportedToday: 0,
          averageTripTime: '0 min',
          averageOccupancy: '0%'
        };
      }

      const userIds = registros.map(r => r.id_usuario);
      console.log('👥 IDs de usuarios de la institución:', userIds.length);

      if (userIds.length === 0) {
        return {
          completedTripsToday: 0,
          usersTransportedToday: 0,
          averageTripTime: '0 min',
          averageOccupancy: '0%'
        };
      }

      // Obtener todos los viajes completados de conductores de esta institución
      const { data: completedTrips, error: tripsError } = await supabase
        .from('viaje')
        .select(`
          id_viaje,
          id_conductor,
          programado_at,
          salida_at,
          llegada_at
        `)
        .in('id_conductor', userIds)
        .not('llegada_at', 'is', null); // Solo viajes que han llegado (completados)

      if (tripsError) {
        console.error('❌ Error obteniendo viajes completados:', tripsError);
        return {
          completedTripsToday: 0,
          usersTransportedToday: 0,
          averageTripTime: '0 min',
          averageOccupancy: '0%'
        };
      }

      const totalCompletedTrips = completedTrips?.length || 0;
      console.log('✅ Total de viajes completados por conductores de la institución:', totalCompletedTrips);

      // Por ahora, solo retornamos el dato real de viajes completados
      // Los otros datos se pueden calcular posteriormente si se requieren
      return {
        completedTripsToday: totalCompletedTrips,
        usersTransportedToday: 0, // Placeholder por ahora
        averageTripTime: '0 min', // Placeholder por ahora
        averageOccupancy: '0%' // Placeholder por ahora
      };
    } catch (error) {
      console.error('❌ Error calculando resumen de actividad:', error);
      return {
        completedTripsToday: 0,
        usersTransportedToday: 0,
        averageTripTime: '0 min',
        averageOccupancy: '0%'
      };
    }
  };

  const handleApproveRequest = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('registro')
        .update({ validacion: 'validado' })
        .eq('id_usuario', userId)
        .eq('id_institucion', institution?.id_institucion);

      if (error) throw error;

      setRegistrationRequests(prev => prev.filter(request => request.id_usuario !== userId));
      setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
      
      toast({
        title: "Solicitud aprobada",
        description: "El usuario ha sido aprobado exitosamente",
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('registro')
        .update({ validacion: 'denegado' })
        .eq('id_usuario', userId)
        .eq('id_institucion', institution?.id_institucion);

      if (error) throw error;

      setRegistrationRequests(prev => prev.filter(request => request.id_usuario !== userId));
      setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
      
      toast({
        title: "Solicitud rechazada",
        description: "El usuario ha sido rechazado",
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleApproveDriverRequest = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('registro')
        .update({ validacion_conductor: 'validado' })
        .eq('id_usuario', userId)
        .eq('id_institucion', institution?.id_institucion);

      if (error) throw error;

      setDriverRequests(prev => prev.filter(request => request.id_usuario !== userId));
      
      toast({
        title: "Conductor aprobado",
        description: "El conductor ha sido aprobado exitosamente",
      });
    } catch (error) {
      console.error('Error approving driver request:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la solicitud del conductor",
        variant: "destructive",
      });
    }
  };

  const handleRejectDriverRequest = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('registro')
        .update({ validacion_conductor: 'denegado' })
        .eq('id_usuario', userId)
        .eq('id_institucion', institution?.id_institucion);

      if (error) throw error;

      setDriverRequests(prev => prev.filter(request => request.id_usuario !== userId));
      
      toast({
        title: "Conductor rechazado",
        description: "El conductor ha sido rechazado",
      });
    } catch (error) {
      console.error('Error rejecting driver request:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud del conductor",
        variant: "destructive",
      });
    }
  };

  const refreshData = () => {
    if (institution?.id_institucion) {
      loadInstitutionData();
    }
  };

  useEffect(() => {
    loadInstitutionData();
  }, [user?.id]);

  return {
    isLoading,
    institution,
    stats,
    users,
    drivers,
    vehicles,
    activeRoutes,
    institutionRoutes, // Rutas de usuarios de la institución (basado en usuario_ruta)
    registrationRequests,
    driverRequests,
    handleApproveRequest,
    handleRejectRequest,
    handleApproveDriverRequest,
    handleRejectDriverRequest,
    refreshData
  };
}; 