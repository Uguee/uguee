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

    // Si el usuario tiene rol null, redirigir a document-verification
    if (user.role === null) {
      console.log('⚠️ Usuario sin rol → /document-verification');
      return {
        shouldRedirect: true,
        redirectTo: '/document-verification'
      };
    }
    
    // Redirecciones para otros roles
    switch (user.role) {
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
      case 'pendiente':
        console.log('⏳ Usuario pendiente → /pending-validation');
        return {
          shouldRedirect: true,
          redirectTo: '/pending-validation'
        };
      case 'verificado':
        console.log('✅ Usuario verificado → /select-institution');
        return {
          shouldRedirect: true,
          redirectTo: '/select-institution'
        };
      case 'usuario':
        console.log('👤 Usuario → /dashboard');
        return {
          shouldRedirect: true,
          redirectTo: '/dashboard'
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
    // Si no hay usuario, redirigir a login
    if (!user) {
      return {
        shouldRedirect: true,
        redirectTo: '/login'
      };
    }

    // Obtener el estado de registro del usuario
    const status = await this.getUserStatus(user.id);

    // Si no tiene documentos, redirigir a document-verification
    if (!status.hasDocuments) {
      if (window.location.pathname === '/document-verification') {
        return { shouldRedirect: false };
      }
      return {
        shouldRedirect: true,
        redirectTo: '/document-verification'
      };
    }

    // Si tiene documentos pero no tiene institución, redirigir a institution-register
    if (!status.hasInstitution) {
      if (window.location.pathname === '/select-institution') {
        return { shouldRedirect: false };
      }
      return {
        shouldRedirect: true,
        redirectTo: '/select-institution'
      };
    }

    // Si tiene institución pero está pendiente, redirigir a pending-validation
    if (status.isPending) {
      if (window.location.pathname === '/pending-validation') {
        return { shouldRedirect: false };
      }
      return {
        shouldRedirect: true,
        redirectTo: '/pending-validation'
      };
    }

    // Si tiene institución pero fue denegado, redirigir a institution-register
    if (status.isDenied) {
      if (window.location.pathname === '/select-institution') {
        return { shouldRedirect: false };
      }
      return {
        shouldRedirect: true,
        redirectTo: '/select-institution'
      };
    }

    // Si todo está validado, permitir acceso
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