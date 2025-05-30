import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogoService } from '@/services/logoService';

const InstitutionRegister = () => {
  const [formData, setFormData] = useState({
    nombre_oficial: '',
    logo: '',
    direccion: '',
    colores: '#3B82F6', // Color por defecto
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Depuración temporal para ver el estado del usuario
  useEffect(() => {
    console.log('🔍 InstitutionRegister - Estado del usuario:', {
      user,
      isLoading,
      userId: user?.id,
      userEmail: user?.email
    });
  }, [user, isLoading]);

  // Efecto para redirigir si no hay usuario después de cargar
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Sesión requerida",
        description: "Necesitas iniciar sesión para registrar una institución.",
        variant: "destructive"
      });
      navigate('/login', { 
        state: { 
          message: 'Inicia sesión para registrar tu institución.',
          returnTo: 'institution-register'
        } 
      });
    }
  }, [user, isLoading, navigate, toast]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre_oficial.trim()) {
      newErrors.nombre_oficial = 'Nombre oficial de la institución es requerido';
    }
    
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'Dirección es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
      ]);
      
      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        throw new Error('No active session');
      }
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    return headers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Verificación mejorada del usuario
    if (!user?.id) {
      console.error('❌ No user found:', { user, isLoading });
      
      // Intentar obtener sesión directamente
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Sesión directa:', session);
        
        if (session?.user) {
          toast({
            title: "Error de sincronización",
            description: "Hay un problema con la sincronización del usuario. Por favor, vuelve a iniciar sesión.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sesión requerida",
            description: "Necesitas iniciar sesión para registrar una institución.",
            variant: "destructive",
          });
        }
      } catch (sessionError) {
        console.error('❌ Error obteniendo sesión:', sessionError);
        toast({
          title: "Error de sesión",
          description: "No se pudo verificar tu sesión. Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
      }
      
      navigate('/login', { 
        state: { 
          message: 'Inicia sesión para registrar tu institución.',
          returnTo: 'institution-register'
        } 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener headers de autenticación
      const headers = await getAuthHeaders();

      // Procesar logo si existe
      let logoUrl = '';
      if (formData.logo) {
        toast({
          title: "Procesando logo...",
          description: "Subiendo el logo de la institución.",
        });

        const logoResult = await LogoService.processLogo(
          formData.logo, 
          formData.nombre_oficial
        );

        if (!logoResult.success) {
          toast({
            title: "Error al subir logo",
            description: logoResult.error || "No se pudo procesar el logo.",
            variant: "destructive",
          });
          return;
        }

        logoUrl = logoResult.url || '';
      }

      // Datos de la institución con la URL del logo
      const institutionData = {
        nombre_oficial: formData.nombre_oficial,
        logo: logoUrl, // URL del logo subido al bucket
        direccion: formData.direccion,
        colores: formData.colores,
        admin_institucional: user.id, // UUID del usuario actual
      };

      console.log('📤 Enviando datos de institución:', institutionData);

      // Llamar al endpoint para crear la institución
      const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/create-institution', {
        method: 'POST',
        headers,
        body: JSON.stringify(institutionData),
      });

      if (!response.ok) {
        throw new Error(`Error al crear la institución: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "¡Institución registrada exitosamente!",
          description: "Tu solicitud está siendo revisada por nuestro equipo.",
        });
        
        // Mostrar un mensaje de confirmación y luego recargar la página 
        // para que el contexto de autenticación obtenga el nuevo rol del usuario
        console.log('🎉 Institución registrada exitosamente. Refrescando para obtener nuevo rol...');
        
        // Esperar un momento para que el usuario vea el toast, luego recargar
        setTimeout(() => {
          window.location.href = '/pending-validation';
        }, 2000);
      } else {
        throw new Error(result.error || "Error al crear la institución");
      }
    } catch (error: any) {
      console.error("Institution registration error:", error);
      toast({
        title: "Error al registrar institución",
        description: error.message || "No pudimos crear tu institución. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar loading mientras se carga el usuario
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        <div>
          <Link to="/">
            <h2 className="text-center text-3xl font-bold text-primary">
              Ugüee
            </h2>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Registro de Institución
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Completa los datos de tu institución educativa
          </p>
          {/* Mostrar información del usuario para depuración */}
          {user && (
            <p className="mt-1 text-xs text-gray-400 text-center">
              Usuario: {user.email || user.id}
            </p>
          )}
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nombre oficial */}
            <div>
              <label
                htmlFor="nombre_oficial"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre oficial de la institución *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="nombre_oficial"
                  id="nombre_oficial"
                  value={formData.nombre_oficial}
                  onChange={handleChange}
                  placeholder="Universidad Nacional de Colombia"
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.nombre_oficial ? "border-red-500" : ""
                  }`}
                />
                {errors.nombre_oficial && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nombre_oficial}
                  </p>
                )}
              </div>
            </div>

            {/* Logo */}
            <div>
              <label
                htmlFor="logo"
                className="block text-sm font-medium text-gray-700"
              >
                Logo de la institución
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="logo"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
                {formData.logo && (
                  <div className="mt-2">
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="h-20 w-auto object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label
                htmlFor="direccion"
                className="block text-sm font-medium text-gray-700"
              >
                Dirección *
              </label>
              <div className="mt-1">
                <textarea
                  name="direccion"
                  id="direccion"
                  rows={3}
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Carrera 45 # 26-85, Bogotá, Colombia"
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.direccion ? "border-red-500" : ""
                  }`}
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.direccion}
                  </p>
                )}
              </div>
            </div>

            {/* Colores */}
            <div>
              <label
                htmlFor="colores"
                className="block text-sm font-medium text-gray-700"
              >
                Color principal de la institución
              </label>
              <div className="mt-1 flex items-center space-x-3">
                <input
                  type="color"
                  name="colores"
                  id="colores"
                  value={formData.colores}
                  onChange={handleChange}
                  className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colores}
                  onChange={(e) => setFormData(prev => ({ ...prev, colores: e.target.value }))}
                  placeholder="#3B82F6"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-32 sm:text-sm border-gray-300 rounded-md"
                />
                <div className="text-sm text-gray-500">
                  Este color se usará en el tema de la institución
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-gradient-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isSubmitting ? "Registrando institución..." : "Registrar institución"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Necesitas ayuda?{" "}
              <Link
                to="/support"
                className="font-medium text-primary hover:text-primary-hover"
              >
                Contacta soporte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionRegister;
