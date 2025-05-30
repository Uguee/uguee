import { supabase } from '@/integrations/supabase/client';

export interface PendingUser {
  id_usuario: number;
  uuid: string;
  nombre: string;
  apellido: string;
  celular: number;
  fecha_nacimiento: string;
  rol: string;
  institucion?: {
    id_institucion: number;
    nombre_oficial: string;
    direccion: string;
    logo: string;
    colores: string;
  };
}

export interface ValidationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class ValidationService {
  /**
   * Obtiene todos los usuarios con rol "validacion" junto con sus instituciones
   */
  static async getPendingUsers(): Promise<ValidationResult> {
    try {
      console.log('🔍 ValidationService: Obteniendo usuarios pendientes...');
      
      // Obtener usuarios con rol "validacion"
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuario')
        .select('*')
        .eq('rol', 'validacion');

      if (usuariosError) {
        console.error('❌ Error consultando usuarios:', usuariosError);
        return {
          success: false,
          error: `Error consultando usuarios: ${usuariosError.message}`
        };
      }

      if (!usuarios || usuarios.length === 0) {
        console.log('✅ No hay usuarios pendientes de validación');
        return {
          success: true,
          data: []
        };
      }

      console.log(`📋 Encontrados ${usuarios.length} usuarios pendientes`);

      // Para cada usuario, obtener su institución
      const usersWithInstitutions: PendingUser[] = [];
      
      for (const usuario of usuarios) {
        console.log(`🔍 Buscando institución para usuario ${usuario.nombre} ${usuario.apellido}`);
        
        const { data: institucion, error: institucionError } = await supabase
          .from('institucion')
          .select('*')
          .eq('admin_institucional', usuario.uuid)
          .maybeSingle();

        if (institucionError) {
          console.error('⚠️ Error obteniendo institución:', institucionError);
        }

        const userWithInstitution: PendingUser = {
          ...usuario,
          institucion: institucion || undefined
        };

        usersWithInstitutions.push(userWithInstitution);
        
        console.log(`✅ Usuario procesado: ${usuario.nombre}, institución: ${institucion?.nombre_oficial || 'Sin institución'}`);
      }

      return {
        success: true,
        data: usersWithInstitutions
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getPendingUsers:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Aprueba un usuario cambiando su rol a "admin_institucional"
   */
  static async approveUser(userUuid: string): Promise<ValidationResult> {
    try {
      console.log('✅ ValidationService: Aprobando usuario:', userUuid);

      const { error } = await supabase
        .from('usuario')
        .update({ rol: 'admin_institucional' })
        .eq('uuid', userUuid);

      if (error) {
        console.error('❌ Error aprobando usuario:', error);
        return {
          success: false,
          error: `Error aprobando usuario: ${error.message}`
        };
      }

      console.log('✅ Usuario aprobado exitosamente');
      return {
        success: true,
        data: { message: 'Usuario aprobado como administrador institucional' }
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en approveUser:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Rechaza un usuario cambiando su rol de vuelta a "usuario"
   */
  static async rejectUser(userUuid: string): Promise<ValidationResult> {
    try {
      console.log('❌ ValidationService: Rechazando usuario:', userUuid);

      const { error } = await supabase
        .from('usuario')
        .update({ rol: 'usuario' })
        .eq('uuid', userUuid);

      if (error) {
        console.error('❌ Error rechazando usuario:', error);
        return {
          success: false,
          error: `Error rechazando usuario: ${error.message}`
        };
      }

      console.log('✅ Usuario rechazado exitosamente');
      return {
        success: true,
        data: { message: 'Solicitud rechazada, usuario notificado' }
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en rejectUser:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }

  /**
   * Obtiene estadísticas de validaciones
   */
  static async getValidationStats(): Promise<ValidationResult> {
    try {
      console.log('📊 ValidationService: Obteniendo estadísticas...');

      // Contar usuarios por rol
      const { data: stats, error } = await supabase
        .from('usuario')
        .select('rol')
        .in('rol', ['validacion', 'admin_institucional', 'usuario']);

      if (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        return {
          success: false,
          error: `Error obteniendo estadísticas: ${error.message}`
        };
      }

      const roleCounts = stats.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        data: {
          pendingValidations: roleCounts['validacion'] || 0,
          approvedAdmins: roleCounts['admin_institucional'] || 0,
          regularUsers: roleCounts['usuario'] || 0,
          total: stats.length
        }
      };
    } catch (error: any) {
      console.error('❌ Error inesperado en getValidationStats:', error);
      return {
        success: false,
        error: `Error inesperado: ${error.message}`
      };
    }
  }
} 