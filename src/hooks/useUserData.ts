import { useState, useEffect } from 'react';
import { User } from '../types';
import { UserService } from '../services/userService';

export const useUserData = (uuid?: string) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (userUuid: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await UserService.getUserByUuid(userUuid);
      setUserData(data);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo datos del usuario');
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) {
      fetchUserData(uuid);
    }
  }, [uuid]);

  const refetch = () => {
    if (uuid) {
      fetchUserData(uuid);
    }
  };

  return {
    userData,
    isLoading,
    error,
    refetch,
  };
}; 