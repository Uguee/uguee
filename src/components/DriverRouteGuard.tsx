import { Navigate, useLocation } from 'react-router-dom';
import { useDriverValidation } from '../contexts/DriverValidationContext';

export const DriverRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isValidatedDriver, isPendingDriver, isLoading } = useDriverValidation();
  const location = useLocation();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isValidatedDriver) {
    if (isPendingDriver) {
      return <Navigate to="/pending-validation" state={{ from: location }} replace />;
    }
    return <Navigate to="/driver-not-allowed" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
