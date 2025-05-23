
import { 
  Calendar, 
  Home, 
  Search, 
  History, 
  Heart, 
  AlertTriangle,
  Map
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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
const items = [
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

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Barra de navegación</SidebarGroupLabel>
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
