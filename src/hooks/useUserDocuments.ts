import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserDocument {
  numero: number;
  tipo: string;
  lugar_expedicion: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  imagen_front: string;
  imagen_back: string | null;
}

export const useUserDocuments = (userId: number | null) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('documento')
        .select('*')
        .eq('id_usuario', userId);

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching user documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  return { documents, isLoading, error, refetch: fetchDocuments };
}; 