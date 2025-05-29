import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
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

  // Función para convertir un usuario de Supabase a nuestro modelo de usuario
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      firstName: supabaseUser.user_metadata.firstName || '',
      lastName: supabaseUser.user_metadata.lastName || '',
      email: supabaseUser.email || '',
      role: supabaseUser.user_metadata.role || 'student',
      createdAt: supabaseUser.created_at,
      phoneNumber: supabaseUser.user_metadata.phoneNumber,
      dateOfBirth: supabaseUser.user_metadata.dateOfBirth,
    };
  };

  // Check if user is already logged in
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          const appUser = convertSupabaseUser(session.user);
          setUser(appUser);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      
      if (session?.user) {
        const appUser = convertSupabaseUser(session.user);
        setUser(appUser);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const appUser = convertSupabaseUser(data.user);
        setUser(appUser);
      }
      
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Error iniciando sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function - Edge Function - CORREGIDA
  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Registro con Edge Function...');
      
      // 1. LIMPIAR DATOS CONFLICTIVOS PRIMERO
      console.log('🧹 Limpiando datos previos...');
      const userId = parseInt(userData.id || '0');
      
      // Intentar limpiar datos previos (puede fallar, no importa)
      try {
        await supabase.from('usuario').delete().eq('id_usuario', userId);
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
          }
        }
      });
      
      if (error) throw error;
      console.log('✅ Auth exitoso');

      // 3. EDGE FUNCTION CON DATOS CORRECTOS
      if (data.user) {
        console.log('🔄 Llamando Edge Function con datos corregidos...');
        
        const requestBody = {
          user: {
            id_usuario: userId,
            uuid: data.user.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber, // ✅ Como string
            dateOfBirth: userData.dateOfBirth,
          },
          action: 'register'
        };
        
        console.log('📤 Datos enviados a Edge Function:', requestBody);
        
        const syncResponse = await supabase.functions.invoke('sync-user', {
          body: requestBody
        });

        console.log('📡 Respuesta Edge Function:', syncResponse);
        
        if (syncResponse.error) {
          console.error('❌ Edge Function error:', syncResponse.error);
          throw new Error(`Edge Function falló: ${JSON.stringify(syncResponse.error)}`);
        }
        
        if (syncResponse.data?.error) {
          console.error('❌ Edge Function data error:', syncResponse.data.error);
          throw new Error(`Datos error: ${syncResponse.data.error}`);
        }
        
        console.log('✅ Sincronización exitosa:', syncResponse.data);
        
        const appUser = convertSupabaseUser(data.user);
        setUser(appUser);
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
