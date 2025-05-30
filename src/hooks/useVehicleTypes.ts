import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface VehicleType {
  id_tipo: number;
  tipo: string;
}

export const useVehicleTypes = () => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleTypes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('tipo_vehiculo')
        .select('*');
      
      if (error) throw error;
      
      setVehicleTypes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener tipos de vehículos";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { vehicleTypes, isLoading, error, fetchVehicleTypes };
}; 