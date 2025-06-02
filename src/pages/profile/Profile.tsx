import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          // Obtener datos básicos del usuario
          const userData = await UserService.getUserDataFromUsuarios(user.id);
          
          if (userData) {
            // Obtener el estado de validación del conductor desde la tabla registro
            const { data: registroData, error: registroError } = await supabase
              .from('registro')
              .select('validacion_conductor')
              .eq('id_usuario', userData.id_usuario)
              .single();

            if (registroError) {
              console.error('Error fetching conductor status:', registroError);
            }

            const validacionConductor = registroData?.validacion_conductor;
            
            setProfileData({
              ...userData,
              estadoConductor: 
                validacionConductor === 'validado' ? 'Conductor: Validado' :
                validacionConductor === 'pendiente' ? 'Conductor: Pendiente' :
                'Conductor: No aplica'
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
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
