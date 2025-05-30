import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { InstitutionRegistrationService, Institution, RegistrationFormData } from '@/services/institutionRegistrationService';
import { 
  Building2, 
  Users, 
  CheckCircle, 
  Search,
  User,
  GraduationCap,
  Briefcase,
  UserCheck,
  Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const SelectInstitution = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [formData, setFormData] = useState<RegistrationFormData>({
    institutionId: 0,
    role: '',
    institutionalCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  const updateFormData = (field: keyof RegistrationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Cargar instituciones disponibles
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const institutionList = await InstitutionRegistrationService.loadInstitutions();
        setInstitutions(institutionList);
        
        if (institutionList.length === 0) {
          toast({
            title: "❌ Sin instituciones",
            description: "No se encontraron instituciones disponibles",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading institutions:', error);
        toast({
          title: "❌ Error de conexión",
          description: "Error conectando con el servidor",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInstitutions(false);
      }
    };

    loadInstitutions();
  }, [toast]);

  const handleInstitutionRegister = async () => {
    if (!user?.id || !user?.email) {
      toast({
        title: "❌ Error de usuario",
        description: "No se encontró información del usuario. Por favor vuelve a iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('👤 Enviando solicitud de registro:', {
        formData,
        userUuid: user.id,
        userEmail: user.email
      });
      
      const result = await InstitutionRegistrationService.submitRegistration(
        formData,
        user.id,
        user.email
      );

      if (result.success) {
        setIsRegistered(true);
        
        toast({
          title: "✅ Solicitud enviada",
          description: `Tu solicitud ha sido enviada. ${result.data?.roleUpdated ? 'Tu rol ha sido actualizado.' : 'Tu rol se actualizará cuando sea aprobada.'}`,
        });

        // Redirigir después de mostrar el mensaje de éxito
        setTimeout(() => {
          navigate('/pending-validation');
        }, 2000);
        
      } else {
        toast({
          title: "❌ Error en solicitud",
          description: result.error || "No se pudo enviar la solicitud",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      toast({
        title: "❌ Error de conexión",
        description: "Error enviando la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = InstitutionRegistrationService.getRoleOptions();
  const codePlaceholder = InstitutionRegistrationService.getCodePlaceholder(formData.role);

  // Validar si el formulario está completo
  const isFormValid = Boolean(
    formData.institutionId &&
    formData.role &&
    formData.institutionalCode?.trim()
  );

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-green-600">¡Solicitud Enviada!</h2>
              <p className="text-gray-600">
                Tu solicitud de registro ha sido enviada para revisión por parte de la institución.
              </p>
              <p className="text-sm text-gray-500">
                Serás redirigido a la página de validación pendiente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingInstitutions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando instituciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl">Seleccionar Institución</CardTitle>
              <p className="text-gray-600 mt-1">
                Elige la institución a la que deseas unirte y tu rol
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información del usuario */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium">Usuario: {user?.email?.split('@')[0] || 'Sin email'}</p>
              <p className="text-sm text-gray-600">{user?.email || 'Email no disponible'}</p>
              {!user?.email && (
                <p className="text-xs text-red-500 mt-1">⚠️ Se requiere email para completar el registro</p>
              )}
            </div>
          </div>

          {/* Selección de institución */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-lg font-medium">
              <Building2 className="w-5 h-5" />
              Instituciones Disponibles
            </Label>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {institutions.length > 0 ? (
                institutions.map((institution) => (
                  <div
                    key={institution.id_institucion}
                    onClick={() => updateFormData('institutionId', institution.id_institucion)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.institutionId === institution.id_institucion
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {institution.logo ? (
                        <img 
                          src={institution.logo} 
                          alt={institution.nombre_oficial}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{institution.nombre_oficial}</h3>
                        <p className="text-sm text-gray-600">{institution.direccion}</p>
                      </div>
                      {formData.institutionId === institution.id_institucion && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay instituciones disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Selección de rol */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-lg font-medium">
              <Users className="w-5 h-5" />
              Tu Rol en la Institución
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  onClick={() => updateFormData('role', role.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === role.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{role.label.split(' ')[0]}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{role.label.split(' ').slice(1).join(' ')}</h4>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    {formData.role === role.value && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Código institucional */}
          <div className="space-y-3">
            <Label htmlFor="institutionalCode" className="text-lg font-medium">
              Código Institucional
            </Label>
            <Input
              id="institutionalCode"
              type="text"
              placeholder={codePlaceholder}
              value={formData.institutionalCode}
              onChange={(e) => updateFormData('institutionalCode', e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Ingresa tu código como {formData.role || 'miembro'} de la institución seleccionada
            </p>
          </div>

          {/* Botón de registro */}
          <Button 
            onClick={handleInstitutionRegister}
            disabled={isLoading || !isFormValid || !user?.email}
            className="w-full h-12"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando solicitud...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Enviar Solicitud de Registro
              </div>
            )}
          </Button>

          {/* Mensaje de ayuda */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Tu solicitud será revisada por el administrador de la institución.
              Recibirás una notificación cuando sea aprobada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectInstitution; 