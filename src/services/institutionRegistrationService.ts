import { supabase } from '@/integrations/supabase/client';
import { UserService } from './userService';

export interface Institution {
  id_institucion: number;
  nombre_oficial: string;
  direccion: string;
  colores: string;
  logo?: string;
}

export interface RegistrationFormData {
  institutionId: number;
  role: string;
  institutionalCode: string;
}

export interface RegistrationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class InstitutionRegistrationService {
  /**
   * Obtiene todas las instituciones disponibles
   */
  static async loadInstitutions(): Promise<Institution[]> {
    try {
      const { data, error } = await supabase
        .from('institucion')
        .select('id_institucion, nombre_oficial, direccion, colores, logo')
        .order('nombre_oficial', { ascending: true });

      if (error) {
        console.error('Error loading institutions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in loadInstitutions:', error);
      return [];
    }
  }

  /**
   * Valida los datos del formulario de registro
   */
  static validateRegistrationForm(formData: RegistrationFormData): { 
    isValid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];

    if (!formData.institutionId) {
      errors.push('Debes seleccionar una institución');
    }

    if (!formData.role) {
      errors.push('Debes seleccionar un rol');
    }

    if (!formData.institutionalCode?.trim()) {
      errors.push('Debes ingresar tu código institucional');
    }

    // Validar formato del código según el rol
    if (formData.institutionalCode) {
      const code = formData.institutionalCode.trim();
      switch (formData.role) {
        case 'estudiante':
          if (!/^(EST|est|Est|ESTUDIANTE|estudiante)\d+/i.test(code) && !/^\d+$/.test(code)) {
            errors.push('El código de estudiante debe empezar con "EST" seguido de números o ser solo números');
          }
          break;
        case 'profesor':
          if (!/^(PROF|prof|Prof|PROFESOR|profesor)\d+/i.test(code) && !/^\d+$/.test(code)) {
            errors.push('El código de profesor debe empezar con "PROF" seguido de números o ser solo números');
          }
          break;
        case 'administrativo':
          if (!/^(ADM|adm|Adm|ADMIN|admin|Admin)\d+/i.test(code) && !/^\d+$/.test(code)) {
            errors.push('El código administrativo debe empezar con "ADM" seguido de números o ser solo números');
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Actualiza el rol del usuario en la tabla usuario
   */
  static async updateUserRole(userId: number, newRole: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Actualizando rol del usuario:', userId, 'a:', newRole);

      const { error } = await supabase
        .from('usuario')
        .update({ rol: newRole })
        .eq('id_usuario', userId);

      if (error) {
        console.error('❌ Error actualizando rol:', error);
        return {
          success: false,
          error: `Error actualizando rol: ${error.message}`
        };
      }

      console.log('✅ Rol actualizado exitosamente');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error en updateUserRole:', error);
      return {
        success: false,
        error: error.message || 'Error inesperado actualizando rol'
      };
    }
  }

  /**
   * Envía la solicitud de registro a una institución
   */
  static async submitRegistration(
    formData: RegistrationFormData, 
    userUuid: string,
    userEmail: string,
    userAddress?: string
  ): Promise<RegistrationResult> {
    try {
      console.log('📝 Iniciando registro en institución...');

      // Validar formulario
      const validation = this.validateRegistrationForm(formData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Obtener datos del usuario
      const userData = await UserService.getUserDataFromUsuarios(userUuid);
      if (!userData || !userData.id_usuario) {
        return {
          success: false,
          error: 'No se pudo obtener información del usuario'
        };
      }

      console.log('👤 Usuario encontrado:', userData.id_usuario);

      // Convertir código institucional a número si es posible, sino usar un valor por defecto
      let codigoNumerico: number;
      const codigoOriginal = formData.institutionalCode.trim();
      
      // Extraer números del código
      const numeros = codigoOriginal.match(/\d+/);
      if (numeros && numeros[0]) {
        codigoNumerico = parseInt(numeros[0]);
      } else {
        // Si no hay números, usar timestamp como fallback
        codigoNumerico = Date.now() % 1000000; // Limitar a 6 dígitos
      }

      // Preparar datos para envío
      const registrationData = {
        id_usuario: userData.id_usuario,
        id_institucion: formData.institutionId,
        correo_institucional: userEmail,
        codigo_institucional: codigoNumerico,
        rol_institucional: formData.role,
        validacion: 'pendiente',
        direccion_de_residencia: userAddress || userData.direccion || 'No especificada'
      };

      console.log('📋 Datos de registro preparados:', registrationData);

      // Insertar en la tabla registro
      const { data, error } = await supabase
        .from('registro')
        .insert(registrationData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error al insertar registro:', error);
        
        if (error.code === '23505') {
          return {
            success: false,
            error: 'Ya tienes una solicitud activa en esta institución'
          };
        }
        
        return {
          success: false,
          error: `Error al enviar solicitud: ${error.message}`
        };
      }

      console.log('✅ Registro exitoso:', data);

      // Actualizar el rol del usuario en la tabla usuario
      const roleUpdateResult = await this.updateUserRole(userData.id_usuario, formData.role);
      
      if (!roleUpdateResult.success) {
        console.warn('⚠️ No se pudo actualizar el rol del usuario:', roleUpdateResult.error);
        // No fallamos el registro por esto, solo advertimos
      }

      return {
        success: true,
        data: {
          ...data,
          roleUpdated: roleUpdateResult.success
        }
      };

    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      return {
        success: false,
        error: error.message || 'Error inesperado al enviar solicitud'
      };
    }
  }

  /**
   * Obtiene las opciones de roles disponibles con sus descripciones
   */
  static getRoleOptions(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'estudiante',
        label: '🎓 Estudiante',
        description: 'Estudiante activo de la institución'
      },
      {
        value: 'profesor',
        label: '👨‍🏫 Profesor',
        description: 'Docente o instructor de la institución'
      },
      {
        value: 'administrativo',
        label: '💼 Administrativo',
        description: 'Personal administrativo de la institución'
      },
      {
        value: 'externo',
        label: '🌐 Visitante/Externo',
        description: 'Visitante o persona externa autorizada'
      }
    ];
  }

  /**
   * Genera un placeholder para el código según el rol seleccionado
   */
  static getCodePlaceholder(role: string): string {
    switch (role) {
      case 'estudiante':
        return 'ej: EST2024001, 123456';
      case 'profesor':
        return 'ej: PROF001, 789012';
      case 'administrativo':
        return 'ej: ADM123, 345678';
      case 'externo':
        return 'ej: EXT001, 901234';
      default:
        return 'Ingresa tu código institucional';
    }
  }
} 