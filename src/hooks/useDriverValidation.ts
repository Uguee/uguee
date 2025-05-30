import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../services/userService';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'driver_validation_status';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedValidation {
  isValidated: boolean;
  timestamp: number;
}

export const useDriverValidation = (userId: string | undefined) => {
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkValidation = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { isValidated, timestamp }: CachedValidation = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setIsValidated(isValidated);
            setIsLoading(false);
            return;
          }
        }
      }

      setIsLoading(true);
      setError(null);

      const userData = await UserService.getUserDataFromUsuarios(userId);
      
      if (!userData) {
        throw new Error('Could not get user data');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/is-conductor-validated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id_usuario: userData.id_usuario })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const newValidationStatus = data.validacion_conductor === 'validado';
      
      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        isValidated: newValidationStatus,
        timestamp: Date.now()
      }));

      setIsValidated(newValidationStatus);
    } catch (err) {
      console.error('Error checking driver validation:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsValidated(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkValidation();
  }, [checkValidation]);

  // Function to force refresh the validation status
  const refreshValidation = useCallback(() => {
    checkValidation(true);
  }, [checkValidation]);

  return { isValidated, isLoading, error, refreshValidation };
}; 