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
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
      ]);
      
      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        throw new Error('No active session');
      }
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    return headers;
  }

  /**
   * Mapea los roles de la base de datos a los tipos de la aplicación
   */
  private static mapRole(role: string): UserRole {
    console.log('🎯 Mapeando rol:', role);
    
    switch (role.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'pasajero':
      case 'usuario':
      case 'student':
      case 'estudiante':
        return 'usuario';
      case 'conductor':
        return 'conductor';
      case 'admin_institucional':
      case 'admin-institucion':
        return 'admin_institucional';
      case 'validacion':
        return 'validacion';
      default:
        console.warn('⚠️ Rol desconocido:', role, 'usando "usuario" por defecto');
        return 'usuario';
    }
  }

  /**
   * Mapea los datos del endpoint a nuestro tipo User
   */
  private static mapUserData(userData: any, uuid: string): User {
    return {
      id: userData.uuid || userData.id || uuid,
      firstName: userData.nombre || userData.firstName || '',
      lastName: userData.apellido || userData.lastName || '',
      email: userData.email || userData.correo || '',
      phoneNumber: userData.celular || userData.phoneNumber || '',
      role: this.mapRole(userData.rol || userData.role),
      createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
      dateOfBirth: userData.fecha_nacimiento || userData.dateOfBirth || '',
      address: userData.address || userData.direccion || '',
      institutionId: userData.institutionId || userData.institution_id || '',
      institutionalEmail: userData.institutionalEmail || userData.correo_institucional || '',
      institutionalCode: userData.institutionalCode || userData.codigo_institucional || '',
      avatarUrl: userData.avatarUrl || userData.foto || '',
    };
  }

  /**
   * Obtiene los datos del usuario por UUID desde el endpoint
   */
  static async getUserByUuid(uuid: string): Promise<User | null> {
    try {
      console.log('🔍 UserService: Consultando usuario por UUID:', uuid);
      
      const headers = await this.getAuthHeaders();
      const url = `${SUPABASE_FUNCTIONS.GET_USER_DATA}?uuid=${uuid}`;

      console.log('📡 Llamando endpoint:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        return null;
      }

      const result: UserDataResponse = await response.json();
      console.log('📥 Respuesta del endpoint:', result);

      if (!result.success || !result.data) {
        console.error('❌ Endpoint no devolvió datos válidos:', result);
        return null;
      }

      console.log('✅ Datos recibidos del endpoint:', {
        id_usuario: result.data.id_usuario,
        nombre: result.data.nombre,
        rol: result.data.rol,
        uuid: result.data.uuid
      });

      const mappedUser = this.mapUserData(result.data, uuid);
      console.log('🎯 Usuario final mapeado:', {
        id: mappedUser.id,
        firstName: mappedUser.firstName,
        role: mappedUser.role
      });

      return mappedUser;
    } catch (error) {
      console.error('❌ Error en getUserByUuid:', error);
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
} 