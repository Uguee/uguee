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

<<<<<<< HEAD
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
=======
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
>>>>>>> 6eaf5927cfa231ea81f13ad0b225b9804f4dc58c
  };

  // Check if user is already logged in
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
<<<<<<< HEAD
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
=======
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          const appUser = convertSupabaseUser(session.user);
          setUser(appUser);
>>>>>>> 6eaf5927cfa231ea81f13ad0b225b9804f4dc58c
        } else {
          setUser(null);
          setIsLoading(false);
        }
        
        setIsLoading(false);
      }
    );

<<<<<<< HEAD
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
=======
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      
      if (session?.user) {
        const appUser = convertSupabaseUser(session.user);
        setUser(appUser);
      }
      
      setIsLoading(false);
>>>>>>> 6eaf5927cfa231ea81f13ad0b225b9804f4dc58c
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
      
<<<<<<< HEAD
      // Si el login fue exitoso, obtener datos completos del usuario
      if (data.user) {
        const userData = await fetchUserData(data.user);
        return userData;
      }
      
      return null;
      
=======
      if (data.user) {
        const appUser = convertSupabaseUser(data.user);
        setUser(appUser);
      }
      
>>>>>>> 6eaf5927cfa231ea81f13ad0b225b9804f4dc58c
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
        const appUser = convertSupabaseUser(data.user);
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
