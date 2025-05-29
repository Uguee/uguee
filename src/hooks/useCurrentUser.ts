import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useCurrentUser = () => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.id_usuario) {
          setCurrentUserId(user.user_metadata.id_usuario);
        } else if (user?.id) {
          const { data, error } = await supabase.rpc('get_user_id_by_uuid', {
            user_uuid: user.id
          });
          
          if (error) {
            console.error('Error obteniendo ID usuario:', error);
            setCurrentUserId(null);
          } else {
            setCurrentUserId(data);
          }
        }
      } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        setCurrentUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  return { currentUserId, isLoading };
};
