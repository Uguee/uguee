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
  private static async getAuthHeaders(accessToken?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      // Si se proporciona un token directamente, usarlo
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('✅ Usando token proporcionado directamente');
        return headers;
      }

      // Solo hacer getSession si no se proporciona token
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 15000)
        )
      ]);
      
      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('✅ Headers de autorización obtenidos correctamente');
      } else {
        throw new Error('No active session');
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo headers:', error.message);
      throw new Error(`Authentication failed: ${error.message}`);
    }

    return headers;
  }

  /**
   * Mapea los roles de la base de datos a los tipos de la aplicación
   */
  private static mapRole(role: string): UserRole {
    console.log('🎯 Mapeando rol:', role);
    
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'admin_institucional':
      case 'admin-institucion':
        return 'admin_institucional';
      case 'pendiente':
        return 'pendiente';
      case 'verificado':
        return 'verificado';
      case 'estudiante':
      case 'profesor':
      case 'administrativo':
      case 'externo':
      case 'validacion':
      case 'conductor':
      case 'usuario':
      case 'pasajero':
        return 'usuario';
      default:
        console.warn('⚠️ Rol desconocido:', role, 'usando null por defecto');
        return null;
    }
  }

  /**
   * Mapea los datos del endpoint a nuestro tipo User
   */
  static async mapUserData(data: any): Promise<User> {
    console.log('🔍 validacion_conductor value:', data.validacion_conductor);
    
    // Determinar el rol base
    let baseRole: UserRole = null;
    
    // Si es conductor, asignar rol de conductor
    if (data.validacion_conductor) {
      console.log('✅ Usuario es conductor');
      baseRole = 'usuario';
    } else {
      console.log('⚠️ Usuario NO es conductor, usando rol base:', data.rol);
      // Si no es conductor, usar el rol de la base de datos o null
      baseRole = data.rol || null;
    }
    
    // Mapear el rol final
    const finalRole = this.mapRole(baseRole);
    console.log('🎯 Mapeando rol:', finalRole);
    
    // Crear objeto de usuario con el rol mapeado
    const user: User = {
      id: data.id_usuario?.toString() || '',
      firstName: data.nombre || '',
      lastName: data.apellido || '',
      email: data.email || '',
      phoneNumber: data.celular?.toString() || '',
      role: finalRole,
      dateOfBirth: data.fecha_nacimiento || '',
      createdAt: data.created_at || new Date().toISOString(),
      phone: data.celular?.toString() || '',
      birthdate: data.fecha_nacimiento || '',
    };
    
    console.log('📝 Final role assigned:', user.role);
    return user;
  }

  /**
   * Obtiene los datos del usuario por UUID
   */
  static async getUserByUuid(uuid: string, accessToken?: string): Promise<User | null> {
    try {
      console.log('🔍 UserService: Consultando usuario por UUID:', uuid);
      
      const headers = await this.getAuthHeaders(accessToken);
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

      const mappedUser = await this.mapUserData(result.data);
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
        this.mapUserData(userData)
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtiene los datos del usuario desde la tabla usuarios
   */
  static async getUserDataFromUsuarios(userId: string): Promise<any | null> {
    try {
      // First get the UUID from the user ID
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('uuid')
        .eq('id_usuario', parseInt(userId))
        .single();

      if (userError || !userData?.uuid) {
        console.error('❌ getUserDataFromUsuarios: Error getting UUID:', userError);
        return null;
      }

      console.log('✅ UUID encontrado:', userData.uuid);

      // Now use the UUID to get the full user data
      const headers = await this.getAuthHeaders();
      const url = `${SUPABASE_FUNCTIONS.GET_USER_DATA}?uuid=${userData.uuid}`;
      console.log('📡 getUserDataFromUsuarios: Llamando endpoint:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        console.error('❌ getUserDataFromUsuarios: Error fetching user data:', response.status);
        return null;
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        console.error('❌ getUserDataFromUsuarios: Invalid response format:', result);
        return null;
      }

      console.log('✅ getUserDataFromUsuarios: Datos recibidos:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ getUserDataFromUsuarios: Error:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario ya completó la verificación de documentos
   */
  static async hasCompletedDocumentVerification(userId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('documento')
        .select('numero')
        .eq('id_usuario', userId)
        .limit(1);

      if (error) {
        console.error('Error checking document verification:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in hasCompletedDocumentVerification:', error);
      return false;
    }
  }

  /**
   * Verifica si el usuario ya se registró en una institución
   */
  static async hasInstitutionRegistration(userId: number): Promise<{
    hasRegistration: boolean;
    status?: string;
    institutionalRole?: string;
    validacion_conductor?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('registro')
        .select('validacion, rol_institucional, validacion_conductor')
        .eq('id_usuario', userId)
        .limit(1);

      if (error) {
        console.error('Error checking institution registration:', error);
        return { hasRegistration: false };
      }

      if (data && data.length > 0) {
        return {
          hasRegistration: true,
          status: data[0].validacion,
          institutionalRole: data[0].rol_institucional,
          validacion_conductor: data[0].validacion_conductor
        };
      }

      return { hasRegistration: false };
    } catch (error) {
      console.error('Error in hasInstitutionRegistration:', error);
      return { hasRegistration: false };
    }
  }

  /**
   * Obtiene el estado completo del proceso de registro del usuario
   */
  static async getUserRegistrationStatus(uuid: string): Promise<{
    hasDocuments: boolean;
    hasInstitution: boolean;
    institutionStatus?: string;
    institutionalRole?: string;
    userId?: number;
    validacion_conductor?: string;
  }> {
    try {
      // Primero obtener el id_usuario
      const userData = await this.getUserDataFromUsuarios(uuid);
      
      if (!userData || !userData.id_usuario) {
        return {
          hasDocuments: false,
          hasInstitution: false
        };
      }

      const userId = userData.id_usuario;

      // Verificar documentos e institución en paralelo
      const [hasDocuments, institutionInfo] = await Promise.all([
        this.hasCompletedDocumentVerification(userId),
        this.hasInstitutionRegistration(userId)
      ]);

      return {
        hasDocuments,
        hasInstitution: institutionInfo.hasRegistration,
        institutionStatus: institutionInfo.status,
        institutionalRole: institutionInfo.institutionalRole,
        userId,
        validacion_conductor: institutionInfo.validacion_conductor
      };
    } catch (error) {
      console.error('Error getting user registration status:', error);
      return {
        hasDocuments: false,
        hasInstitution: false
      };
    }
  }

  static async isConductor(userId: string): Promise<boolean> {
    try {
      const status = await this.getUserRegistrationStatus(userId);
      return status?.validacion_conductor === 'validado';
    } catch (error) {
      console.error('Error verificando estado de conductor:', error);
      return false;
    }
  }
} 