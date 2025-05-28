import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AuthService, User, LoginCredentials, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User | null>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
}

// Crear contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ya no verificamos sesión existente al inicializar
  // El usuario debe hacer login cada vez que abre la app

  // Función de login
  const login = async (credentials: LoginCredentials): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Intentando login para:', credentials.email);
      
      const response = await AuthService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        console.log('✅ Login exitoso:', response.data.user.email);
        return response.data.user;
      } else {
        setUser(null);
        const errorMsg = response.error || 'Error de autenticación';
        setError(errorMsg);
        console.error('❌ Login fallido:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      setUser(null);
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('❌ Error en login:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de registro
  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📝 Intentando registro para:', userData.email);
      
      const response = await AuthService.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        console.log('✅ Registro exitoso:', response.data.user.email);
      } else {
        const errorMsg = response.error || 'Error en el registro';
        setError(errorMsg);
        console.error('❌ Registro fallido:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('❌ Error en registro:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setError(null);
      console.log('👋 Logout exitoso');
    } catch (err: any) {
      console.error('❌ Error en logout:', err);
      setError('Error cerrando sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar error
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthProvider; 