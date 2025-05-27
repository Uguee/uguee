
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { UserRole } from '../types';

interface MenuOption {
  label: string;
  path: string;
  roles: UserRole[];
}

const menuOptions: MenuOption[] = [
  { label: 'Buscar rutas', path: '/search-routes', roles: ['student', 'driver', 'institution-admin'] },
  { label: 'Historial de viajes', path: '/my-trips', roles: ['student', 'driver'] },
  { label: 'Mis rutas activas', path: '/my-routes', roles: ['driver'] },
  { label: 'Reportar incidente', path: '/report-incident', roles: ['student', 'driver'] },
  { label: 'Validar conductores', path: '/validate-drivers', roles: ['institution-admin'] },
  { label: 'Gestionar vehículos', path: '/manage-vehicles', roles: ['institution-admin'] },
  { label: 'Aprobación de solicitudes', path: '/approve-requests', roles: ['institution-admin'] },
  { label: 'Administrar instituciones', path: '/admin/institutions', roles: ['site-admin'] },
];

interface RoleMenuProps {
  className?: string;
}

const RoleMenu: React.FC<RoleMenuProps> = ({ className = "" }) => {
  const { user } = useAuth();
  
  // Filter menu options based on user role
  const filteredOptions = user 
    ? menuOptions.filter(option => option.roles.includes(user.role))
    : [];

  if (!user || filteredOptions.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="text-lg font-medium mb-4 text-text">Acceso Rápido</h3>
      
      <nav>
        <ul className="space-y-2">
          {filteredOptions.map((option) => (
            <li key={option.path}>
              <Link 
                to={option.path}
                className="block py-2 px-4 rounded-md text-gray-700 hover:bg-primary hover:text-white transition-colors duration-200"
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default RoleMenu;
