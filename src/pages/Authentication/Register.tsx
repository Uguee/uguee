import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "../../types";

const Register = () => {
  const [searchParams] = useSearchParams();
  const isInstitutionRegistration = searchParams.get('type') === 'institution';
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "usuario" as UserRole,
    dateOfBirth: "",
    direccion_de_residencia: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Los apellidos son requeridos";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "La fecha de nacimiento es requerida";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 15) {
        newErrors.dateOfBirth = "Debes ser mayor de 15 años";
      }
      if (birthDate > today) {
        newErrors.dateOfBirth = "La fecha no puede ser futura";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "El formato del email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "El número de teléfono es requerido";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "El número debe tener 10 dígitos";
    }

    if (!formData.direccion_de_residencia.trim()) {
      newErrors.direccion_de_residencia = "La dirección de residencia es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos correctamente",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log('Submitting registration data:', formData);
      
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
        direccion_de_residencia: formData.direccion_de_residencia,
      }, formData.password);

      // Este código no se ejecutará si se requiere verificación de email
      toast({
        title: "Registro exitoso",
        description: isInstitutionRegistration 
          ? "Usuario creado exitosamente. Por favor, confirma tu email para continuar con el registro institucional."
          : "Usuario creado exitosamente. Por favor, confirma tu email."
      });

      // Si es flujo institucional, ir directamente al registro de institución
      if (isInstitutionRegistration) {
        navigate('/institution-register');
      } else {
        navigate('/login', { state: { email: formData.email } });
      }

    } catch (error: any) {
      console.log('Registration error details:', error);
      
      // Manejar diferentes tipos de errores
      if (error.message === 'VERIFICATION_REQUIRED') {
        toast({
          title: "¡Registro exitoso!",
          description: (
            <div className="space-y-2">
              <p>Hemos enviado un correo de verificación a {formData.email}.</p>
              <p>Por favor:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Revisa tu bandeja de entrada</li>
                <li>Haz clic en el enlace de verificación</li>
                <li>Una vez verificado, podrás iniciar sesión</li>
              </ol>
              <p className="text-sm text-gray-500 mt-2">
                Si no encuentras el correo, revisa tu carpeta de spam.
              </p>
            </div>
          ),
          duration: 10000, // Mostrar por 10 segundos
        });
        
        // Redirigir al login con el email pre-llenado
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: 'Por favor verifica tu correo electrónico antes de iniciar sesión'
          } 
        });
        return;
      } else if (error.message?.includes('User already registered')) {
        setErrors({ email: 'Este email ya está registrado. Intenta iniciar sesión.' });
      } else if (error.message?.includes('Invalid email')) {
        setErrors({ email: 'El formato del email no es válido.' });
      } else if (error.message?.includes('Password')) {
        setErrors({ password: 'La contraseña debe tener al menos 6 caracteres.' });
      } else if (error.message?.includes('Failed to fetch user data')) {
        // Este error no es crítico - el usuario se creó pero hay problemas con el endpoint
        toast({
          title: "Registro exitoso",
          description: "Usuario creado exitosamente. Por favor, confirma tu email."
        });
        if (isInstitutionRegistration) {
          navigate('/institution-register');
        } else {
          navigate('/login', { state: { email: formData.email } });
        }
        return;
      } else {
        setErrors({ general: error.message || "Error en el registro. Por favor intenta de nuevo." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div>
          <Link to="/">
            <h2 className="text-center text-3xl font-bold text-primary">
              Ugüee
            </h2>
          </Link>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¡Viaja seguro!
          </p>
          <p className="text-center text-xs text-gray-500">
            Respaldado por las mejores universidades
          </p>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            {isInstitutionRegistration ? 'Registro de Administrador Institucional' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isInstitutionRegistration 
              ? 'Primero crea tu cuenta de administrador' 
              : 'Regístrate para ser parte de Ugüee'
            }
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.firstName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellidos
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.lastName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Campo de fecha fuera del grid anterior para que ocupe todo el ancho */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha de nacimiento
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.dateOfBirth ? "border-red-500" : ""
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Número de celular
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.phoneNumber ? "border-red-500" : ""
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Dirección de residencia */}
            <div>
              <label
                htmlFor="direccion_de_residencia"
                className="block text-sm font-medium text-gray-700"
              >
                Dirección de residencia
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="direccion_de_residencia"
                  id="direccion_de_residencia"
                  value={formData.direccion_de_residencia}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.direccion_de_residencia ? "border-red-500" : ""
                  }`}
                />
                {errors.direccion_de_residencia && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.direccion_de_residencia}
                  </p>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar contraseña
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                Acepto los términos y condiciones
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-gradient-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-hover"
              >
                Inicia sesión aquí
              </Link>
            </p>
            
            {!isInstitutionRegistration && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  ¿Representas una institución educativa?{" "}
                  <Link
                    to="/register?type=institution"
                    className="font-medium text-primary hover:text-primary-hover"
                  >
                    Registra tu institución
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
