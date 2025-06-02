import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { AuthFlowService } from "@/services/authFlowService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Obtener datos del estado de navegación
  const navigationState = location.state as { 
    message?: string; 
    email?: string;
    returnTo?: string;
    isInstitutionFlow?: boolean;
  } | null;

  // Pre-llenar email y mostrar mensaje si viene desde document verification
  useEffect(() => {
    if (navigationState?.email) {
      setEmail(navigationState.email);
    }
    if (navigationState?.message) {
      toast({
        title: navigationState.isInstitutionFlow ? "Registro Institucional" : "Verificación de documentos",
        description: navigationState.message,
        variant: "default"
      });
    }
  }, [navigationState, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email, password);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      console.log("🔍 Login successful, user data:", loggedInUser);
      console.log("🎭 User role:", loggedInUser?.role);

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo a Ugüee",
      });

      // Si viene desde document verification, regresar ahí
      if (navigationState?.returnTo === 'document-verification') {
        console.log("➡️ Redirecting back to document verification");
        navigate("/verify-documents");
        return;
      }

      // Si viene del flujo de registro institucional, ir al formulario de institución
      if (navigationState?.returnTo === 'institution-register' || navigationState?.isInstitutionFlow) {
        console.log("➡️ Redirecting to institution registration form");
        navigate("/institution-register");
        return;
      }

      // Redirigir según el rol del usuario
      if (loggedInUser) {
        console.log("🚀 Redirecting based on role:", loggedInUser.role);

        // Usar AuthFlowService para determinar la redirección
        const result = await AuthFlowService.checkRouteAccess(loggedInUser);
        
        if (result.shouldRedirect) {
          console.log("➡️ Redirecting to:", result.redirectTo);
          navigate(result.redirectTo);
        } else {
          // Si no hay redirección necesaria, ir al dashboard
          console.log("➡️ No redirection needed, going to dashboard");
          navigate("/dashboard");
        }
      } else {
        console.log("❌ No user data, redirecting to /dashboard");
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error de inicio de sesión",
        description:
          "Por favor verifica tus credenciales e intenta nuevamente.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si el usuario ya está autenticado, mostrar un estado de carga
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <h2 className="text-center text-3xl font-bold text-primary">Ugüee</h2>
        </Link>
        <p className="mt-2 text-center text-sm text-gray-600">¡Viaja seguro!</p>
        <p className="text-center text-xs text-gray-500">
          Respaldado por las mejores universidades
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Iniciar sesión
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary-hover"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
