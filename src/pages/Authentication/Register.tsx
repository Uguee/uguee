
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '../../types';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phoneNumber: '',
    institutionalEmail: '',
    institutionalCode: '',
    role: 'student' as UserRole,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Apellidos son requeridos';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Número de teléfono es requerido';
    }
    
    if (formData.role === 'student' && !formData.institutionalEmail) {
      newErrors.institutionalEmail = 'Correo institucional es requerido';
    }
    
    if (formData.role === 'student' && !formData.institutionalCode) {
      newErrors.institutionalCode = 'Código institucional es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? value as UserRole : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting registration data:', formData);
      
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        institutionalEmail: formData.institutionalEmail,
        institutionalCode: formData.institutionalCode,
        role: formData.role,
      };
      
      await register(userData, formData.password);
      toast({
        title: "Registro exitoso",
        description: "Bienvenido a Ugüee. Tu cuenta ha sido creada.",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Registration error details:', error);
      toast({
        title: "Error de registro",
        description: error.message || "No pudimos crear tu cuenta. Por favor intenta de nuevo.",
        variant: "destructive",
      });
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
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Regístrate para ser parte de Ugüee
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Selecciona tu rol
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Estudiante</option>
                <option value="driver">Conductor</option>
              </select>
            </div>
            
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
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
                      errors.firstName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
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
                      errors.lastName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección de residencia
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
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
                    errors.phoneNumber ? 'border-red-500' : ''
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
            
            {/* Institutional Information (For Students) */}
            {formData.role === 'student' && (
              <>
                <div>
                  <label htmlFor="institutionalEmail" className="block text-sm font-medium text-gray-700">
                    Correo institucional
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="institutionalEmail"
                      id="institutionalEmail"
                      value={formData.institutionalEmail}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.institutionalEmail ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.institutionalEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.institutionalEmail}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="institutionalCode" className="block text-sm font-medium text-gray-700">
                    Código institucional
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="institutionalCode"
                      id="institutionalCode"
                      value={formData.institutionalCode}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.institutionalCode ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.institutionalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.institutionalCode}</p>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Account Information */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Acepto los términos y condiciones
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-gradient-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
