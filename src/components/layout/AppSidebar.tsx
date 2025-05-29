import { 
  Calendar, 
  Home, 
  Search, 
  History, 
  Heart, 
  AlertTriangle,
  Map,
  Car,
  Plus
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

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

// Menu items for passenger navigation
const passengerItems = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
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
    title: "Incidentes",
    url: "/incidents",
    icon: AlertTriangle,
  },
  {
    title: "Ver mapa",
    url: "/map",
    icon: Map,
  },
  {
    title: "Rutas favoritas",
    url: "/favorite-routes",
    icon: Heart,
  },
]

// Menu items for driver navigation
const driverItems = [
  {
    title: "Dashboard",
    url: "/driver/dashboard",
    icon: Home,
  },
  {
    title: "Crear viaje",
    url: "/driver/create-trip",
    icon: Plus,
  },
  {
    title: "Mapa conductor",
    url: "/driver/map",
    icon: Map,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  // Determinar qué items mostrar según el rol
  const getMenuItems = () => {
    switch (user?.role) {
      case 'conductor':
        return driverItems
      case 'pasajero':
      default:
        return passengerItems
    }
  }

  const items = getMenuItems()
  const sectionTitle = user?.role === 'conductor' ? 'Conductor' : 'Pasajero'

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
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
