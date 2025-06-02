import { 
  Calendar, 
  Home, 
  Search, 
  History, 
  Heart, 
  Car,
  Plus,
  Play
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { DocumentVerificationService } from '@/services/documentVerificationService';
import { supabase } from '@/integrations/supabase/client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleHomeClick = async () => {
    if (!user?.id_usuario) return;

    // Si es admin o admin_institucional, ir directamente a su dashboard
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }
    if (user.role === 'admin_institucional') {
      navigate('/institution/dashboard');
      return;
    }

    // Solo verificar documentos y registro para usuarios normales
    if (user.role === 'usuario') {
      // Verificar documentos
      const { data: documents } = await supabase
        .from('documento')
        .select('id_usuario')
        .eq('id_usuario', user.id_usuario)
        .limit(1);

      if (!documents || documents.length === 0) {
        navigate('/document-verification');
        return;
      }

      // Verificar registro en institución
      const { data: registration } = await supabase
        .from('registro')
        .select('validacion')
        .eq('id_usuario', user.id_usuario)
        .limit(1);

      if (!registration || registration.length === 0) {
        navigate('/select-institution');
        return;
      }

      // Verificar estado de validación
      if (registration[0].validacion === 'pendiente') {
        navigate('/pending-validation');
        return;
      }
    }

    navigate('/dashboard');
  };

  // Menu items for passenger navigation
  const passengerItems = [
    {
      title: "Inicio",
      url: "/dashboard",
      icon: Home,
      onClick: () => {
        console.log('🔍 Inicio button clicked in sidebar');
        handleHomeClick();
      }
    },
    {
      title: "Iniciar viaje",
      url: "/start-trip",
      icon: Play,
    },
    {
      title: "Buscar rutas",
      url: "/search-routes",
      icon: Search,
    },
    {
      title: "Historial de viajes",
      url: "/my-trips",
      icon: History,
    },
    {
      title: "Rutas favoritas",
      url: "/favorite-routes",
      icon: Heart,
    },
  ];

  // Menu items for driver navigation
  const driverItems = [
    {
      title: "Inicio",
      url: "/driver/dashboard",
      icon: Home,
      onClick: handleHomeClick
    },
    {
      title: "Crear viaje",
      url: "/driver/create-trip",
      icon: Plus,
    },
    {
      title: "Historial de viajes",
      url: "/driver/history",
      icon: History,
    },
    {
      title: "Mis Vehículos",
      url: "/driver/vehicles",
      icon: Car,
    },
  ];

  // Detectar si estamos en vista de conductor basándose en la URL
  const isDriverView = location.pathname.startsWith('/driver')

  // Determinar qué items mostrar según la vista actual
  const items = isDriverView ? driverItems : passengerItems
  const sectionTitle = isDriverView ? 'Conductor' : 'Pasajero'

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación - {sectionTitle}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} onClick={item.onClick}>
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
