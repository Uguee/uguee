import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Check } from 'lucide-react';
import { UserService } from '../../services/userService';
import { SUPABASE_FUNCTIONS } from '../../config/endpoints';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  firstName?: string;
  role?: string;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleViewMenu = () => {
    setIsViewMenuOpen(!isViewMenuOpen);
  };

  const handleViewChange = async (view: 'driver' | 'passenger') => {
    if (view === 'driver') {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        console.log('Getting user data...');
        const userData = await UserService.getUserDataFromUsuarios(user.id);
        
        if (!userData) {
          throw new Error('Could not get user data');
        }

        console.log('User data from usuarios:', userData);
        console.log('id_usuario being sent:', userData.id_usuario);
        
        console.log('Checking driver validation...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No active session');
        }

        const response = await fetch('https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/is-conductor-validated', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ id_usuario: userData.id_usuario })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Validation response:', data);
        console.log('data.validacion_conductor:', data.validacion_conductor); // debug
        if (data.validacion_conductor === 'validado') {
          console.log('User is validated, redirecting to driver dashboard');
          navigate('/driver/dashboard');
        } else {
          console.log('User is not validated, redirecting to not allowed page');
          navigate('/driver-not-allowed');
        }
      } catch (error) {
        console.error('Error checking driver validation:', error);
        // Show error message to user
        alert('Error al verificar la validación del conductor. Por favor, intente nuevamente.');
        navigate('/driver-not-allowed');
      }
    } else {
      console.log('Switching to passenger view');
      navigate('/dashboard');
    }
    setIsViewMenuOpen(false);
  };

  const isDriverView = location.pathname.startsWith('/driver');
  const isInstitutionalAdmin = user?.role === 'admin_institucional';

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
          <h1 className="text-primary text-2xl font-bold">Ugüee</h1>
          {location.pathname !== '/' && (
            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
              {isInstitutionalAdmin ? 'Panel Administrativo' : 'Transporte universitario'}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Inicio
              </Link>
              <div className="relative group">
                <button 
                  className="flex items-center text-gray-600 hover:text-primary transition-colors"
                  onClick={toggleViewMenu}
                >
                  Cambiar vista
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 ml-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </button>
                {isViewMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => handleViewChange('driver')}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Vista conductor
                      {isDriverView && <Check className="ml-2 h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleViewChange('passenger')}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Vista pasajero
                      {!isDriverView && <Check className="ml-2 h-4 w-4" />}
                    </button>
                  </div>
                )}
              </div>
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-primary transition-colors">
                  {user?.firstName || 'Usuario'}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 ml-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mi perfil
                  </Link>
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md transition-colors"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-600"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-3 py-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-600 py-2 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <button 
                    onClick={() => handleViewChange('driver')}
                    className="text-left text-gray-600 py-2 hover:text-primary transition-colors"
                  >
                    Vista conductor
                  </button>
                  <button 
                    onClick={() => handleViewChange('passenger')}
                    className="text-left text-gray-600 py-2 hover:text-primary transition-colors"
                  >
                    Vista pasajero
                  </button>
                  <Link 
                    to="/profile" 
                    className="text-gray-600 py-2 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-600 py-2 hover:text-primary transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 py-2 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
