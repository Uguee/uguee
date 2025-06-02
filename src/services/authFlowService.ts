import { UserService } from './userService';
import { UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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

    // Redirecciones para roles específicos
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
      case 'usuario':
        // Verificar documentos y registro para usuarios normales
        const status = await this.getUserStatus(user.id);
        
        if (!status.hasDocuments) {
          console.log('📄 Usuario sin documentos → /document-verification');
          return {
            shouldRedirect: true,
            redirectTo: '/document-verification'
          };
        }
        
        if (!status.hasInstitution) {
          console.log('🏫 Usuario sin institución → /select-institution');
          return {
            shouldRedirect: true,
            redirectTo: '/select-institution'
          };
        }
        
        if (status.isPending) {
          console.log('⏳ Usuario pendiente → /pending-validation');
          return {
            shouldRedirect: true,
            redirectTo: '/pending-validation'
          };
        }
        
        console.log('✅ Usuario validado → /dashboard');
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

    // Si hay roles específicos requeridos y el usuario no tiene uno de esos roles
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return {
        shouldRedirect: true,
        redirectTo: '/unauthorized'
      };
    }

    // Skip document and institution checks for admin roles
    if (user.role === 'admin' || user.role === 'admin_institucional') {
      return { shouldRedirect: false };
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

    // Si todo está validado, permitir acceso
    return { shouldRedirect: false };
  }

  /**
   * Obtiene el estado actual del usuario
   */
  private static async getUserStatus(userId: number): Promise<{
    hasDocuments: boolean;
    hasInstitution: boolean;
    isPending: boolean;
  }> {
    try {
      // Verificar documentos
      const { data: documents, error: docError } = await supabase
        .from('documento')
        .select('id_usuario')
        .eq('id_usuario', userId)
        .limit(1);

      if (docError) {
        console.error('Error checking documents:', docError);
        return { hasDocuments: false, hasInstitution: false, isPending: false };
      }

      const hasDocuments = documents && documents.length > 0;

      // Verificar registro en institución
      const { data: registration, error: regError } = await supabase
        .from('registro')
        .select('validacion')
        .eq('id_usuario', userId)
        .limit(1);

      if (regError) {
        console.error('Error checking registration:', regError);
        return { hasDocuments, hasInstitution: false, isPending: false };
      }

      const hasInstitution = registration && registration.length > 0;
      const isPending = hasInstitution && registration[0].validacion === 'pendiente';

      return {
        hasDocuments,
        hasInstitution,
        isPending
      };
    } catch (error) {
      console.error('Error in getUserStatus:', error);
      return { hasDocuments: false, hasInstitution: false, isPending: false };
    }
  }
} 