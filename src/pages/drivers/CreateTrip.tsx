import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, AlertTriangle, Save, Loader2, Plus } from "lucide-react";
import DriverRouteMap from '../../components/maps/DriverRouteMap';
import { useState, useEffect } from 'react';
import { useRouteManager } from '../../hooks/useRouteManager';
import { useViajeManager } from '../../hooks/useViajeManager';
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { supabase } from '../../integrations/supabase/client';
import { GeocodingService, Location } from '@/services/geocodingService';
import { RouteMap } from '@/components/map/RouteMap';

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
  address: string;
}

interface RutaExistente {
  id_ruta: number;
  longitud: number;
  punto_partida?: any;
  punto_llegada?: any;
  trayecto?: any;
}

interface CoordenadaPoint {
  x: number;
  y: number;
}

interface RutaDetalle {
  id_ruta: number;
  longitud: number;
  origen_coords: CoordenadaPoint;
  destino_coords: CoordenadaPoint;
  trayecto_coords: CoordenadaPoint[];
}

const CreateTrip = () => {
  // Estados para nueva ruta
  const [currentRoute, setCurrentRoute] = useState<{
    origin: RoutePoint | null;
    destination: RoutePoint | null;
    path: [number, number][];
  }>({
    origin: null,
    destination: null,
    path: []
  });

  // Estados para viaje
  const [modoCreacion, setModoCreacion] = useState<'seleccionar' | 'nueva'>('seleccionar');
  const [rutaSeleccionada, setRutaSeleccionada] = useState<number | null>(null);
  const [rutasDisponibles, setRutasDisponibles] = useState<RutaExistente[]>([]);
  const [rutaSeleccionadaDetalle, setRutaSeleccionadaDetalle] = useState<any>(null);
  
  // Datos del viaje
  const [fecha, setFecha] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [horaLlegada, setHoraLlegada] = useState('');
  const [vehiculo, setVehiculo] = useState('');

  const { saveRoute, isLoading: isLoadingRoute } = useRouteManager();
  const { fetchRutasDisponibles, crearViaje, isLoading: isLoadingViaje } = useViajeManager();
  const { toast } = useToast();
  const { currentUserId, isLoading: isLoadingUser } = useCurrentUser();

  // Cargar rutas disponibles al montar el componente
  useEffect(() => {
    const cargarRutas = async () => {
      try {
        const rutas = await fetchRutasDisponibles();
        setRutasDisponibles(rutas);
      } catch (error) {
        console.error('Error cargando rutas:', error);
      }
    };
    cargarRutas();
  }, []);

  // Modificar el useEffect para manejar el cambio de modo
  useEffect(() => {
    // Limpiar el estado cuando se cambia el modo
    if (modoCreacion === 'nueva') {
      setRutaSeleccionada(null);
      setRutaSeleccionadaDetalle(null);
      setCurrentRoute({
        origin: null,
        destination: null,
        path: []
      });
    } else {
      // Si cambia a modo 'seleccionar', limpiar la ruta actual
      setCurrentRoute({
        origin: null,
        destination: null,
        path: []
      });
    }
  }, [modoCreacion]);

  // Modificar el useEffect para cargar la ruta seleccionada
  useEffect(() => {
    const cargarDetalleRuta = async () => {
      if (!rutaSeleccionada || modoCreacion !== 'seleccionar') {
        setRutaSeleccionadaDetalle(null);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('obtener_ruta_con_coordenadas', {
          p_id_ruta: rutaSeleccionada
        });

        if (error) throw error;
        if (data && data.length > 0) {
          const rutaDetalle = data[0] as unknown as RutaDetalle;
          setRutaSeleccionadaDetalle(rutaDetalle);

          // Actualizar currentRoute con los datos de la ruta seleccionada
          setCurrentRoute({
            origin: {
              lat: rutaDetalle.origen_coords.y,
              lng: rutaDetalle.origen_coords.x,
              label: 'Origen',
              address: 'Punto de origen'
            },
            destination: {
              lat: rutaDetalle.destino_coords.y,
              lng: rutaDetalle.destino_coords.x,
              label: 'Destino',
              address: 'Punto de destino'
            },
            path: rutaDetalle.trayecto_coords.map((coord: any) => [coord.y, coord.x])
          });
        }
      } catch (error) {
        console.error('Error cargando detalle de ruta:', error);
        toast({
          title: "❌ Error",
          description: "No se pudo cargar el detalle de la ruta",
          variant: "destructive",
        });
      }
    };

    cargarDetalleRuta();
  }, [rutaSeleccionada, modoCreacion]);

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

  const handleCrearViaje = async () => {
    // Validación del usuario actual
    if (!currentUserId) {
      toast({
        title: "❌ Error de autenticación",
        description: "No se pudo identificar el usuario actual",
        variant: "destructive",
      });
      return;
    }

    console.log('🔍 DEBUG - currentUserId actual:', currentUserId);

    // Validaciones existentes
    if (!fecha || !horaSalida || !horaLlegada || !vehiculo) {
      toast({
        title: "❌ Campos requeridos",
        description: "Por favor completa todos los campos del viaje",
        variant: "destructive",
      });
      return;
    }

    if (modoCreacion === 'seleccionar' && !rutaSeleccionada) {
      toast({
        title: "❌ Selecciona una ruta",
        description: "Debes seleccionar una ruta existente",
        variant: "destructive",
      });
      return;
    }

    if (modoCreacion === 'nueva' && !currentRoute) {
      toast({
        title: "❌ Crea una ruta",
        description: "Debes crear una ruta nueva en el mapa",
        variant: "destructive",
      });
      return;
    }

    try {
      let idRutaAUsar: number;

      // Si es modo nueva ruta, primero guardar la ruta
      if (modoCreacion === 'nueva' && currentRoute) {
        console.log('Creando nueva ruta...');
        const rutaNueva = await saveRoute({
          origin: currentRoute.origin,
          destination: currentRoute.destination,
          path: currentRoute.path,
          driverId: currentUserId
        });
        
        console.log('Ruta creada:', rutaNueva);
        idRutaAUsar = rutaNueva.id_ruta;
        
      } else if (modoCreacion === 'seleccionar' && rutaSeleccionada) {
        console.log('Usando ruta existente:', rutaSeleccionada);
        idRutaAUsar = rutaSeleccionada;
        
      } else {
        throw new Error('No se pudo determinar la ruta a usar');
      }

      console.log('ID de ruta a usar:', idRutaAUsar);

      if (!idRutaAUsar) {
        throw new Error('ID de ruta inválido');
      }

      // Crear el viaje CON VALIDACIONES
      console.log('Creando viaje...');
      const viajeCreado = await crearViaje({
        id_ruta: idRutaAUsar,
        id_conductor: currentUserId,
        id_vehiculo: vehiculo,
        fecha: fecha,
        hora_salida: horaSalida,
        hora_llegada: horaLlegada
      });

      console.log('Viaje creado:', viajeCreado);

      toast({
        title: "✅ Viaje creado",
        description: `El viaje se ha programado exitosamente para el ${fecha}`,
      });

      // Limpiar formulario
      setCurrentRoute({
        origin: null,
        destination: null,
        path: []
      });
      setRutaSeleccionada(null);
      setFecha('');
      setHoraSalida('');
      setHoraLlegada('');
      setVehiculo('');

      // Recargar rutas disponibles
      const rutasActualizadas = await fetchRutasDisponibles();
      setRutasDisponibles(rutasActualizadas);

    } catch (error) {
      console.error('Error completo creando viaje:', error);
      toast({
        title: "❌ Error",
        description: `No se pudo crear el viaje: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingRoute || isLoadingViaje || isLoadingUser;

  // Mostrar loading si está cargando el usuario
  if (isLoadingUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Cargando datos del usuario...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentUserId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <span className="ml-2 text-red-600">No se pudo identificar el usuario actual</span>
        </div>
      </DashboardLayout>
    );
  }

  // Handle current location change
  const handleCurrentLocationChange = (location: Location) => {
    if (!currentRoute) {
      setCurrentRoute({
        origin: {
          lat: location.lat,
          lng: location.lng,
          label: location.address,
          address: location.address
        },
        destination: { lat: 0, lng: 0, label: '', address: '' },
        path: []
      });
    }
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number, isRightClick: boolean = false) => {
    try {
      const location = await GeocodingService.reverseGeocode(lat, lng);
      if (!location) return;

      if (isRightClick) {
        // Right click sets origin
        setCurrentRoute(prev => ({
          origin: {
            lat: location.lat,
            lng: location.lng,
            label: location.address,
            address: location.address
          },
          destination: null,
          path: []
        }));
      } else {
        // Left click sets destination
        if (!currentRoute.origin) {
          toast({
            title: "Aviso",
            description: "Primero debes establecer el origen (clic derecho)",
            variant: "default",
          });
          return;
        }
        
        setCurrentRoute(prev => ({
          ...prev,
          destination: {
            lat: location.lat,
            lng: location.lng,
            label: location.address,
            address: location.address
          }
        }));

        // Generar ruta automáticamente si tenemos origen y destino
        if (currentRoute.origin) {
          try {
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${currentRoute.origin.lng},${currentRoute.origin.lat};${location.lng},${location.lat}?overview=full&geometries=geojson`
            );
            
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
              const coordinates = data.routes[0].geometry.coordinates;
              const routeCoords: [number, number][] = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
              
              setCurrentRoute(prev => ({
                ...prev,
                path: routeCoords
              }));
            }
          } catch (error) {
            console.error('Error generando la ruta:', error);
            toast({
              title: "Error",
              description: "No se pudo generar la ruta",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('Error handling map click:', error);
      toast({
        title: "Error",
        description: "No se pudo establecer la ubicación",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
        {/* Header más compacto */}
        <div className="px-4 py-2 border-b bg-white">
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Car className="w-6 h-6" />
            Crear Viaje
          </h1>
          <p className="text-gray-600 text-xs mt-0.5">
            Programa un nuevo viaje seleccionando una ruta existente o creando una nueva
          </p>
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] overflow-hidden">
          {/* Panel de configuración del viaje - más compacto */}
          <div className="bg-gray-50 p-3 overflow-y-auto border-r">
            <div className="space-y-2">
              {/* Modo de creación más compacto */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h2 className="text-base font-semibold mb-2">Modo de Creación</h2>
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modo"
                        value="seleccionar"
                        checked={modoCreacion === 'seleccionar'}
                        onChange={(e) => setModoCreacion(e.target.value as 'seleccionar' | 'nueva')}
                        className="w-4 h-4 text-primary"
                      />
                      <span>Usar ruta existente</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modo"
                        value="nueva"
                        checked={modoCreacion === 'nueva'}
                        onChange={(e) => setModoCreacion(e.target.value as 'seleccionar' | 'nueva')}
                        className="w-4 h-4 text-primary"
                      />
                      <span>Crear nueva ruta</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Selección de ruta existente */}
              {modoCreacion === 'seleccionar' && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-3">Ruta Existente</h2>
                  <Select 
                    value={rutaSeleccionada?.toString() || ''} 
                    onValueChange={(value) => setRutaSeleccionada(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una ruta" />
                    </SelectTrigger>
                    <SelectContent>
                      {rutasDisponibles.map((ruta) => (
                        <SelectItem key={ruta.id_ruta} value={ruta.id_ruta.toString()}>
                          Ruta #{ruta.id_ruta} ({ruta.longitud.toFixed(2)} km)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Información de nueva ruta */}
              {modoCreacion === 'nueva' && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-3">Nueva Ruta</h2>
                  {currentRoute.origin && currentRoute.destination ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>Origen:</strong> {currentRoute.origin.label}</p>
                      <p><strong>Destino:</strong> {currentRoute.destination.label}</p>
                      <p className="text-green-600">✓ Ruta generada correctamente</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Usa el mapa para crear una nueva ruta
                    </p>
                  )}
                </div>
              )}

              {/* Detalles del viaje más compactos */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h2 className="text-base font-semibold mb-2">Detalles del Viaje</h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <Input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de salida
                    </label>
                    <Input
                      type="time"
                      value={horaSalida}
                      onChange={(e) => setHoraSalida(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora estimada de llegada
                    </label>
                    <Input
                      type="time"
                      value={horaLlegada}
                      onChange={(e) => setHoraLlegada(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehículo (ID)
                    </label>
                    <Input
                      type="text"
                      value={vehiculo}
                      onChange={(e) => setVehiculo(e.target.value)}
                      placeholder="Ingresa el ID del vehículo"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Botón de crear viaje */}
              <Button 
                onClick={handleCrearViaje}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando viaje...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Viaje
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Contenedor del mapa */}
          <div className="relative h-[calc(100vh-10rem)]" style={{ zIndex: 0 }}>
            <RouteMap 
              origin={currentRoute.origin}
              destination={currentRoute.destination}
              route={currentRoute.path}
              onMapClick={modoCreacion === 'nueva' ? handleMapClick : undefined}
              allowClickToSetPoints={modoCreacion === 'nueva'}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTrip; 