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
    if (user?.role === null) {
      navigate('/document-verification');
      return;
    }
    navigate('/dashboard');
  };

  // Menu items for passenger navigation
  const passengerItems = [
    {
      title: "Inicio",
      url: "/dashboard",
      icon: Home,
      onClick: handleHomeClick
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
