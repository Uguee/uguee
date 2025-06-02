import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { UserService } from '../services/userService';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { DocumentVerificationService } from '../services/documentVerificationService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: Partial<User>, password: string, cedula?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create a context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos completos del usuario
  const fetchUserData = async (supabaseUser: SupabaseUser, accessToken?: string): Promise<User | null> => {
    console.log('🔍 Fetching user data for UUID:', supabaseUser.id);
    
    try {
      // Intentar obtener datos del endpoint con timeout aumentado y retry
      const maxRetries = 2;
      let attempt = 0;
      
      while (attempt < maxRetries) {
        try {
          const userData = await Promise.race([
            UserService.getUserByUuid(supabaseUser.id, accessToken), // Pasar token directamente
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('User service timeout')), 20000) // Aumentado a 20 segundos
            )
          ]);
          
          if (userData) {
            console.log('✅ Datos obtenidos del UserService:', userData);
            
            // Si no hay email en los datos del endpoint, usar el de Supabase como respaldo
            if (!userData.email && supabaseUser.email) {
              console.log('🔧 Usando email de Supabase como respaldo:', supabaseUser.email);
              userData.email = supabaseUser.email;
            }
            
            return userData;
          } else {
            console.warn(`⚠️ Intento ${attempt + 1}: No se recibieron datos del endpoint`);
          }
        } catch (error: any) {
          console.warn(`⚠️ Intento ${attempt + 1} falló:`, error.message);
          if (attempt === maxRetries - 1) {
            throw error;
          }
        }
        
        attempt++;
        if (attempt < maxRetries) {
          console.log(`🔄 Reintentando en 2 segundos... (intento ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.error('❌ Todos los intentos fallaron');
      return null;
    } catch (error) {
      console.error('❌ Error fetching user data from endpoint:', error);
      return null;
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, 'session exists:', !!session);
        
        // Solo procesar eventos importantes, no TOKEN_REFRESHED
        if (event === 'TOKEN_REFRESHED') {
          if (isMounted) {
            setSession(session);
          }
          return;
        }
        
        if (!isMounted) return;
        
        setSession(session);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          console.log('🔍 Processing auth event:', event, 'for user:', session.user.id);
          
          setIsLoading(true);
          try {
            const appUser = await fetchUserData(session.user, session.access_token);
            if (appUser && isMounted) {
              console.log('✅ User data loaded successfully');
              setUser(appUser);
            } else if (isMounted) {
              console.error('❌ No se pudieron obtener los datos del usuario desde el endpoint');
              setUser(null);
            }
          } catch (error) {
            console.error('❌ Error obteniendo datos del usuario:', error);
            if (isMounted) {
              setUser(null);
            }
          }
          if (isMounted) {
            console.log('🔄 Setting isLoading to false, user loaded:', !!user);
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            console.log('🚪 User signed out, clearing state');
            setUser(null);
            setIsLoading(false);
          }
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }
        
        if (!isMounted) return;
        
        setSession(session);
        
        if (session?.user) {
          console.log('✅ Existing session found for user:', session.user.id);
          
          // Solo procesar si NO tenemos usuario ya cargado (evitar condición de carrera)
          if (!user) {
            console.log('🔄 Loading user data from session...');
            setIsLoading(true);
            try {
              const appUser = await fetchUserData(session.user, session.access_token);
              if (appUser && isMounted) {
                console.log('✅ User data restored from session');
                setUser(appUser);
              } else if (isMounted) {
                console.error('❌ No se pudieron obtener los datos del usuario desde el endpoint');
                setUser(null);
              }
            } catch (error) {
              console.error('❌ Error obteniendo datos del usuario:', error);
              if (isMounted) {
                setUser(null);
              }
            }
            if (isMounted) {
              console.log('🔄 Setting isLoading to false from checkSession, user loaded successfully');
              setIsLoading(false);
            }
          } else {
            console.log('ℹ️ User already loaded, skipping session check');
            if (isMounted) {
              console.log('🔄 Setting isLoading to false, user already exists');
              setIsLoading(false);
            }
          }
        } else {
          console.log('ℹ️ No existing session found');
          if (isMounted) {
            console.log('🔄 Setting isLoading to false, no session');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
        if (isMounted) {
          console.log('🔄 Setting isLoading to false due to error');
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Sin dependencias para evitar bucles infinitos

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        try {
          const appUser = await fetchUserData(data.user, data.session?.access_token);
          if (appUser) {
            // Check if user has null role
            if (appUser.role === null) {
              // Redirect to document verification
              window.location.href = '/document-verification';
              return null;
            }
            setUser(appUser);
            setSession(data.session);
            return appUser;
          } else {
            console.error('❌ No se pudieron obtener los datos del usuario desde el endpoint');
            throw new Error('No se pudieron obtener los datos del usuario');
          }
        } catch (error) {
          console.error('❌ Error en login:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  // Función para sincronizar usuario con la tabla usuario
  const syncUserToDatabase = async (supabaseUser: SupabaseUser, userData: Partial<User>): Promise<boolean> => {
    try {
      console.log('🔍 Iniciando sincronización de usuario');
      console.log('📄 Datos del usuario de Supabase:', {
        id: supabaseUser.id,
        email: supabaseUser.email,
        user_metadata: supabaseUser.user_metadata,
        created_at: supabaseUser.created_at
      });
      console.log('📄 Datos del usuario recibidos:', userData);
      
      // Verificamos que el rol sea del tipo correcto
      const userRole = userData.role as UserRole;
      console.log('🎭 Rol del usuario:', userRole);
      
      // Asegurar que todos los campos requeridos tengan valores válidos
      const phoneNumber = userData.phoneNumber || supabaseUser.user_metadata?.phoneNumber || '';
      console.log('📱 Número de teléfono procesado:', phoneNumber);
      
      // Usar la cédula como id_usuario
      const cedula = userData.id || supabaseUser.user_metadata?.cedula;
      console.log('🆔 Cédula encontrada:', cedula);
      
      const id_usuario = cedula ? parseInt(cedula.toString()) : null;
      console.log('🔢 ID usuario (cédula convertida):', id_usuario);
      
      if (!id_usuario) {
        console.error('❌ No se encontró cédula para usar como id_usuario');
        return false;
      }
      
      const syncUserData = {
        id_usuario: id_usuario, // Cédula como número entero
        uuid: supabaseUser.id,  // UUID de Supabase como string
        firstName: userData.firstName || supabaseUser.user_metadata?.firstName || '',
        lastName: userData.lastName || supabaseUser.user_metadata?.lastName || '',
        phoneNumber: phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) : null,
        role: userRole || supabaseUser.user_metadata?.role || 'pendiente',
        dateOfBirth: userData.dateOfBirth || supabaseUser.user_metadata?.dateOfBirth || ''
      };

      console.log('📦 Datos preparados para sync-user:', syncUserData);

      // Validar que los campos requeridos no estén vacíos
      const requiredFields = ['id_usuario', 'uuid', 'firstName', 'lastName', 'dateOfBirth'];
      const missingFields = requiredFields.filter(field => !syncUserData[field as keyof typeof syncUserData]);
      
      // Validar phoneNumber por separado ya que puede ser null
      if (!syncUserData.phoneNumber) {
        missingFields.push('phoneNumber');
      }
      
      console.log('🔍 Campos faltantes:', missingFields);
      
      if (missingFields.length > 0) {
        console.error('❌ Campos faltantes para sync-user:', missingFields);
        return false;
      }
      
      const requestBody = {
        user: syncUserData,
        action: 'register'
      };
      
      console.log('🚀 Enviando request a sync-user:', requestBody);
      
      const syncResponse = await supabase.functions.invoke('sync-user', {
        body: requestBody
      });

      console.log('📥 Respuesta de sync-user:', {
        error: syncResponse.error,
        data: syncResponse.data
      });

      if (syncResponse.error) {
        console.warn('❌ Error calling sync-user:', syncResponse.error);
        return false;
      }

      if (syncResponse.data?.success) {
        console.log('✅ Sincronización exitosa');
        return true;
      } else {
        console.warn('❌ sync-user returned error:', syncResponse.data);
        return false;
      }
    } catch (error: any) {
      console.warn('❌ Error calling sync-user:', error);
      return false;
    }
  };

  // Función para sincronizar usuario con la tabla usuario usando token específico
  const syncUserToDatabaseWithToken = async (supabaseUser: SupabaseUser, userData: Partial<User>, accessToken: string): Promise<boolean> => {
    try {
      // Verificamos que el rol sea del tipo correcto
      const userRole = userData.role as UserRole;
      
      // Asegurar que todos los campos requeridos tengan valores válidos
      const phoneNumber = userData.phoneNumber || supabaseUser.user_metadata?.phoneNumber || '';
      
      // Usar la cédula como id_usuario
      const cedula = userData.id || supabaseUser.user_metadata?.cedula;
      const id_usuario = cedula ? parseInt(cedula.toString()) : null;
      
      if (!id_usuario) {
        console.error('❌ No se encontró cédula para usar como id_usuario');
        return false;
      }
      
      const syncUserData = {
        id_usuario: id_usuario, // Cédula como número entero
        uuid: supabaseUser.id,  // UUID de Supabase como string
        firstName: userData.firstName || supabaseUser.user_metadata?.firstName || '',
        lastName: userData.lastName || supabaseUser.user_metadata?.lastName || '',
        phoneNumber: phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) : null,
        role: userRole || supabaseUser.user_metadata?.role || 'pendiente',
        dateOfBirth: userData.dateOfBirth || supabaseUser.user_metadata?.dateOfBirth || ''
      };

      // Validar que los campos requeridos no estén vacíos
      const requiredFields = ['id_usuario', 'uuid', 'firstName', 'lastName', 'dateOfBirth'];
      const missingFields = requiredFields.filter(field => !syncUserData[field as keyof typeof syncUserData]);
      
      // Validar phoneNumber por separado ya que puede ser null
      if (!syncUserData.phoneNumber) {
        missingFields.push('phoneNumber');
      }
      
      if (missingFields.length > 0) {
        console.error('❌ Campos faltantes para sync-user:', missingFields);
        return false;
      }
      
      // Llamar al endpoint con el token de autorización
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user: syncUserData,
          action: 'register'
        })
      });

      if (!response.ok) {
        console.warn('❌ Error calling sync-user:', response.status, response.statusText);
        return false;
      }

      const responseData = await response.json();
      
      if (responseData?.success) {
        return true;
      } else {
        console.warn('❌ sync-user returned error:', responseData);
        return false;
      }
    } catch (error: any) {
      console.warn('❌ Error calling sync-user:', error);
      return false;
    }
  };

  // Register function
  const register = async (userData: Partial<User>, password: string, cedula?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificamos que el rol sea del tipo correcto
      const userRole = userData.role as UserRole;
      
      // Id numérico del usuario (cédula) si se proporcionó
      const userId = userData.id ? Number(userData.id) : null;
      
      // Intentar limpiar datos previos (puede fallar, no importa)
      try {
        if (userId) {
          await supabase.from('usuario').delete().eq('id_usuario', userId);
        }
      } catch (cleanError) {
        console.log('ℹ️ No había datos previos que limpiar');
      }
      
      // 2. CREAR EN AUTH
      const { data, error } = await supabase.auth.signUp({
        email: userData.email || '',
        password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            role: userData.role as UserRole,
            dateOfBirth: userData.dateOfBirth,
            cedula: cedula, // Incluir cédula en metadata
          }
        }
      });
      
      if (error) throw error;
      console.log('✅ Auth exitoso');

      // 3. EDGE FUNCTION CON DATOS CORRECTOS
      if (data.user) {
        console.log('✅ Usuario registrado en Supabase Auth.');
        
        // Siempre intentar sincronizar usuario con la tabla usuario
        console.log('🔄 Sincronizando usuario con la base de datos...');
        try {
          const userDataWithCedula = { ...userData, id: cedula };
          const syncSuccess = await syncUserToDatabase(data.user, userDataWithCedula);
          
          if (syncSuccess) {
            console.log('✅ Usuario sincronizado exitosamente con la base de datos');
          } else {
            console.warn('⚠️ Sincronización falló, pero el registro continuará');
          }
        } catch (syncError) {
          console.warn('⚠️ Error en sincronización, pero el registro continuará:', syncError);
        }
      }
      
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (err: any) {
      console.error('Logout failed:', err);
      setError(err.message || 'Error cerrando sesión');
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
