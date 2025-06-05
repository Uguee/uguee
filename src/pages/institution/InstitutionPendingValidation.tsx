import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, Building2, Mail, Phone } from 'lucide-react';

interface InstitutionData {
  id_institucion: number;
  nombre_oficial: string;
  direccion: string;
  colores: string;
  logo?: string;
  validacion?: 'pendiente' | 'validado' | 'denegado';
  created_at?: string;
}

const InstitutionPendingValidation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstitutionData = async () => {
      if (!user?.id) {
        setError('Usuario no autenticado');
        setIsLoading(false);
        return;
      }

      try {
        // Obtener el UUID desde la sesión de Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const userUuid = session?.user?.id;
        
        if (!userUuid) {
          setError('No se pudo obtener el UUID del usuario');
          setIsLoading(false);
          return;
        }

        console.log('🔍 InstitutionPendingValidation: Usando UUID para consulta:', userUuid);

        // Obtener datos de la institución asociada al admin usando el UUID
        const { data: institutionData, error: institutionError } = await supabase
          .from('institucion')
          .select('*')
          .eq('admin_institucional', userUuid)
          .single();

        if (institutionError) {
          if (institutionError.code === 'PGRST116') {
            setError('No se encontró ninguna institución asociada a tu cuenta');
          } else {
            setError(`Error al obtener datos de la institución: ${institutionError.message}`);
          }
          setIsLoading(false);
          return;
        }

        console.log('✅ InstitutionPendingValidation: Institución encontrada:', institutionData);

        // Si la columna validacion no existe aún, asignar 'pendiente' por defecto
        const institutionWithValidation: InstitutionData = {
          id_institucion: institutionData.id_institucion,
          nombre_oficial: institutionData.nombre_oficial,
          direccion: institutionData.direccion,
          colores: institutionData.colores,
          logo: institutionData.logo,
          validacion: (institutionData as any).validacion || 'pendiente',
          created_at: (institutionData as any).created_at || new Date().toISOString()
        };

        setInstitution(institutionWithValidation);

        // Si la institución ya está validada, redirigir al dashboard institucional
        if (institutionWithValidation.validacion === 'validado') {
          navigate('/institution/dashboard');
          return;
        }

        // Si la institución fue denegada, mostrar mensaje específico
        if (institutionWithValidation.validacion === 'denegado') {
          // Mantenemos en esta página para mostrar el mensaje de denegación
        }

      } catch (err: any) {
        setError(`Error inesperado: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitutionData();
  }, [user?.id, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'validado':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'denegado':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pendiente':
        return {
          title: 'Solicitud en Verificación',
          message: 'Tu solicitud de registro institucional está siendo revisada por nuestro equipo. Este proceso puede tomar entre 24 a 72 horas hábiles.',
          submessage: 'Te notificaremos por correo electrónico una vez que la verificación esté completa.'
        };
      case 'denegado':
        return {
          title: 'Solicitud Denegada',
          message: 'Lamentamos informarte que tu solicitud de registro institucional ha sido denegada.',
          submessage: 'Para más información sobre los motivos o para apelar esta decisión, contacta a nuestro equipo de soporte.'
        };
      default:
        return {
          title: 'Estado Desconocido',
          message: 'No se pudo determinar el estado de tu solicitud.',
          submessage: 'Por favor, contacta a nuestro equipo de soporte.'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de tu institución...</p>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
            >
              Ir al Dashboard
            </button>
            <button
              onClick={logout}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(institution.validacion);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UGUEE</h1>
                <p className="text-sm text-gray-600">Panel Administrativo Institucional</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className={`px-6 py-8 text-center ${
            institution.validacion === 'pendiente' 
              ? 'bg-yellow-50 border-b border-yellow-200' 
              : institution.validacion === 'denegado'
              ? 'bg-red-50 border-b border-red-200'
              : 'bg-gray-50 border-b border-gray-200'
          }`}>
            <div className="flex justify-center mb-4">
              {getStatusIcon(institution.validacion)}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {statusInfo.title}
            </h2>
            <p className="text-gray-700 mb-2 max-w-2xl mx-auto">
              {statusInfo.message}
            </p>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              {statusInfo.submessage}
            </p>
          </div>

          {/* Institution Details */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles de tu Institución
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Oficial
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {institution.nombre_oficial}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {institution.direccion}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Institucional
                  </label>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-md border border-gray-300"
                      style={{ backgroundColor: institution.colores }}
                    ></div>
                    <span className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex-1">
                      {institution.colores}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Solicitud
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {new Date(institution.created_at || '').toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {institution.logo && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Institucional
                </label>
                <div className="flex justify-center">
                  <img 
                    src={institution.logo} 
                    alt={`Logo de ${institution.nombre_oficial}`}
                    className="max-h-32 max-w-xs object-contain bg-gray-50 p-4 rounded-md border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="px-6 py-6 bg-gray-50 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Necesitas Ayuda?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Correo Electrónico</p>
                  <p className="text-sm text-gray-600">soporte@uguee.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Teléfono</p>
                  <p className="text-sm text-gray-600">+57 (2) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstitutionPendingValidation; 