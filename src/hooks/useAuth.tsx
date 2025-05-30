import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { UserService } from '../services/userService';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Intentar obtener datos del endpoint con timeout
      const userData = await Promise.race([
        UserService.getUserByUuid(supabaseUser.id),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('User service timeout')), 8000)
        )
      ]);
      
      if (userData) {
        return userData;
      } else {
        throw new Error('No user data received from service');
      }
    } catch (error) {
      throw new Error('Failed to fetch user data from service');
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Solo procesar eventos importantes, no TOKEN_REFRESHED
        if (event === 'TOKEN_REFRESHED') {
          setSession(session);
          return;
        }
        
        setSession(session);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          // Evitar llamadas duplicadas si ya tenemos el usuario correcto
          if (user && user.id === session.user.id) {
            setIsLoading(false);
            return;
          }
          
          // Solo hacer fetch si realmente no tenemos usuario
          setIsLoading(true);
          try {
            const appUser = await fetchUserData(session.user);
            setUser(appUser);
          } catch (error) {
            setUser(null);
          }
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Si ya tenemos el usuario correcto, no hacer fetch
        if (user && user.id === session.user.id) {
          setIsLoading(false);
          return;
        }
        
        // Solo hacer fetch si no tenemos usuario
        setIsLoading(true);
        try {
          const appUser = await fetchUserData(session.user);
          setUser(appUser);
        } catch (error) {
          setUser(null);
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        try {
          const appUser = await fetchUserData(data.user);
          setUser(appUser);
          setSession(data.session);
          return appUser;
        } catch (fetchError) {
          console.log('🔄 Usuario no encontrado en la base de datos. Intentando sincronizar...');
          
          // Si no se puede obtener el usuario, intentar sincronizarlo
          // Esto es común para usuarios recién registrados que confirmaron su email
          const userData = {
            firstName: data.user.user_metadata?.firstName,
            lastName: data.user.user_metadata?.lastName,
            email: data.user.email,
            phoneNumber: data.user.user_metadata?.phoneNumber,
            role: data.user.user_metadata?.role as UserRole,
            dateOfBirth: data.user.user_metadata?.dateOfBirth,
            id: data.user.user_metadata?.cedula,
          };
          
          const syncSuccess = await syncUserToDatabase(data.user, userData);
          
          if (syncSuccess) {
            console.log('✅ Usuario sincronizado exitosamente');
            // Intentar obtener los datos nuevamente
            try {
              const appUser = await fetchUserData(data.user);
              setUser(appUser);
              setSession(data.session);
              return appUser;
            } catch (secondFetchError) {
              console.warn('⚠️ Sincronización exitosa pero no se pudieron obtener los datos del usuario');
            }
          } else {
            console.warn('❌ Fallo la sincronización del usuario');
          }
          
          // Como último recurso, crear un usuario temporal con los datos de Supabase
          const tempUser: User = {
            id: data.user.id,
            firstName: data.user.user_metadata?.firstName || '',
            lastName: data.user.user_metadata?.lastName || '',
            email: data.user.email || '',
            role: data.user.user_metadata?.role || 'usuario',
            createdAt: data.user.created_at || new Date().toISOString(),
            phoneNumber: data.user.user_metadata?.phoneNumber || '',
            dateOfBirth: data.user.user_metadata?.dateOfBirth || '',
          };
          
          setUser(tempUser);
          setSession(data.session);
          return tempUser;
        }
      }
      
      return null;
      
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Error iniciando sesión');
      throw err;
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
        role: userRole || supabaseUser.user_metadata?.role || 'usuario',
        dateOfBirth: userData.dateOfBirth || supabaseUser.user_metadata?.dateOfBirth || ''
      };

      console.log('📦 Datos preparados para sync-user:', syncUserData);

      // Validar que los campos requeridos no estén vacíos
      const requiredFields = ['id_usuario', 'uuid', 'firstName', 'lastName', 'role', 'dateOfBirth'];
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
        role: userRole || supabaseUser.user_metadata?.role || 'usuario',
        dateOfBirth: userData.dateOfBirth || supabaseUser.user_metadata?.dateOfBirth || ''
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
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email || '',
        password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            role: userRole,
            dateOfBirth: userData.dateOfBirth,
            cedula: cedula, // Incluir cédula en metadata
          }
        }
      });
      
      if (error) throw error;
      
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
      console.error('Registration failed:', err);
      setError(err.message || 'Error en el registro');
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
