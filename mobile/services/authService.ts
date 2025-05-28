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
    
    console.log('💾 Sesión guardada en memoria para:', userData.email);
  }

  /**
   * Limpia los datos de sesión
   */
  private static clearSession(): void {
    currentUser = null;
    currentToken = null;
    refreshToken = null;
    tokenExpiresAt = null;
    
    console.log('🗑️ Sesión limpiada de memoria');
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
      console.log('🔐 Iniciando login para:', credentials.email);
      
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
        console.log('❌ Login falló:', data.error_description || data.msg);
        // Limpiar cualquier sesión previa cuando login falla
        this.clearSession();
        return {
          success: false,
          error: data.error_description || data.msg || 'Error de autenticación',
        };
      }

      // Obtener datos completos del usuario
      const userData = await this.fetchUserData(data.user.id);
      
      if (!userData) {
        // Fallback a metadata de Supabase
        const fallbackUser: User = {
          id: data.user.id,
          firstName: data.user.user_metadata?.firstName || '',
          lastName: data.user.user_metadata?.lastName || '',
          email: data.user.email || '',
          phoneNumber: data.user.user_metadata?.phoneNumber || '',
          role: this.mapRole(data.user.user_metadata?.role || 'pasajero'),
          createdAt: data.user.created_at,
          dateOfBirth: data.user.user_metadata?.dateOfBirth || '',
        };
        
        this.saveSession(data, fallbackUser);
        
        return {
          success: true,
          data: {
            user: fallbackUser,
            session: {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: data.expires_at,
            },
          },
        };
      }

      this.saveSession(data, userData);

      return {
        success: true,
        data: {
          user: userData,
          session: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
          },
        },
      };
    } catch (error: any) {
      console.log('❌ Error de conexión en login:', error.message);
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

      // Crear objeto User
      const user: User = {
        id: data.user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: this.mapRole(userData.role || 'pasajero'),
        createdAt: data.user.created_at,
        dateOfBirth: userData.dateOfBirth,
      };

      if (data.session) {
        this.saveSession(data.session, user);
        
        return {
          success: true,
          data: {
            user,
            session: {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
            },
          },
        };
      }

      return {
        success: true,
        data: {
          user,
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
      console.log('❌ No hay sesión en memoria');
      return null;
    }

    if (this.isTokenExpired()) {
      console.log('⏰ Token expirado, limpiando sesión');
      this.clearSession();
      return null;
    }

    console.log('✅ Sesión válida en memoria para:', currentUser.email);
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