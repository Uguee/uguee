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
  register: (userData: Partial<User>, password: string) => Promise<void>;
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
      // Intentar obtener datos del endpoint con timeout rápido
      const userData = await Promise.race([
        UserService.getUserByUuid(supabaseUser.id),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('User service timeout')), 1000)
        )
      ]);
      
      if (userData) {
        return userData;
      }
    } catch (error) {
      // Usar fallback si falla la edge function
    }
    
    // Fallback a datos de Supabase metadata
    return {
      id: supabaseUser.id,
      firstName: supabaseUser.user_metadata.firstName || '',
      lastName: supabaseUser.user_metadata.lastName || '',
      email: supabaseUser.email || '',
      role: supabaseUser.user_metadata.role || 'pasajero',
      createdAt: supabaseUser.created_at,
      phoneNumber: supabaseUser.user_metadata.phoneNumber || '',
      dateOfBirth: supabaseUser.user_metadata.dateOfBirth || '',
    };
  };

  // Check if user is already logged in
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          setIsLoading(true);
          try {
            const appUser = await fetchUserData(session.user);
            setUser(appUser);
          } catch (error) {
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        setIsLoading(true);
        try {
          const appUser = await fetchUserData(session.user);
          setUser(appUser);
        } catch (error) {
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
        const appUser = await fetchUserData(data.user);
        setUser(appUser);
        setSession(data.session);
        return appUser;
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
      // Verificamos que el rol sea del tipo correcto
      const userRole = userData.role as UserRole;
      
      // Asegurar que todos los campos requeridos tengan valores válidos
      const phoneNumber = userData.phoneNumber || supabaseUser.user_metadata?.phoneNumber || '';
      
      // Usar la cédula como id_usuario
      const cedula = userData.id || supabaseUser.user_metadata?.id;
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
        role: userRole || supabaseUser.user_metadata?.role || 'pasajero',
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
      
      const syncResponse = await supabase.functions.invoke('sync-user', {
        body: {
          user: syncUserData,
          action: 'register'
        }
      });

      if (syncResponse.error) {
        console.warn('❌ Error calling sync-user:', syncResponse.error);
        return false;
      }

      if (syncResponse.data?.success) {
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

  // Register function
  const register = async (userData: Partial<User>, password: string) => {
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
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Sincronizar usuario con la base de datos (siempre, incluso sin sesión)
        const syncSuccess = await syncUserToDatabase(data.user, userData);
        
        const appUser = await fetchUserData(data.user);
        setUser(appUser);
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
