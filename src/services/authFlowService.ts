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
        console.log('🏛️ Admin institucional → verificando estado de institución...');
        
        // Obtener el UUID desde la sesión de Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const userUuid = session?.user?.id;
        
        if (!userUuid) {
          console.log('❌ No se pudo obtener el UUID del usuario desde la sesión');
          return {
            shouldRedirect: true,
            redirectTo: '/login'
          };
        }
        
        console.log('🔍 Usando UUID para consulta:', userUuid);
        
        // Verificar el estado de validación de la institución usando el UUID
        try {
          const { data: institution, error } = await supabase
            .from('institucion')
            .select('validacion')
            .eq('admin_institucional', userUuid)
            .single();

          if (error || !institution) {
            console.log('❌ Error al obtener institución o institución no encontrada:', error);
            return {
              shouldRedirect: true,
              redirectTo: '/institution-register'
            };
          }

          console.log('✅ Institución encontrada con estado:', institution.validacion);

          // Si la institución está pendiente de validación, redirigir a página de espera
          if (institution.validacion === 'pendiente') {
            console.log('⏳ Institución pendiente → /institution/pending-validation');
            return {
              shouldRedirect: true,
              redirectTo: '/institution/pending-validation'
            };
          }

          // Si la institución fue denegada, también redirigir a página de espera para mostrar el estado
          if (institution.validacion === 'denegado') {
            console.log('❌ Institución denegada → /institution/pending-validation');
            return {
              shouldRedirect: true,
              redirectTo: '/institution/pending-validation'
            };
          }

          // Si la institución está validada, ir al dashboard institucional
          console.log('✅ Institución validada → /institution/dashboard');
          return {
            shouldRedirect: true,
            redirectTo: '/institution/dashboard'
          };
        } catch (error) {
          console.error('Error verificando estado de institución:', error);
          return {
            shouldRedirect: true,
            redirectTo: '/institution/pending-validation'
          };
        }

      case 'admin':
        console.log('👑 Admin → /admin/dashboard');
        return {
          shouldRedirect: true,
          redirectTo: '/admin/dashboard'
        };
      case 'usuario':
        console.log('👤 Evaluando usuario con ID:', user.id, 'Rol:', user.role);
        
        // Flujo normal para usuarios regulares (sin institución propia)
        const status = await this.getUserStatus(user.id.toString());
        
        console.log('📋 Estado del usuario:', status);
        
        if (!status.hasDocuments) {
          console.log('📄 Usuario sin documentos → /document-verification');
          return {
            shouldRedirect: true,
            redirectTo: '/document-verification'
          };
        }
        
        // Si el usuario viene del flujo de registro institucional, redirigir a institution-register
        if (window.location.pathname === '/document-verification' && 
            window.history.state?.usr?.isInstitutionFlow) {
          console.log('🏛️ Usuario en flujo institucional → /institution-register');
          return {
            shouldRedirect: true,
            redirectTo: '/institution-register'
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
    const status = await this.getUserStatus(user.id.toString());

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
  static async getUserStatus(userId: string | number): Promise<{
    hasDocuments: boolean;
    hasInstitution: boolean;
    isPending: boolean;
  }> {
    try {
      // Convert userId to string for database query
      const userIdStr = userId.toString();

      // Verificar documentos
      const { data: documents, error: docError } = await supabase
        .from('documento')
        .select('id_usuario')
        .eq('id_usuario', parseInt(userIdStr))
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
        .eq('id_usuario', parseInt(userIdStr))
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