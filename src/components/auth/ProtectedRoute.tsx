import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', { user, allowedRoles, pathname: location.pathname });

  if (!user) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Si el usuario tiene rol null, solo puede acceder a document-verification
  if (user.role === null) {
    console.log('⚠️ User has null role, checking access to document verification');
    if (location.pathname === '/document-verification') {
      console.log('✅ Allowing access to document verification');
      return <Outlet />;
    }
    console.log('🔄 Redirecting to document verification');
    return <Navigate to="/document-verification" replace />;
  }

  // Si hay roles permitidos y el usuario no tiene uno de esos roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('❌ User role not allowed:', user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Access granted');
  return <Outlet />;
};

export default ProtectedRoute; 