import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export class InstitutionValidationService {
  /**
   * Aprobar una institución
   */
  static async approveInstitution(institutionId: number, adminUserId: number): Promise<ValidationResult> {
    try {
      console.log('🟢 Aprobando institución:', { institutionId, adminUserId });

      const { data, error } = await supabase.functions.invoke('validate-institution', {
        body: {
          institutionId,
          action: 'aprobar',
          adminUserId
        }
      });

      if (error) {
        console.error('Error en función Edge:', error);
        return {
          success: false,
          error: error.message || 'Error conectando con el servidor'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Error desconocido'
        };
      }

      console.log('✅ Institución aprobada exitosamente');
      return {
        success: true,
        message: data.message,
        data: data.data
      };

    } catch (error: any) {
      console.error('Error aprobando institución:', error);
      return {
        success: false,
        error: error.message || 'Error interno'
      };
    }
  }

  /**
   * Denegar una institución
   */
  static async denyInstitution(institutionId: number, adminUserId: number): Promise<ValidationResult> {
    try {
      console.log('🔴 Denegando institución:', { institutionId, adminUserId });

      const { data, error } = await supabase.functions.invoke('validate-institution', {
        body: {
          institutionId,
          action: 'denegar',
          adminUserId
        }
      });

      if (error) {
        console.error('Error en función Edge:', error);
        return {
          success: false,
          error: error.message || 'Error conectando con el servidor'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Error desconocido'
        };
      }

      console.log('❌ Institución denegada exitosamente');
      return {
        success: true,
        message: data.message,
        data: data.data
      };

    } catch (error: any) {
      console.error('Error denegando institución:', error);
      return {
        success: false,
        error: error.message || 'Error interno'
      };
    }
  }

  /**
   * Obtener todas las instituciones pendientes de validación
   */
  static async getPendingInstitutions(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      console.log('📋 Obteniendo instituciones pendientes...');

      // Primero obtener las instituciones pendientes sin el join
      const { data: institutions, error } = await supabase
        .from('institucion')
        .select(`
          id_institucion,
          nombre_oficial,
          direccion,
          validacion,
          admin_institucional,
          logo,
          colores
        `)
        .eq('validacion', 'pendiente')
        .order('id_institucion', { ascending: false });

      console.log('🔍 Consulta realizada. Error:', error);
      console.log('📊 Datos obtenidos:', institutions);

      if (error) {
        console.error('Error obteniendo instituciones pendientes:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Si no hay instituciones, retornar array vacío
      if (!institutions || institutions.length === 0) {
        console.log('📊 No hay instituciones pendientes');
        // Vamos a verificar si hay instituciones con cualquier estado
        const { data: allInstitutions, error: allError } = await supabase
          .from('institucion')
          .select('id_institucion, nombre_oficial, validacion')
          .order('id_institucion', { ascending: false });
        
        console.log('🔍 Todas las instituciones en la DB:', allInstitutions);
        console.log('🔍 Error al obtener todas:', allError);
        
        return {
          success: true,
          data: []
        };
      }

      // Obtener los UUIDs de los admins institucionales
      const adminUuids = institutions.map(inst => inst.admin_institucional);
      console.log('👥 UUIDs de admins a buscar:', adminUuids);

      // Obtener los datos de los usuarios por UUID
      const { data: users, error: usersError } = await supabase
        .from('usuario')
        .select('uuid, nombre, apellido, celular, id_usuario')
        .in('uuid', adminUuids);

      console.log('👤 Usuarios encontrados:', users);
      console.log('❌ Error de usuarios:', usersError);

      if (usersError) {
        console.warn('Error obteniendo datos de usuarios:', usersError);
      }

      // Obtener los emails del registro institucional usando los id_usuario
      const institutionIds = institutions.map(inst => inst.id_institucion);
      const userIds = users?.map(user => user.id_usuario).filter(Boolean) || [];
      
      console.log('🏛️ IDs de instituciones:', institutionIds);
      console.log('👥 IDs de usuarios:', userIds);
      
      const { data: registrations, error: regError } = await supabase
        .from('registro')
        .select('id_institucion, id_usuario, correo_institucional')
        .in('id_institucion', institutionIds)
        .in('id_usuario', userIds);

      console.log('📝 Registros encontrados:', registrations);
      console.log('❌ Error de registros:', regError);

      // Combinar los datos
      const institutionsWithUserData = institutions.map(institution => {
        const user = users?.find(user => user.uuid === institution.admin_institucional);
        const registration = registrations?.find(reg => 
          reg.id_institucion === institution.id_institucion && reg.id_usuario === user?.id_usuario
        );

        console.log(`🔄 Procesando institución ${institution.id_institucion}:`);
        console.log(`   - Admin UUID: ${institution.admin_institucional}`);
        console.log(`   - Usuario encontrado:`, user);
        console.log(`   - Registro encontrado:`, registration);

        return {
          ...institution,
          usuario: user ? {
            nombre: user.nombre,
            apellido: user.apellido,
            email: registration?.correo_institucional || 'No disponible',
            celular: user.celular
          } : {
            nombre: 'Usuario no encontrado',
            apellido: '',
            email: 'No disponible',
            celular: null
          }
        };
      });

      console.log('📊 Instituciones pendientes obtenidas:', institutionsWithUserData?.length || 0);
      console.log('📋 Datos finales:', institutionsWithUserData);
      
      return {
        success: true,
        data: institutionsWithUserData || []
      };

    } catch (error: any) {
      console.error('Error obteniendo instituciones pendientes:', error);
      return {
        success: false,
        error: error.message || 'Error interno'
      };
    }
  }

  /**
   * Obtener historial de instituciones validadas/denegadas
   */
  static async getInstitutionHistory(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      console.log('📋 Obteniendo historial de instituciones...');

      // Primero obtener las instituciones sin el join
      const { data: institutions, error } = await supabase
        .from('institucion')
        .select(`
          id_institucion,
          nombre_oficial,
          direccion,
          validacion,
          admin_institucional,
          logo,
          colores
        `)
        .in('validacion', ['validado', 'denegado'])
        .order('id_institucion', { ascending: false });

      if (error) {
        console.error('Error obteniendo historial de instituciones:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Si no hay instituciones, retornar array vacío
      if (!institutions || institutions.length === 0) {
        console.log('📊 No hay instituciones en el historial');
        return {
          success: true,
          data: []
        };
      }

      // Obtener los UUIDs de los admins institucionales
      const adminUuids = institutions.map(inst => inst.admin_institucional);

      // Obtener los datos de los usuarios por UUID
      const { data: users, error: usersError } = await supabase
        .from('usuario')
        .select('uuid, nombre, apellido, celular, id_usuario')
        .in('uuid', adminUuids);

      if (usersError) {
        console.warn('Error obteniendo datos de usuarios:', usersError);
      }

      // Obtener los emails del registro institucional usando los id_usuario
      const institutionIds = institutions.map(inst => inst.id_institucion);
      const userIds = users?.map(user => user.id_usuario).filter(Boolean) || [];
      
      const { data: registrations } = await supabase
        .from('registro')
        .select('id_institucion, id_usuario, correo_institucional')
        .in('id_institucion', institutionIds)
        .in('id_usuario', userIds);

      // Combinar los datos
      const institutionsWithUserData = institutions.map(institution => {
        const user = users?.find(user => user.uuid === institution.admin_institucional);
        const registration = registrations?.find(reg => 
          reg.id_institucion === institution.id_institucion && reg.id_usuario === user?.id_usuario
        );

        return {
          ...institution,
          usuario: user ? {
            nombre: user.nombre,
            apellido: user.apellido,
            email: registration?.correo_institucional || 'No disponible',
            celular: user.celular
          } : {
            nombre: 'Usuario no encontrado',
            apellido: '',
            email: 'No disponible',
            celular: null
          }
        };
      });

      console.log('📊 Historial de instituciones obtenido:', institutionsWithUserData?.length || 0);
      return {
        success: true,
        data: institutionsWithUserData || []
      };

    } catch (error: any) {
      console.error('Error obteniendo historial de instituciones:', error);
      return {
        success: false,
        error: error.message || 'Error interno'
      };
    }
  }
} 