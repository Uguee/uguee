import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';



const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('usuario')
          .select(`
            *,
            registro (
              validacion_conductor
            )
          `)
          .eq('uuid', user.id)
          .single();

        if (data) {
          setProfileData({
            ...data,
            estadoConductor: data.registro?.[0]?.validacion_conductor === 'validado'
              ? 'Conductor: Validado' 
              : data.registro?.[0]?.validacion_conductor === 'pendiente'
              ? 'Conductor: Pendiente'
              : 'Conductor: No aplica'
          });
        }
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto bg-purple-50 rounded-lg p-8 mt-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-8">Información del Usuario</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg text-gray-700 mb-2">Nombre</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {profileData?.nombre} {profileData?.apellido}
            </div>
          </div>

          <div>
            <h2 className="text-lg text-gray-700 mb-2">Rol</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {profileData?.rol}
            </div>
          </div>

          <div>
            <h2 className="text-lg text-gray-700 mb-2">Estado como conductor</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {profileData?.estadoConductor}
            </div>
          </div>

          <div>
            <h2 className="text-lg text-gray-700 mb-2">Teléfono</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {profileData?.celular || 'No disponible'}
            </div>
          </div>

          <div>
            <h2 className="text-lg text-gray-700 mb-2">Email</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {profileData?.correo_institucional || user?.email || 'No disponible'}
            </div>
          </div>

          <div>
            <h2 className="text-lg text-gray-700 mb-2">Fecha de nacimiento</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {profileData?.fecha_nacimiento || 'No disponible'}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
