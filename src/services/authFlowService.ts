import { UserService } from './userService';
import { UserRole } from '@/types';

export interface AuthFlowResult {
  shouldRedirect: boolean;
  redirectTo?: string;
  message?: string;
}

export class AuthFlowService {
  /**
   * Determina la redirección apropiada para un usuario según su rol y estado
   */
  static async determineUserRedirection(user: any): Promise<AuthFlowResult> {
    if (!user) {
      return {
        shouldRedirect: true,
        redirectTo: '/login'
      };
    }

    console.log('🔍 Determinando redirección para usuario:', user.role, 'ID:', user.id);

    // Lógica especial para usuarios con rol "usuario"
    if (user.role === 'usuario') {
      try {
        const status = await UserService.getUserRegistrationStatus(user.id);
        console.log('📋 Estado de registro obtenido:', status);

        if (!status.hasDocuments) {
          console.log('📄 Usuario sin documentos verificados → /verify-documents');
          return {
            shouldRedirect: true,
            redirectTo: '/verify-documents'
          };
        } else if (!status.hasInstitution) {
          console.log('🏛️ Usuario sin institución → /select-institution');
          return {
            shouldRedirect: true,
            redirectTo: '/select-institution'
          };
        } else {
          // Usuario completó ambos pasos, redirigir según estado de validación
          const { institutionStatus } = status;
          
          console.log('📋 Estado de institución:', institutionStatus);
          
          if (institutionStatus === 'pendiente') {
            console.log('⏳ Solicitud pendiente → /pending-validation');
            return {
              shouldRedirect: true,
              redirectTo: '/pending-validation'
            };
          } else if (institutionStatus === 'validado') {
            console.log('✅ Usuario validado → /dashboard');
            return {
              shouldRedirect: true,
              redirectTo: '/dashboard'
            };
          } else if (institutionStatus === 'denegado') {
            console.log('❌ Solicitud denegada → /pending-validation');
            return {
              shouldRedirect: true,
              redirectTo: '/pending-validation'
            };
          } else {
            // Estado desconocido o null, redirigir a pending validation por seguridad
            console.log('❓ Estado de institución desconocido:', institutionStatus, '→ /pending-validation');
            return {
              shouldRedirect: true,
              redirectTo: '/pending-validation'
            };
          }
        }
      } catch (error) {
        console.error('❌ Error obteniendo estado de registro:', error);
        // En caso de error, redirigir a verificación de documentos como fallback
        return {
          shouldRedirect: true,
          redirectTo: '/verify-documents'
        };
      }
    }
    
    // Para usuarios con roles específicos, verificar si aún están en validación
    if (['externo', 'estudiante', 'profesor', 'administrativo'].includes(user.role)) {
      try {
        const status = await UserService.getUserRegistrationStatus(user.id);
        console.log('📋 Verificando estado de usuario con rol específico:', status);
        
        if (status.hasInstitution) {
          const { institutionStatus } = status;
          
          if (institutionStatus === 'pendiente') {
            console.log('⏳ Usuario con rol específico pero solicitud pendiente → /pending-validation');
            return {
              shouldRedirect: true,
              redirectTo: '/pending-validation'
            };
          } else if (institutionStatus === 'denegado') {
            console.log('❌ Usuario con rol específico pero solicitud denegada → /pending-validation');
            return {
              shouldRedirect: true,
              redirectTo: '/pending-validation'
            };
          }
        }
        
        // Si está validado o no tiene registro institucional, permitir acceso al dashboard
        console.log('✅ Usuario con rol específico validado → /dashboard');
        return {
          shouldRedirect: true,
          redirectTo: '/dashboard'
        };
      } catch (error) {
        console.error('❌ Error verificando estado de usuario con rol específico:', error);
        // En caso de error, permitir acceso al dashboard
        return {
          shouldRedirect: true,
          redirectTo: '/dashboard'
        };
      }
    }
    
    // Redirecciones para otros roles
    switch (user.role) {
      case 'conductor':
        try {
          const status = await UserService.getUserRegistrationStatus(user.id);
          if (status?.validacion_conductor === 'validado') {
            console.log('🚗 Conductor validado → /driver/dashboard');
            return {
              shouldRedirect: true,
              redirectTo: '/driver/dashboard'
            };
          } else {
            console.log('❌ Conductor no validado → /driver-not-allowed');
            return {
              shouldRedirect: true,
              redirectTo: '/driver-not-allowed'
            };
          }
        } catch (error) {
          console.error('❌ Error verificando estado de conductor:', error);
          return {
            shouldRedirect: true,
            redirectTo: '/driver-not-allowed'
          };
        }
      case 'admin_institucional':
        console.log('🏛️ Admin institucional → /institution/dashboard');
        return {
          shouldRedirect: true,
          redirectTo: '/institution/dashboard'
        };
      case 'admin':
        console.log('👑 Admin → /admin/dashboard');
        return {
          shouldRedirect: true,
          redirectTo: '/admin/dashboard'
        };
      case 'validacion':
        console.log('⏳ En validación → /pending-validation');
        return {
          shouldRedirect: true,
          redirectTo: '/pending-validation'
        };
      default:
        console.log('❓ Rol desconocido:', user.role, '→ /dashboard por defecto');
        return {
          shouldRedirect: true,
          redirectTo: '/dashboard'
        };
    }
  }

  /**
   * Verifica si un usuario tiene acceso a una ruta específica
   */
  static async checkRouteAccess(user: any, allowedRoles?: UserRole[]): Promise<AuthFlowResult> {
    // Si la ruta es para conductores, verificar validacion_conductor
    if (allowedRoles?.includes('conductor')) {
      try {
        const status = await UserService.getUserRegistrationStatus(user.id);
        if (status?.validacion_conductor === 'validado') {
          return { shouldRedirect: false };
        }
        // Si no está validado como conductor, redirigir
        return await this.determineUserRedirection(user);
      } catch (error) {
        console.error('Error verificando estado de conductor:', error);
        return await this.determineUserRedirection(user);
      }
    }

    // Para otros roles, verificación normal
    if (!user || !allowedRoles?.includes(user.role)) {
      return await this.determineUserRedirection(user);
    }

    return { shouldRedirect: false };
  }

  /**
   * Obtiene el estado de registro para mostrar en componentes
   */
  static async getUserStatus(userId: string): Promise<{
    hasDocuments: boolean;
    hasInstitution: boolean;
    institutionStatus?: string;
    institutionalRole?: string;
    isDenied: boolean;
    isPending: boolean;
    isValidated: boolean;
    validacion_conductor?: string;
  }> {
    try {
      const status = await UserService.getUserRegistrationStatus(userId);
      
      return {
        ...status,
        isDenied: status.institutionStatus === 'denegado',
        isPending: status.institutionStatus === 'pendiente',
        isValidated: status.institutionStatus === 'validado'
      };
    } catch (error) {
      console.error('❌ Error obteniendo estado de usuario:', error);
      return {
        hasDocuments: false,
        hasInstitution: false,
        isDenied: false,
        isPending: false,
        isValidated: false
      };
    }
  }
} 