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
  error: string | null;
  checkValidation: () => Promise<void>;
}

export const DriverValidationContext = createContext<DriverValidationContextType | undefined>(undefined);

export const DriverValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [validationState, setValidationState] = useState<{
    status: 'validado' | 'pendiente' | 'denegado' | null;
    isLoading: boolean;
    error: string | null;
  }>({
    status: null,
    isLoading: false,
    error: null
  });

  const checkValidation = async () => {
    if (!user?.id) return;
    
    console.log('🔍 Checking driver validation for user:', user.id);
    setValidationState(prev => ({ ...prev, isLoading: true }));
    try {
      // Primero verificar si el usuario está registrado en una institución
      const { data: registroData, error: registroError } = await supabase
        .from('registro')
        .select('validacion_conductor')
        .eq('id_usuario', parseInt(user.id))
        .single();

      if (registroError) {
        throw new Error('Error al verificar registro de conductor');
      }

      const status = (registroData?.validacion_conductor as ValidationStatus) || null;
      
      setValidationState({
        status,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Validation error:', error);
      setValidationState({
        status: null,
        isLoading: false,
        error: error.message
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkValidation();
    }
  }, [user?.id]);

  const value = {
    ...validationState,
    validationStatus: validationState.status,
    isValidatedDriver: validationState.status === 'validado',
    isPendingDriver: validationState.status === 'pendiente',
    isDeniedDriver: validationState.status === 'denegado' || validationState.status === null,
    checkValidation
  };

  return (
    <DriverValidationContext.Provider value={value}>
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