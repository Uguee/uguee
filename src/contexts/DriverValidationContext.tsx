import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';

type ValidationStatus = 'validado' | 'pendiente' | 'denegado' | null;

interface DriverValidationContextType {
  isValidatedDriver: boolean;
  isPendingDriver: boolean;
  isDeniedDriver: boolean;
  validationStatus: ValidationStatus;
  isLoading: boolean;
  checkValidation: () => Promise<void>;
}

const DriverValidationContext = createContext<DriverValidationContextType | undefined>(undefined);

export const DriverValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isValidatedDriver, setIsValidatedDriver] = useState(false);
  const [isPendingDriver, setIsPendingDriver] = useState(false);
  const [isDeniedDriver, setIsDeniedDriver] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkValidation = async () => {
    console.log('🔍 Checking driver validation:', { userId: user?.id });
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const userData = await UserService.getUserDataFromUsuarios(user.id);
      console.log('👤 User data:', userData);
      if (!userData) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/is-conductor-validated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id_usuario: userData.id_usuario })
      });

      if (!response.ok) return;
      
      const data = await response.json();
      console.log('✅ Validation result:', data);
      const status = data.validacion_conductor as ValidationStatus;
      setValidationStatus(status);
      setIsValidatedDriver(status === 'validado');
      setIsPendingDriver(status === 'pendiente');
      setIsDeniedDriver(status === 'denegado' || status === null);
    } catch (error) {
      console.error('❌ Error checking driver validation:', error);
      setValidationStatus(null);
      setIsValidatedDriver(false);
      setIsPendingDriver(false);
      setIsDeniedDriver(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 DriverValidation effect:', { userId: user?.id });
    if (user?.id) {
      checkValidation();
    }
  }, [user?.id]);

  return (
    <DriverValidationContext.Provider value={{ 
      isValidatedDriver, 
      isPendingDriver, 
      isDeniedDriver,
      validationStatus,
      isLoading, 
      checkValidation 
    }}>
      {children}
    </DriverValidationContext.Provider>
  );
};

export const useDriverValidation = () => {
  const context = useContext(DriverValidationContext);
  if (context === undefined) {
    throw new Error('useDriverValidation must be used within a DriverValidationProvider');
  }
  return context;
}; 