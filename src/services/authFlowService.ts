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
      console.log('❌ No user → /login');
      return {
        shouldRedirect: true,
        redirectTo: '/login'
      };
    }

    try {
      // Get user data to check validation status
      const userData = await UserService.getUserDataFromUsuarios(user.id);
      if (!userData) {
        console.log('❌ No user data found → /login');
        return {
          shouldRedirect: true,
          redirectTo: '/login'
        };
      }

      // Get session for API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('❌ No active session → /login');
        return {
          shouldRedirect: true,
          redirectTo: '/login'
        };
      }

      // Check driver validation status
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/is-conductor-validated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id_usuario: userData.id_usuario })
      });

      if (!response.ok) {
        console.log('❌ Error checking validation → /login');
        return {
          shouldRedirect: true,
          redirectTo: '/login'
        };
      }

      const data = await response.json();
      const validationStatus = data.validacion_conductor;

      // Handle different validation statuses
      switch (validationStatus) {
        case 'validado':
          console.log('✅ Driver validated → /driver/dashboard');
          return {
            shouldRedirect: true,
            redirectTo: '/driver/dashboard'
          };
        case 'pendiente':
          console.log('⏳ Driver validation pending → /pending-validation');
          return {
            shouldRedirect: true,
            redirectTo: '/pending-validation'
          };
        case 'denegado':
        case null:
          console.log('❌ Driver validation denied/null → /dashboard');
          return {
            shouldRedirect: true,
            redirectTo: '/dashboard'
          };
        default:
          console.log('❓ Unknown validation status → /dashboard');
          return {
            shouldRedirect: true,
            redirectTo: '/dashboard'
          };
      }
    } catch (error) {
      console.error('Error in determineUserRedirection:', error);
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
    if (!user) {
      return {
        shouldRedirect: true,
        redirectTo: '/login'
      };
    }

    // If the route is for drivers, check validation status
    if (allowedRoles?.includes('conductor')) {
      try {
        const userData = await UserService.getUserDataFromUsuarios(user.id);
        if (!userData) {
          return await this.determineUserRedirection(user);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          return await this.determineUserRedirection(user);
        }

        const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/is-conductor-validated', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ id_usuario: userData.id_usuario })
        });

        if (!response.ok) {
          return await this.determineUserRedirection(user);
        }

        const data = await response.json();
        if (data.validacion_conductor !== 'validado') {
          return await this.determineUserRedirection(user);
        }
      } catch (error) {
        console.error('Error checking driver validation:', error);
        return await this.determineUserRedirection(user);
      }
    }

    // For other roles, check if user has the required role
    if (!allowedRoles?.includes(user.role)) {
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