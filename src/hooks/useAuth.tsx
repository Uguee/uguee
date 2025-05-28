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

  // Función para obtener datos completos del usuario desde el endpoint
  const fetchUserData = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const userData = await UserService.getUserByUuid(supabaseUser.id);
      
      if (userData) {
        return userData;
      } else {
        console.error('No user data found for UUID:', supabaseUser.id);
        return null;
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          setIsLoading(true);
          const userData = await fetchUserData(session.user);
          
          if (userData) {
            setUser(userData);
          } else {
            console.error('Failed to get user data from database');
            setUser(null);
          }
          
          setIsLoading(false);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        setIsLoading(true);
        const userData = await fetchUserData(session.user);
        
        if (userData) {
          setUser(userData);
        } else {
          console.error('Failed to get initial user data from database');
          setUser(null);
        }
        
        setIsLoading(false);
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
      
      // Si el login fue exitoso, obtener datos completos del usuario
      if (data.user) {
        const userData = await fetchUserData(data.user);
        return userData;
      }
      
      return null;
      
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Error iniciando sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Registering user with data:', userData);
      
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
      
      // Verificar si el usuario se creó correctamente
      console.log('Registration response:', data);
      
      if (data.user) {
        try {
          // Llamar a nuestra edge function para sincronizar en las tablas personalizadas
          const syncResponse = await supabase.functions.invoke('sync-user', {
            body: {
              user: {
                id_usuario: userData.id,
                uuid: data.user.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber,
                role: userRole,
                dateOfBirth: userData.dateOfBirth
              },
              action: 'register'
            }
          });
          
          console.log('Sync user response:', syncResponse);
          
          if (syncResponse.error) {
            console.error('Error sincronizando usuario con tablas personalizadas:', syncResponse.error);
            throw new Error(syncResponse.error);
          }
        } catch (syncError) {
          console.error('Error llamando a edge function:', syncError);
          throw syncError;
        }
      }
      
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Error registrando usuario');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
