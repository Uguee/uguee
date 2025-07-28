import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserInstitution {
  id_institucion: number;
  nombre_oficial: string;
  logo?: string;
  direccion: string;
  colores: string;
}

export const useUserInstitution = () => {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<UserInstitution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInstitution = async () => {
      console.log('🔍 useUserInstitution: Starting fetch...');
      console.log('👤 User data:', user);
      
      if (!user?.id) {
        console.log('❌ No user or id found');
        setInstitution(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // CASO 1: Si es admin_institucional, buscar directamente en la tabla institucion
        if (user.role === 'admin_institucional') {
          console.log('🏛️ Admin institucional detected, searching by admin_institucional field...');
          
          // Obtener el UUID del usuario autenticado
          const { data: { session } } = await supabase.auth.getSession();
          const userUuid = session?.user?.id;

          console.log('🔑 User UUID:', userUuid);

          if (userUuid) {
            const { data: institutionData, error: institutionError } = await supabase
              .from('institucion')
              .select('*')
              .eq('admin_institucional', userUuid)
              .single();

            console.log('🏛️ Institution query for admin result:', { data: institutionData, error: institutionError });

            if (!institutionError && institutionData) {
              console.log('✅ Institution found for admin:', institutionData);
              setInstitution(institutionData);
              setIsLoading(false);
              return;
            } else {
              console.log('❌ No institution found for admin or error:', institutionError);
            }
          }
        }

        // CASO 2: Para usuarios normales (rol 'usuario'), buscar a través de la tabla registro
        console.log('👤 Regular user detected, searching through registro table...');
        console.log('🆔 User ID:', user.id);
        
        const { data: registroData, error: registroError } = await supabase
          .from('registro')
          .select('id_institucion')
          .eq('id_usuario', parseInt(user.id))
          .single();

        console.log('📋 Registro result:', { data: registroData, error: registroError });

        if (registroError || !registroData) {
          console.log('❌ No registro found for user');
          setInstitution(null);
          setIsLoading(false);
          return;
        }

        // Buscar en la tabla institucion usando el id_institucion
        console.log('🏛️ Looking in institucion table for id:', registroData.id_institucion);
        
        const { data: institutionData, error: institutionError } = await supabase
          .from('institucion')
          .select('*')
          .eq('id_institucion', registroData.id_institucion)
          .single();

        console.log('🏛️ Institution result:', { data: institutionData, error: institutionError });

        if (!institutionError && institutionData) {
          console.log('✅ Institution found:', institutionData);
          setInstitution(institutionData);
        } else {
          console.log('❌ No institution found or error:', institutionError);
          setInstitution(null);
        }

      } catch (err: any) {
        console.error('❌ Error fetching user institution:', err);
        setError(err.message);
        setInstitution(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInstitution();
  }, [user?.id, user?.role]);

  // Debug logs
  useEffect(() => {
    console.log('🐛 useUserInstitution Final Result:', {
      institution,
      hasLogo: !!institution?.logo,
      logoUrl: institution?.logo,
      institutionName: institution?.nombre_oficial,
      isLoading,
      error,
      userId: user?.id,
      userRole: user?.role
    });
  }, [institution, isLoading, error, user?.id, user?.role]);

  return { institution, isLoading, error };
}; 