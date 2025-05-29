// import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'pasajero' | 'conductor' | 'admin_institucional' | 'admin';
  createdAt: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    session: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
  };
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
  dateOfBirth?: string;
  id?: string; // Cédula del usuario
}

// Configuración de endpoints desde variables de entorno
const API_BASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/v1/token?grant_type=password`,
  REGISTER: `${API_BASE_URL}/auth/v1/signup`,
  REFRESH: `${API_BASE_URL}/auth/v1/token?grant_type=refresh_token`,
  USER_DATA: `${API_BASE_URL}/functions/v1/get-user-data`,
  LOGOUT: `${API_BASE_URL}/auth/v1/logout`,
};

// Variables en memoria (se pierden al cerrar la app)
let currentUser: User | null = null;
let currentToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiresAt: number | null = null;

export class AuthService {
  // API key desde variables de entorno
  private static get apiKey(): string {
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) {
      throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY no está configurada en el archivo .env');
    }
    return key;
  }

  /**
   * Headers base para las peticiones
   */
  private static getBaseHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
    };
  }

  /**
   * Headers con autorización
   */
  private static getAuthHeaders(): Record<string, string> {
    return {
      ...this.getBaseHeaders(),
      'Authorization': `Bearer ${currentToken}`,
    };
  }

  /**
   * Guarda los datos de sesión en memoria
   */
  private static saveSession(sessionData: any, userData: User): void {
    currentUser = userData;
    currentToken = sessionData.access_token;
    refreshToken = sessionData.refresh_token;
    tokenExpiresAt = sessionData.expires_at;
  }

  /**
   * Limpia los datos de sesión
   */
  private static clearSession(): void {
    currentUser = null;
    currentToken = null;
    refreshToken = null;
    tokenExpiresAt = null;
  }

  /**
   * Obtiene los datos del usuario desde el endpoint
   */
  private static async fetchUserData(userId: string): Promise<User | null> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${ENDPOINTS.USER_DATA}?uuid=${userId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) return null;

      const result = await response.json();
      if (!result.success || !result.data) return null;

      // Mapear datos del endpoint a nuestro tipo User
      const userData = result.data;
      return {
        id: userData.uuid || userData.id || userId,
        firstName: userData.nombre || userData.firstName || '',
        lastName: userData.apellido || userData.lastName || '',
        email: userData.email || userData.correo || '',
        phoneNumber: userData.celular || userData.phoneNumber || '',
        role: this.mapRole(userData.rol || userData.role || 'pasajero'),
        createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
        dateOfBirth: userData.fecha_nacimiento || userData.dateOfBirth || '',
      };
    } catch (error) {
      console.warn('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Mapea roles de la base de datos
   */
  private static mapRole(role: string): User['role'] {
    switch (role.toLowerCase()) {
      case 'admin': return 'admin';
      case 'conductor': return 'conductor';
      case 'admin_institucional':
      case 'admin-institucion': return 'admin_institucional';
      default: return 'pasajero';
    }
  }

  /**
   * Verifica si el token ha expirado
   */
  private static isTokenExpired(): boolean {
    if (!tokenExpiresAt) return true;
    return Date.now() / 1000 > tokenExpiresAt;
  }

  /**
   * Login del usuario
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: this.getBaseHeaders(),
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Limpiar cualquier sesión previa cuando login falla
        this.clearSession();
        return {
          success: false,
          error: data.error_description || data.msg || 'Error de autenticación',
        };
      }

      // Obtener datos completos del usuario usando la misma lógica que el registro
      const appUser = await this.fetchUserDataForRegistration(data.user, data.access_token);

      this.saveSession(data, appUser);

      return {
        success: true,
        data: {
          user: appUser,
          session: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
          },
        },
      };
    } catch (error: any) {
      // Limpiar cualquier sesión previa cuando hay error de conexión
      this.clearSession();
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Registro de usuario
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: this.getBaseHeaders(),
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            role: userData.role || 'pasajero',
            dateOfBirth: userData.dateOfBirth,
            id: userData.id, // Agregar cédula a metadata
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_description || data.msg || 'Error en el registro',
        };
      }

      // La respuesta puede tener diferentes estructuras dependiendo de si se requiere confirmación
      const userObj = data.user || data;
      
      if (!userObj || !userObj.id) {
        return {
          success: false,
          error: 'No se pudo crear el usuario en Supabase Auth',
        };
      }

      // Sincronizar usuario con la base de datos usando sync-user
      const syncSuccess = await this.syncUserToDatabase(userData, userObj.id, data.session?.access_token);

      // Intentar obtener datos del usuario desde el endpoint
      const appUser = await this.fetchUserDataForRegistration(userObj, data.session?.access_token);

      // Si hay sesión, guardarla (pero puede no haberla si requiere confirmación)
      if (data.session) {
        this.saveSession(data.session, appUser);
        
        return {
          success: true,
          data: {
            user: appUser,
            session: {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
            },
          },
        };
      }

      // No hay sesión (requiere confirmación de email)
      return {
        success: true,
        data: {
          user: appUser,
          session: {
            access_token: '',
            refresh_token: '',
            expires_at: 0,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Sincroniza el usuario con la tabla usuario usando sync-user edge function
   */
  private static async syncUserToDatabase(userData: RegisterData, supabaseUserId: string, accessToken?: string): Promise<boolean> {
    try {
      // Asegurar que todos los campos requeridos tengan valores válidos
      const phoneNumber = userData.phoneNumber || '';
      
      // Usar la cédula como id_usuario
      const cedula = userData.id;
      const id_usuario = cedula ? parseInt(cedula.toString()) : null;
      
      if (!id_usuario) {
        console.error('❌ No se encontró cédula para usar como id_usuario');
        return false;
      }
      
      const syncUserData = {
        id_usuario: id_usuario,   // Cédula como número entero
        uuid: supabaseUserId,     // UUID de Supabase como string
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) : null,
        role: userData.role || 'pasajero',
        dateOfBirth: userData.dateOfBirth || ''
      };

      // Validar que los campos requeridos no estén vacíos
      const requiredFields = ['id_usuario', 'uuid', 'firstName', 'lastName', 'role', 'dateOfBirth'];
      const missingFields = requiredFields.filter(field => !syncUserData[field as keyof typeof syncUserData]);
      
      // Validar phoneNumber por separado ya que puede ser null
      if (!syncUserData.phoneNumber) {
        missingFields.push('phoneNumber');
      }
      
      if (missingFields.length > 0) {
        console.error('❌ Campos faltantes para sync-user:', missingFields);
        return false;
      }
      
      console.log('📤 Datos enviados a sync-user:', {
        user: syncUserData,
        action: 'register'
      });
      
      // Llamar a sync-user usando fetch directo
      const syncResponse = await fetch(`${API_BASE_URL}/functions/v1/sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${accessToken || this.apiKey}`,
        },
        body: JSON.stringify({
          user: syncUserData,
          action: 'register'
        })
      });

      console.log('📡 sync-user response status:', syncResponse.status);

      if (!syncResponse.ok) {
        // Intentar obtener detalles del error
        try {
          const errorBody = await syncResponse.text();
          console.warn('❌ sync-user error body:', errorBody);
        } catch (e) {
          console.warn('❌ No se pudo leer el error body');
        }
        console.warn('❌ Error HTTP calling sync-user:', syncResponse.status);
        return false;
      }

      const syncResult = await syncResponse.json();
      console.log('📋 sync-user result:', syncResult);

      if (syncResult.success) {
        return true;
      } else {
        console.warn('❌ sync-user returned error:', syncResult);
        return false;
      }
    } catch (error: any) {
      console.warn('❌ Error calling sync-user:', error);
      return false;
    }
  }

  /**
   * Función equivalente a fetchUserData de la versión web
   * Intenta obtener datos del endpoint, si no usa fallback con metadata
   */
  private static async fetchUserDataForRegistration(supabaseUser: any, accessToken?: string): Promise<User> {
    try {
      // Intentar obtener datos del endpoint primero (usar token pasado como parámetro o currentToken)
      const tokenToUse = accessToken || currentToken;
      if (tokenToUse) {
        // Crear headers temporales con el token
        const tempHeaders = {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${tokenToUse}`,
        };
        
        const response = await fetch(`${ENDPOINTS.USER_DATA}?uuid=${supabaseUser.id}`, {
          method: 'GET',
          headers: tempHeaders,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const userData = result.data;
            const mappedUser = {
              id: userData.uuid || userData.id || supabaseUser.id,
              firstName: userData.nombre || userData.firstName || '',
              lastName: userData.apellido || userData.lastName || '',
              email: userData.email || userData.correo || supabaseUser.email || '',
              phoneNumber: userData.celular || userData.phoneNumber || '',
              role: this.mapRole(userData.rol || userData.role || 'pasajero'),
              createdAt: userData.createdAt || userData.created_at || supabaseUser.created_at,
              dateOfBirth: userData.fecha_nacimiento || userData.dateOfBirth || '',
            };
            return mappedUser;
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error obteniendo datos del endpoint:', error);
    }
    
    // Fallback a datos de Supabase metadata
    return {
      id: supabaseUser.id,
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || '',
      email: supabaseUser.email || '',
      role: this.mapRole(supabaseUser.user_metadata?.role || 'pasajero'),
      createdAt: supabaseUser.created_at,
      phoneNumber: supabaseUser.user_metadata?.phoneNumber || '',
      dateOfBirth: supabaseUser.user_metadata?.dateOfBirth || '',
    };
  }

  /**
   * Logout del usuario
   */
  static async logout(): Promise<void> {
    try {
      if (currentToken) {
        await fetch(ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            ...this.getBaseHeaders(),
            'Authorization': `Bearer ${currentToken}`,
          },
        });
      }
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Obtiene la sesión actual (solo en memoria)
   */
  static getCurrentSession(): { user: User; isValid: boolean } | null {
    if (!currentUser || !currentToken) {
      return null;
    }

    if (this.isTokenExpired()) {
      this.clearSession();
      return null;
    }

    return {
      user: currentUser,
      isValid: true,
    };
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    const session = this.getCurrentSession();
    return session?.isValid || false;
  }
} 