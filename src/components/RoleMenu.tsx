import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { UserRole } from '../types';

interface MenuOption {
  label: string;
  path: string;
  roles: UserRole[];
}


const menuOptions: MenuOption[] = [
  { label: 'Buscar rutas',        path: '/search-routes',      roles: ['usuario', 'conductor', 'admin_institucional'] },
  { label: 'Historial de viajes', path: '/my-trips',           roles: ['usuario', 'conductor'] },
  { label: 'Crear viaje',         path: '/driver/create-trip', roles: ['conductor'] },
  { label: 'Mis rutas activas',   path: '/my-routes',          roles: ['conductor'] },
  { label: 'Reportar incidente',  path: '/report-incident',    roles: ['usuario', 'conductor'] },
  { label: 'Validar conductores', path: '/validate-drivers',   roles: ['admin_institucional'] },
  { label: 'Gestionar vehículos', path: '/manage-vehicles',    roles: ['admin_institucional'] },
  { label: 'Aprobación de solicitudes', path: '/approve-requests', roles: ['admin_institucional'] },
  { label: 'Administrar instituciones', path: '/admin/institutions', roles: ['admin'] },
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
