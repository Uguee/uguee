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
      // Intentar obtener datos del endpoint primero
      const userData = await UserService.getUserByUuid(supabaseUser.id);
      
      if (userData) {
        console.log('User data from endpoint:', userData);
        return userData;
      }
    } catch (error) {
      console.warn('Error fetching user data from endpoint:', error);
    }
    
    // Fallback a datos de Supabase metadata
    console.log('Using Supabase metadata:', supabaseUser.user_metadata);
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
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          setIsLoading(true);
          const appUser = await fetchUserData(session.user);
          setUser(appUser);
          setIsLoading(false);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      
      if (session?.user) {
        setIsLoading(true);
        const appUser = await fetchUserData(session.user);
        setUser(appUser);
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
      
      if (data.user) {
        const appUser = await fetchUserData(data.user);
        setUser(appUser);
        return appUser; // Retornar el usuario
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
      
      if (data.user) {
        const appUser = await fetchUserData(data.user);
        setUser(appUser);
      }
      
      console.log('Registration successful:', data);
      
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
