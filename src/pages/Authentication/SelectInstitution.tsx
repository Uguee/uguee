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
  Globe,
  BookOpen,
  Shield
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RoleOption {
  value: string;
  label: string;
  icon: any;
  description?: string;
}

const SelectInstitution = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [formData, setFormData] = useState<RegistrationFormData>({
    institutionId: 0,
    role: '',
    institutionalCode: '',
    address: ''
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

  const roleOptions: RoleOption[] = [
    {
      value: 'estudiante',
      label: 'Estudiante',
      icon: GraduationCap,
      description: 'Estudiante activo de la institución'
    },
    {
      value: 'profesor',
      label: 'Profesor',
      icon: BookOpen,
      description: 'Profesor o docente de la institución'
    },
    {
      value: 'administrador',
      label: 'Administrador',
      icon: Shield,
      description: 'Personal administrativo de la institución'
    },
    {
      value: 'externo',
      label: 'Externo',
      icon: User,
      description: 'Usuario externo a la institución'
    }
  ];
  const codePlaceholder = InstitutionRegistrationService.getCodePlaceholder(formData.role);

  // Validar si el formulario está completo
  const isFormValid = Boolean(
    formData.institutionId &&
    formData.role &&
    formData.institutionalCode?.trim() &&
    formData.address?.trim()
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
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Selecciona tu Institución</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Institution Selection */}
          <div className="mb-6">
            <Label htmlFor="institution">Institución</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {institutions.map((institution) => (
                <div
                  key={institution.id_institucion}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.institutionId === institution.id_institucion
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => updateFormData('institutionId', institution.id_institucion)}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">{institution.nombre_oficial}</h3>
                      <p className="text-sm text-muted-foreground">{institution.direccion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label>Rol</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.role === option.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => updateFormData('role', option.value)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Code */}
          <div className="mb-6">
            <Label htmlFor="institutionalCode">Código Institucional</Label>
            <Input
              id="institutionalCode"
              placeholder={codePlaceholder}
              value={formData.institutionalCode}
              onChange={(e) => updateFormData('institutionalCode', e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="mb-6">
            <Label htmlFor="address">Dirección de Residencia</Label>
            <Input
              id="address"
              placeholder="Ingresa tu dirección de residencia"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleInstitutionRegister}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando solicitud...
              </div>
            ) : (
              'Enviar Solicitud'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectInstitution; 