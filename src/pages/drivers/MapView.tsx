// src/pages/drivers/MapView.tsx
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Car, AlertTriangle, Save, Loader2 } from "lucide-react";
import DriverRouteMap from '../../components/maps/DriverRouteMap';
import { useState } from 'react';
import { useRouteManager } from '../../hooks/useRouteManager';
import { useToast } from "@/hooks/use-toast";

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

const MapView = () => {
  const [currentRoute, setCurrentRoute] = useState<{
    origin: RoutePoint;
    destination: RoutePoint;
    path: [number, number][];
  } | null>(null);

  const { saveRoute, isLoading } = useRouteManager();
  const { toast } = useToast();

  const handleRouteGenerated = (
    origin: RoutePoint, 
    destination: RoutePoint, 
    route: [number, number][]
  ) => {
    setCurrentRoute({
      origin,
      destination,
      path: route
    });
  };

  const handleSaveRoute = async () => {
    if (!currentRoute) return;
    
    try {
      // Por ahora usamos un ID de conductor ficticio
      // En una implementación real, obtendrías esto del contexto de autenticación
      const driverId = 1;

      await saveRoute({
        origin: currentRoute.origin,
        destination: currentRoute.destination,
        path: currentRoute.path,
        driverId
      });

      toast({
        title: "✅ Ruta guardada",
        description: "La ruta se ha guardado exitosamente en la base de datos",
      });

      // Limpiar la ruta actual después de guardar
      setCurrentRoute(null);

    } catch (error) {
      console.error('Error guardando ruta:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo guardar la ruta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con título y botones de acción */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text">Crear Ruta</h1>
            <p className="text-gray-600 mt-2">
              Selecciona origen y destino en el mapa para crear una nueva ruta
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reportar Incidente
            </Button>
            
            {currentRoute && (
              <Button 
                onClick={handleSaveRoute}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar Ruta
              </Button>
            )}
            
            <Button className="bg-green-600 hover:bg-green-700">
              <Car className="w-4 h-4 mr-2" />
              Iniciar Ruta
            </Button>
          </div>
        </div>

        {/* Contenedor del mapa */}
        <div className="bg-white p-2 rounded-lg shadow-sm border">
          <div className="w-full h-[600px] rounded-lg overflow-hidden">
            <DriverRouteMap onRouteGenerated={handleRouteGenerated} />
          </div>
        </div>

        {/* Panel de información de la ruta actual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-medium text-lg mb-4">Información de la Ruta</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Origen</p>
                <p className="font-medium">
                  {currentRoute ? `${currentRoute.origin.lat.toFixed(4)}, ${currentRoute.origin.lng.toFixed(4)}` : 'Sin seleccionar'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destino</p>
                <p className="font-medium">
                  {currentRoute ? `${currentRoute.destination.lat.toFixed(4)}, ${currentRoute.destination.lng.toFixed(4)}` : 'Sin seleccionar'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Puntos de la ruta</p>
                <p className="font-medium">{currentRoute ? currentRoute.path.length : 0} puntos</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Distancia estimada</p>
                <p className="font-medium">
                  {currentRoute ? `${(currentRoute.path.length * 0.1).toFixed(1)} km` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-medium text-lg mb-4">Estado</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Ruta</p>
                <p className="font-medium">
                  {currentRoute ? '✅ Generada' : '⏳ Pendiente'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Base de datos</p>
                <p className="font-medium">
                  {isLoading ? '🔄 Guardando...' : '💾 Listo para guardar'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacidad</p>
                <p className="font-medium">4 pasajeros</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-medium text-lg mb-4">Instrucciones</h3>
            <div className="space-y-2">
              <p className="text-xs text-gray-600">1. Haz clic en el mapa para seleccionar origen</p>
              <p className="text-xs text-gray-600">2. Haz clic nuevamente para seleccionar destino</p>
              <p className="text-xs text-gray-600">3. Se generará automáticamente la ruta</p>
              <p className="text-xs text-gray-600">4. Guarda la ruta en PostGIS</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MapView;