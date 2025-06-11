import { useContext } from 'react';
import { DriverValidationContext } from '../contexts/DriverValidationContext';

export const useDriverValidation = () => {
  const context = useContext(DriverValidationContext);
  if (!context) {
    throw new Error('useDriverValidation debe ser usado dentro de DriverValidationProvider');
  }
  return context;
};
