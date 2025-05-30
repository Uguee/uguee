import { User, UserRole } from '../types';
import { SUPABASE_FUNCTIONS } from '../config/endpoints';
import { supabase } from '@/integrations/supabase/client';

export interface UserDataResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class UserService {
  /**
   * Obtiene los headers de autorización necesarios
   */
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const { data: { session } } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 1000)
        )
      ]);
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        throw new Error('No active session');
      }
    } catch (error) {
      throw new Error('Authentication failed');
    }

    return headers;
  }

  /**
   * Mapea los roles de la base de datos a los tipos de la aplicación
   */
  private static mapRole(role: string): UserRole {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'pasajero':
      case 'student':
        return 'pasajero';
      case 'conductor':
      case 'driver':
        return 'conductor';
      case 'admin_institucional':
      case 'admin-institucion':
        return 'admin_institucional';
      default:
        return 'pasajero';
    }
  }

  /**
   * Mapea los datos del endpoint a nuestro tipo User
   */
  private static mapUserData(userData: any, uuid: string): User {
    console.log('🔍 UserService mapUserData - Raw data:', userData);
    
    // Determinar el rol basándose en validacion_conductor
    let role: UserRole;
    
    console.log('🔍 validacion_conductor value:', userData.validacion_conductor);
    
    // Si tiene validacion_conductor: 'validado', entonces es conductor
    if (userData.validacion_conductor === 'validado') {
      console.log('✅ Usuario es conductor (validado)');
      role = 'conductor';
    } else {
      console.log('⚠️ Usuario NO es conductor, usando rol base:', userData.rol || userData.role);
      // Si no está validado como conductor, usar el rol existente o por defecto 'pasajero'
      role = this.mapRole(userData.rol || userData.role || 'pasajero');
    }
    
    console.log('📝 Final role assigned:', role);

    return {
      id: userData.uuid || userData.id || uuid,
      firstName: userData.nombre || userData.firstName || '',
      lastName: userData.apellido || userData.lastName || '',
      email: userData.email || userData.correo || '',
      phoneNumber: userData.celular || userData.phoneNumber || '',
      role: role,
      createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
      dateOfBirth: userData.fecha_nacimiento || userData.dateOfBirth || '',
      address: userData.address || userData.direccion || '',
      institutionId: userData.institutionId || userData.institution_id || '',
      institutionalEmail: userData.institutionalEmail || userData.correo_institucional || '',
      institutionalCode: userData.institutionalCode || userData.codigo_institucional || '',
      avatarUrl: userData.avatarUrl || userData.foto || '',
      id_usuario: userData.id_usuario,
    };
  }

  /**
   * Obtiene los datos del usuario por UUID
   */
  static async getUserByUuid(uuid: string): Promise<User | null> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${SUPABASE_FUNCTIONS.GET_USER_DATA}?uuid=${uuid}`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return null;
      }

      const result: UserDataResponse = await response.json();

      if (!result.success || !result.data) {
        return null;
      }

      // Obtener validacion_conductor usando la nueva edge function
      const userId = result.data.id_usuario;
      if (userId) {
        const validacionConductor = await this.getValidacionConductor(userId);
        result.data.validacion_conductor = validacionConductor;
      }

      return this.mapUserData(result.data, uuid);
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene validacion_conductor usando la edge function del compañero
   */
  private static async getValidacionConductor(id_usuario: number): Promise<string | null> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/is-conductor-validated', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id_usuario })
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.validacion_conductor || null;
    } catch (error) {
      console.warn('Error consultando validacion_conductor:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los usuarios (para uso administrativo)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(SUPABASE_FUNCTIONS.GET_USER_DATA, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return [];
      }

      const result: UserDataResponse = await response.json();

      if (!result.success || !result.data) {
        return [];
      }

      return result.data.map((userData: any) => 
        this.mapUserData(userData, userData.uuid)
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtiene los datos del usuario desde la tabla usuarios
   */
  static async getUserDataFromUsuarios(uuid: string): Promise<any | null> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${SUPABASE_FUNCTIONS.GET_USER_DATA_POST}`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ uuid })
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching user data from usuarios:', error);
      return null;
    }
  }
} 