import { useState, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Check } from 'lucide-react';
import { useDriverValidation } from '../../hooks/useDriverValidation';

interface User {
  id: string;
  firstName?: string;
  role?: string;
}

// Separate component for the view switcher to prevent unnecessary re-renders
const ViewSwitcher = memo(({ 
  isValidated, 
  isLoading, 
  isDriverView, 
  onViewChange, 
  onBecomeDriver 
}: { 
  isValidated: boolean;
  isLoading: boolean;
  isDriverView: boolean;
  onViewChange: (view: 'driver' | 'passenger') => void;
  onBecomeDriver: () => void;
}) => {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  const toggleViewMenu = useCallback(() => {
    setIsViewMenuOpen(prev => !prev);
  }, []);

  if (isLoading) return null;

  if (!isValidated) {
    return (
      <button
        onClick={onBecomeDriver}
        className="text-primary hover:text-primary-hover transition-colors"
      >
        ¿Quieres convertirte en conductor?
      </button>
    );
  }

  return (
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
            onClick={() => {
              onViewChange('driver');
              setIsViewMenuOpen(false);
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Vista conductor
            {isDriverView && <Check className="ml-2 h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              onViewChange('passenger');
              setIsViewMenuOpen(false);
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Vista pasajero
            {!isDriverView && <Check className="ml-2 h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
});

ViewSwitcher.displayName = 'ViewSwitcher';

const Navbar = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isValidated, isLoading } = useDriverValidation(user?.id);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleViewChange = useCallback((view: 'driver' | 'passenger') => {
    if (view === 'driver') {
      navigate('/driver/dashboard');
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleBecomeDriver = useCallback(() => {
    navigate('/driver-registration');
  }, [navigate]);

  const isDriverView = location.pathname.startsWith('/driver');
  const isInstitutionalAdmin = user?.role === 'admin_institucional';
  const isPassengerRoute = !isDriverView && !isInstitutionalAdmin && !location.pathname.startsWith('/admin');
  const showViewSwitcher = isPassengerRoute || isDriverView;

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
      <div className="w-full max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center min-w-[120px]">
          <h1 className="text-primary text-2xl font-bold">Ugüee</h1>
          {location.pathname !== '/' && (
            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
              {isInstitutionalAdmin ? 'Panel Administrativo' : 'Transporte universitario'}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 flex-1 justify-end">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
              >
                Inicio
              </Link>
              {showViewSwitcher && (
                <ViewSwitcher
                  isValidated={isValidated}
                  isLoading={isLoading}
                  isDriverView={isDriverView}
                  onViewChange={handleViewChange}
                  onBecomeDriver={handleBecomeDriver}
                />
              )}
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-primary transition-colors whitespace-nowrap">
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
                className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
              >
                Iniciar sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-600"
          onClick={toggleMenu}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 text-gray-600 hover:text-primary"
                >
                  Inicio
                </Link>
                {showViewSwitcher && !isLoading && (
                  isValidated ? (
                    <button
                      onClick={() => handleViewChange(isDriverView ? 'passenger' : 'driver')}
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary"
                    >
                      Cambiar a vista {isDriverView ? 'pasajero' : 'conductor'}
                    </button>
                  ) : (
                    <button
                      onClick={handleBecomeDriver}
                      className="block w-full text-left px-3 py-2 text-primary hover:text-primary-hover"
                    >
                      ¿Quieres convertirte en conductor?
                    </button>
                  )
                )}
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 text-gray-600 hover:text-primary"
                >
                  Mi perfil
                </Link>
                <button 
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 text-gray-600 hover:text-primary"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 text-gray-600 hover:text-primary"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
