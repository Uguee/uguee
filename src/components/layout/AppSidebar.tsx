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
]

// Menu items for driver navigation
const driverItems = [
  {
    title: "Inicio",
    url: "/driver/dashboard",
    icon: Home,
  },
  {
    title: "Crear viaje",
    url: "/driver/create-trip",
    icon: Plus,
  },
  {
    title: "Historial de viajes",
    url: "/driver/historial-viajes",
    icon: History,
  },
  {
    title: "Mis Vehículos",
    url: "/driver/mis-vehiculos",
    icon: Car,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()

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
