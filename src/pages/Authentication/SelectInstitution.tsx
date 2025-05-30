import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { InstitutionService } from '@/services/institutionService';
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
  
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [residenceAddress, setResidenceAddress] = useState('');
  const [institutionalCode, setInstitutionalCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  // Roles disponibles para seleccionar
  const availableRoles = [
    { value: 'Estudiante', label: 'Estudiante', icon: GraduationCap, description: 'Estudiante de la institución' },
    { value: 'Profesor', label: 'Profesor', icon: UserCheck, description: 'Docente o profesor' },
    { value: 'Administrativo', label: 'Administrativo', icon: Briefcase, description: 'Personal administrativo' },
    { value: 'Otro', label: 'Externo', icon: Globe, description: 'Usuario externo a la institución' }
  ];

  // Cargar instituciones disponibles
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const result = await InstitutionService.getAllInstitutions();
        if (result.success) {
          setInstitutions(result.data || []);
        } else {
          toast({
            title: "❌ Error",
            description: "No se pudieron cargar las instituciones",
            variant: "destructive",
          });
        }
      } catch (error) {
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
    if (!selectedInstitution || !selectedRole || !user?.id || !residenceAddress.trim() || !institutionalCode.trim()) {
      toast({
        title: "❌ Campos requeridos",
        description: "Por favor completa todos los campos incluyendo tu dirección de residencia y código institucional",
        variant: "destructive",
      });
      return;
    }

    // Validar que el usuario tenga email
    if (!user?.email) {
      toast({
        title: "❌ Email requerido",
        description: "No se encontró el email del usuario. Por favor vuelve a iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('👤 Datos del usuario para registro:', {
        id: user.id,
        email: user.email,
        selectedInstitution,
        selectedRole,
        residenceAddress,
        institutionalCode
      });
      
      // Usar el método del InstitutionService con todos los campos requeridos
      const result = await InstitutionService.registerUserInInstitution({
        user_uuid: user.id,
        id_institucion: selectedInstitution,
        rol_institucional: selectedRole,
        correo_institucional: user.email,
        codigo_institucional: institutionalCode.trim(),
        direccion_de_residencia: residenceAddress.trim()
      });

      if (result.success) {
        setIsRegistered(true);
        
        toast({
          title: "✅ Solicitud enviada",
          description: "Tu solicitud ha sido enviada para revisión. Recibirás una notificación cuando sea aprobada.",
        });

        // Redirigir después de mostrar el mensaje de éxito
        setTimeout(() => {
          logout(); // Cerrar sesión para que vuelva a validar con el nuevo estado
        }, 3000);
        
      } else {
        toast({
          title: "❌ Error",
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
                Recibirás un correo cuando tu solicitud sea aprobada.
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
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Email requerido para continuar. Intenta cerrar sesión y volver a iniciar.
                </p>
              )}
            </div>
          </div>

          {/* Selección de institución */}
          <div className="space-y-3">
            <Label className="text-lg font-medium">Instituciones Disponibles</Label>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {institutions.length > 0 ? (
                institutions.map((institution) => (
                  <div
                    key={institution.id_institucion}
                    onClick={() => setSelectedInstitution(institution.id_institucion)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedInstitution === institution.id_institucion
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
                      {selectedInstitution === institution.id_institucion && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay instituciones disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Selección de rol */}
          {selectedInstitution && (
            <div className="space-y-3">
              <Label className="text-lg font-medium">Tu Rol en la Institución</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {availableRoles.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <div
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRole === role.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-6 h-6 ${
                          selectedRole === role.value ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{role.label}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        {selectedRole === role.value && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Información del proceso */}
          {selectedInstitution && selectedRole && (
            <div className="space-y-4">
              {/* Campo de dirección de residencia */}
              <div className="space-y-2">
                <Label htmlFor="residenceAddress" className="text-sm font-medium">
                  Dirección de Residencia *
                </Label>
                <Input
                  id="residenceAddress"
                  type="text"
                  placeholder="Ingresa tu dirección completa de residencia"
                  value={residenceAddress}
                  onChange={(e) => setResidenceAddress(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Esta información será utilizada para verificación y contacto institucional
                </p>
              </div>

              {/* Campo de código institucional */}
              <div className="space-y-2">
                <Label htmlFor="institutionalCode" className="text-sm font-medium">
                  Código Institucional *
                </Label>
                <Input
                  id="institutionalCode"
                  type="text"
                  placeholder="Ej: EST2024001, PROF001, ADM123"
                  value={institutionalCode}
                  onChange={(e) => setInstitutionalCode(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Ingresa tu código de estudiante, empleado o el código que te proporcionó la institución
                </p>
              </div>

              {/* Información del proceso */}
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Proceso de Registro</h4>
                <div className="text-sm text-amber-700 space-y-1">
                  <p>• Tu solicitud será enviada para revisión</p>
                  <p>• El administrador de la institución evaluará tu solicitud</p>
                  <p>• Recibirás una notificación cuando sea aprobada</p>
                  <p>• Una vez aprobada, podrás acceder a todas las funcionalidades</p>
                </div>
              </div>
            </div>
          )}

          {/* Botón de registro */}
          <Button 
            onClick={handleInstitutionRegister}
            disabled={isLoading || !selectedInstitution || !selectedRole || !residenceAddress.trim() || !institutionalCode.trim() || !user?.email}
            className="w-full h-12"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando solicitud...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Enviar Solicitud de Registro
              </div>
            )}
          </Button>

          {/* Botón para volver */}
          <Button 
            variant="outline"
            onClick={() => navigate('/verify-documents')}
            className="w-full"
          >
            Volver a Verificación
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectInstitution; 