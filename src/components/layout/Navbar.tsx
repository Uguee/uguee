import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Check, UserPlus, Car, Menu, Clock, History, Star } from 'lucide-react';
import { useDriverValidation } from '../../contexts/DriverValidationContext';
import { Button } from '@/components/ui/button';
import { UserService } from '../../services/userService';
import { SUPABASE_FUNCTIONS } from '../../config/endpoints';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DocumentVerificationService } from '@/services/documentVerificationService';
import { AuthFlowService } from '@/services/authFlowService';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  id_usuario: string;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { isValidatedDriver, isPendingDriver, isDeniedDriver, isLoading } = useDriverValidation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'passenger' | 'driver'>('passenger');

  // Add debug logs for driver validation status
  useEffect(() => {
    console.log('🔍 Driver Validation Status:', {
      isValidatedDriver,
      isPendingDriver,
      isDeniedDriver,
      isLoading,
      userRole: user?.role,
      currentPath: location.pathname
    });
  }, [isValidatedDriver, isPendingDriver, isDeniedDriver, isLoading, user?.role, location.pathname]);

  // Log desktop navigation state
  useEffect(() => {
    console.log('🎯 Desktop Navigation State:', {
      isPendingDriver,
      isDeniedDriver,
      isValidatedDriver,
      isDriverView: location.pathname.startsWith('/driver'),
      isInstitutionalView: location.pathname.startsWith('/institution')
    });
  }, [isPendingDriver, isDeniedDriver, isValidatedDriver, location.pathname]);

  // Close menus when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsViewMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleViewMenu = () => {
    setIsViewMenuOpen(!isViewMenuOpen);
  };

  const handleViewChange = (view: 'driver' | 'passenger' | 'admin_institucional' | 'admin') => {
    console.log('🔄 View Change Attempt:', {
      requestedView: view,
      currentUserRole: user?.role,
      isDriverView: isDriverView,
      isInstitutionalView: isInstitutionalView
    });

    if (view === 'driver') {
      console.log('🚗 Attempting to navigate to driver dashboard');
      navigate('/driver/dashboard');
    } else if (view === 'admin_institucional') {
      if (user?.role === 'admin_institucional') {
        console.log('🏢 Attempting to navigate to institution dashboard');
        navigate('/institution/dashboard');
      } else {
        console.log('⚠️ User not authorized for institution view, redirecting to dashboard');
        navigate('/dashboard');
      }
    } else if (view === 'admin') {
      if (user?.role === 'admin') {
        console.log('👑 Attempting to navigate to admin dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('⚠️ User not authorized for admin view, redirecting to dashboard');
        navigate('/dashboard');
      }
    } else if (view === 'passenger') {
      console.log('👥 Attempting to navigate to passenger dashboard');
      navigate('/dashboard');
    }
    setIsViewMenuOpen(false);
  };

  const isDriverView = location.pathname.startsWith('/driver');
  const isInstitutionalView = location.pathname.startsWith('/institution');
  const isInstitutionalAdmin = user?.role === 'admin_institucional';

  const renderDriverOptions = () => {
    if (isLoading) {
      console.log('⏳ Driver options loading...');
      return null;
    }

    console.log('🎯 Rendering driver options:', {
      isPendingDriver,
      isDeniedDriver,
      isValidatedDriver
    });

    if (isPendingDriver) {
      return (
        <div className="text-gray-600 flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          Solicitud enviada
        </div>
      );
    }

    if (isDeniedDriver && user?.role !== 'admin_institucional') {
      return (
        <Button
          variant="ghost"
          onClick={() => navigate('/driver/register')}
          className="text-gray-600 hover:text-primary transition-colors"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          ¿Quieres ser conductor?
        </Button>
      );
    }

    return (
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => handleViewChange('driver')}
      >
        <Car className="mr-2 h-4 w-4" />
        Vista Conductor
      </Button>
    );
  };

  const handleHomeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      return;
    }

    // Usar AuthFlowService para determinar la redirección
    const result = await AuthFlowService.checkRouteAccess(user);
    
    if (result.shouldRedirect) {
      navigate(result.redirectTo);
    } else {
      // Si no hay redirección necesaria, ir al dashboard
      navigate("/dashboard");
    }
  };

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
                onClick={(e) => {
                  console.log('🔍 Inicio button clicked');
                  handleHomeClick(e);
                }}
              >
                Inicio
              </Link>
              {isPendingDriver ? (
                <div className="text-gray-600 flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Solicitud enviada
                </div>
              ) : isDeniedDriver && user?.role !== 'admin_institucional' ? (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/driver/register')}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  ¿Quieres ser conductor?
                </Button>
              ) : (
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
                      {isValidatedDriver && (
                        <button
                          onClick={() => handleViewChange('driver')}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Vista conductor
                          {isDriverView && <Check className="ml-2 h-4 w-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleViewChange('passenger')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Vista pasajero
                        {!isDriverView && !isInstitutionalView && !location.pathname.startsWith('/admin') && <Check className="ml-2 h-4 w-4" />}
                      </button>
                      {user?.role === 'admin_institucional' && (
                        <button
                          onClick={() => handleViewChange('admin_institucional')}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Vista Admin Institucional
                          {isInstitutionalView && <Check className="ml-2 h-4 w-4" />}
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleViewChange('admin')}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Vista Admin General
                          {location.pathname.startsWith('/admin') && <Check className="ml-2 h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
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
                  {isPendingDriver ? (
                    <div className="text-gray-600 py-2 flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Solicitud enviada
                    </div>
                  ) : isDeniedDriver && user?.role !== 'admin_institucional' ? (
                    <Link 
                      to="/driver/register"
                      className="text-gray-600 py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ¿Quieres ser conductor?
                    </Link>
                  ) : (
                    <>
                      {isValidatedDriver && (
                        <button 
                          onClick={() => {
                            handleViewChange('driver');
                            setIsMenuOpen(false);
                          }}
                          className="text-left text-gray-600 py-2 hover:text-primary transition-colors"
                        >
                          Vista conductor
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          handleViewChange('passenger');
                          setIsMenuOpen(false);
                        }}
                        className="text-left text-gray-600 py-2 hover:text-primary transition-colors"
                      >
                        Vista pasajero
                      </button>
                      {user?.role === 'admin_institucional' && (
                        <button 
                          onClick={() => {
                            handleViewChange('admin_institucional');
                            setIsMenuOpen(false);
                          }}
                          className="text-left text-gray-600 py-2 hover:text-primary transition-colors"
                        >
                          Vista Admin
                        </button>
                      )}
                    </>
                  )}
                  <Link 
                    to="/profile" 
                    className="text-gray-600 py-2 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <button 
                    onClick={logout}
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
                    className="text-gray-600 py-2 hover:text-primary transition-colors"
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

      {showUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowUserInfo(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-purple-700">Información del Usuario</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p><span className="font-semibold">Nombre:</span> {user?.firstName} {user?.lastName}</p>
                <p><span className="font-semibold">Rol:</span> <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{user?.role}</span></p>
                <p><span className="font-semibold">Teléfono:</span> {user?.phone || 'No disponible'}</p>
              </div>
              <div>
                <p><span className="font-semibold">Email:</span> {user?.email}</p>
                <p><span className="font-semibold">ID:</span> {user?.id}</p>
                <p><span className="font-semibold">Fecha de nacimiento:</span> {user?.birthdate || 'No disponible'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
