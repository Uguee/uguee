import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DocumentService } from '@/services/documentService';
import { supabase } from '@/integrations/supabase/client';

interface DocumentData {
  tipo: string;
  lugar_expedicion: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
}

export default function DocumentVerification() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userCedula, setUserCedula] = useState<number | null>(null);
  const [isLoadingCedula, setIsLoadingCedula] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Datos del formulario
  const [documentData, setDocumentData] = useState<DocumentData>({
    tipo: 'identidad',
    lugar_expedicion: '',
    fecha_expedicion: '',
    fecha_vencimiento: '',
  });

  // Obtener la cédula del usuario desde la base de datos usando edge function
  useEffect(() => {
    const getUserCedula = async () => {
      if (!user?.id) {
        setIsLoadingCedula(false);
        return;
      }
      
      try {
        // Intentar obtener token de sesión
        let authHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        try {
          let { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          // Si no hay sesión, intentar refrescarla
          if (!session || sessionError) {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshData.session && !refreshError) {
              session = refreshData.session;
            }
          }
          
          if (session?.access_token) {
            authHeaders['Authorization'] = `Bearer ${session.access_token}`;
          }
        } catch (sessionError) {
          // Continuar sin autorización si falla
        }

        const response = await fetch(
          `https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-user-data?uuid=${user.id}`,
          {
            method: 'GET',
            headers: authHeaders
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: "Problema de sesión",
              description: "Tu sesión no está sincronizada correctamente.",
              variant: "destructive"
            });
          }
          return;
        }

        const result = await response.json();

        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "No se pudo obtener la información del usuario.",
            variant: "destructive"
          });
          return;
        }

        if (result.data?.id_usuario) {
          setUserCedula(result.data.id_usuario);
        } else {
          toast({
            title: "Usuario no sincronizado",
            description: "El usuario no se encuentra en la tabla 'usuario'.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error de conexión",
          description: "Error conectando con el servidor.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCedula(false);
      }
    };

    getUserCedula();
  }, [user?.id, toast]);

  // Efecto para redirigir al login cuando no se puede obtener la cédula
  useEffect(() => {
    if (userCedula === null && !isLoadingCedula) {
      // Mostrar toast explicativo
      toast({
        title: "Sesión requerida",
        description: "Para completar la verificación de documentos, necesitas iniciar sesión nuevamente.",
        variant: "default"
      });

      // Redirigir después de 2 segundos para que el usuario pueda leer el mensaje
      const timer = setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Inicia sesión para completar la verificación de tu documento de identidad.',
            email: user?.email,
            returnTo: 'document-verification'
          } 
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userCedula, isLoadingCedula, navigate, toast, user?.email]);

  // Función para convertir File a URI/base64 (similar a React Native)
  const fileToUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (isBackImage: boolean = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const uri = await fileToUri(file);
          if (isBackImage) {
            setBackImage(uri);
          } else {
            setFrontImage(uri);
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Error procesando la imagen",
            variant: "destructive"
          });
        }
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!frontImage) {
      toast({
        title: "Error",
        description: "Por favor selecciona una foto del frente del documento",
        variant: "destructive"
      });
      return;
    }

    if (!documentData.lugar_expedicion.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el lugar de expedición",
        variant: "destructive"
      });
      return;
    }

    if (!documentData.fecha_expedicion) {
      toast({
        title: "Error",
        description: "Por favor ingresa la fecha de expedición",
        variant: "destructive"
      });
      return;
    }

    if (!documentData.fecha_vencimiento) {
      toast({
        title: "Error",
        description: "Por favor ingresa la fecha de vencimiento",
        variant: "destructive"
      });
      return;
    }

    if (!userCedula) {
      toast({
        title: "Error",
        description: "No se encontró la cédula del usuario",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await DocumentService.uploadDocument(
        frontImage,
        backImage,
        {
          id_usuario: userCedula,
          tipo: documentData.tipo,
          lugar_expedicion: documentData.lugar_expedicion,
          fecha_expedicion: documentData.fecha_expedicion,
          fecha_vencimiento: documentData.fecha_vencimiento,
        }
      );

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Documento subido correctamente"
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: result.error || 'Error subiendo documento',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Error subiendo documento',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = frontImage && 
    documentData.lugar_expedicion.trim() && 
    documentData.fecha_expedicion && 
    documentData.fecha_vencimiento &&
    userCedula !== null;

  // Mostrar loading mientras se obtiene la cédula
  if (isLoadingCedula) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de error de sesión si no se pudo obtener la cédula
  if (userCedula === null && !isLoadingCedula) {
    // Redirigir automáticamente al login para hacer el flujo más fluido
    navigate('/login', { 
      state: { 
        message: 'Para completar la verificación de documentos, necesitas iniciar sesión nuevamente.',
        email: user?.email,
        returnTo: 'document-verification'
      } 
    });
    
    // Mostrar loading mientras se hace la redirección
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al inicio de sesión...</p>
          <p className="text-sm text-gray-400 mt-2">Se requiere iniciar sesión para verificar documentos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Validación de Documento
          </h2>
          <p className="mt-2 text-gray-600">
            Sube tu cédula para completar tu registro
          </p>
          {userCedula && (
            <p className="mt-1 text-sm text-gray-500">
              Usuario: {userCedula}
            </p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 space-y-8">
            {/* Tipo de documento */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tipo de Documento
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <span className="text-gray-700 font-medium">
                  {documentData.tipo === 'identidad' ? 'Cédula de Ciudadanía' : documentData.tipo}
                </span>
              </div>
            </div>

            {/* Imagen frontal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Frente del Documento *
              </h3>
              <div 
                onClick={() => handleImageSelect(false)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
              >
                {frontImage ? (
                  <img 
                    src={frontImage} 
                    alt="Frente del documento" 
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">📄</div>
                    <p className="text-gray-500">
                      Haz clic para agregar foto del frente
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Imagen trasera */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reverso del Documento (Opcional)
              </h3>
              <div 
                onClick={() => handleImageSelect(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
              >
                {backImage ? (
                  <img 
                    src={backImage} 
                    alt="Reverso del documento" 
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">📄</div>
                    <p className="text-gray-500">
                      Haz clic para agregar foto del reverso
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información del Documento
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="lugar_expedicion" className="block text-sm font-medium text-gray-700 mb-2">
                    Lugar de Expedición *
                  </label>
                  <input
                    type="text"
                    id="lugar_expedicion"
                    placeholder="Ej: Bogotá D.C."
                    value={documentData.lugar_expedicion}
                    onChange={(e) =>
                      setDocumentData({ ...documentData, lugar_expedicion: e.target.value })
                    }
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="fecha_expedicion" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Expedición *
                  </label>
                  <input
                    type="date"
                    id="fecha_expedicion"
                    value={documentData.fecha_expedicion}
                    onChange={(e) =>
                      setDocumentData({ ...documentData, fecha_expedicion: e.target.value })
                    }
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    id="fecha_vencimiento"
                    value={documentData.fecha_vencimiento}
                    onChange={(e) =>
                      setDocumentData({ ...documentData, fecha_vencimiento: e.target.value })
                    }
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isUploading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isFormValid && !isUploading
                    ? 'bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                    : 'bg-gray-300 cursor-not-allowed'
                } transition-colors`}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Subiendo documento...
                  </div>
                ) : (
                  'Subir Documento'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 