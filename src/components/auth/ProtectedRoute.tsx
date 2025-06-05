import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = React.useState(true);
  const [redirectTo, setRedirectTo] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setRedirectTo('/login');
        setIsChecking(false);
        return;
      }

      // Si hay roles permitidos y el usuario no tiene uno de esos roles
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        setRedirectTo('/unauthorized');
        setIsChecking(false);
        return;
      }

      // Solo verificar documentos y registro para usuarios normales
      if (user.role === 'usuario') {
        // Verificar documentos
        const { data: documents } = await supabase
          .from('documento')
          .select('id_usuario')
          .eq('id_usuario', user.id_usuario)
          .limit(1);

        if (!documents || documents.length === 0) {
          if (location.pathname !== '/document-verification') {
            setRedirectTo('/document-verification');
            setIsChecking(false);
            return;
          }
        }

        // Verificar registro en institución
        const { data: registration } = await supabase
          .from('registro')
          .select('validacion')
          .eq('id_usuario', user.id_usuario)
          .limit(1);

        if (!registration || registration.length === 0) {
          if (location.pathname !== '/select-institution') {
            setRedirectTo('/select-institution');
            setIsChecking(false);
            return;
          }
        }

        // Verificar estado de validación
        if (registration && registration[0].validacion === 'pendiente') {
          if (location.pathname !== '/pending-validation') {
            setRedirectTo('/pending-validation');
            setIsChecking(false);
            return;
          }
        }
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [user, allowedRoles, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 