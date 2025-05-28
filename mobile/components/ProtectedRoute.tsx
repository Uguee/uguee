import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { User } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  fallbackComponent?: React.ComponentType<any>;
  redirectTo?: string;
}

// Componente de loading
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#8B5CF6" />
    <Text style={styles.loadingText}>Verificando autenticación...</Text>
  </View>
);

// Componente de acceso denegado
const AccessDeniedScreen = ({ userRole, allowedRoles }: { userRole: string; allowedRoles: string[] }) => (
  <View style={styles.accessDeniedContainer}>
    <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
    <Text style={styles.accessDeniedText}>
      Tu rol ({userRole}) no tiene permisos para acceder a esta sección.
    </Text>
    <Text style={styles.accessDeniedSubtext}>
      Roles permitidos: {allowedRoles.join(', ')}
    </Text>
  </View>
);

// Componente de no autenticado
const NotAuthenticatedScreen = () => (
  <View style={styles.notAuthContainer}>
    <Text style={styles.notAuthTitle}>Acceso Restringido</Text>
    <Text style={styles.notAuthText}>
      Debes iniciar sesión para acceder a esta sección.
    </Text>
  </View>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackComponent: FallbackComponent,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    allowedRoles,
  });

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    console.log('⏳ Verificando autenticación...');
    return <LoadingScreen />;
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    console.log('🚫 Usuario no autenticado');
    return FallbackComponent ? <FallbackComponent /> : <NotAuthenticatedScreen />;
  }

  // Si hay roles específicos requeridos
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('❌ Rol no permitido:', user.role, 'Permitidos:', allowedRoles);
    return (
      <AccessDeniedScreen 
        userRole={user.role} 
        allowedRoles={allowedRoles} 
      />
    );
  }

  console.log('✅ Acceso concedido');
  return <>{children}</>;
};

// Hook para verificar permisos específicos
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: User['role']): boolean => {
    return isAuthenticated && user?.role === role;
  };

  const hasAnyRole = (roles: User['role'][]): boolean => {
    return isAuthenticated && user ? roles.includes(user.role) : false;
  };

  const canAccess = (allowedRoles?: User['role'][]): boolean => {
    if (!allowedRoles) return isAuthenticated;
    return hasAnyRole(allowedRoles);
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    canAccess,
    isPassenger: hasRole('pasajero'),
    isDriver: hasRole('conductor'),
    isInstitutionAdmin: hasRole('admin_institucional'),
    isAdmin: hasRole('admin'),
  };
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 16,
    textAlign: 'center',
  },
  notAuthText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ProtectedRoute; 