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

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

interface RutaExistente {
  id_ruta: number;
  longitud: number;
}

const CreateTrip = () => {
  // Estados para nueva ruta
  const [currentRoute, setCurrentRoute] = useState<{
    origin: RoutePoint;
    destination: RoutePoint;
    path: [number, number][];
  } | null>(null);

  // Estados para viaje
  const [modoCreacion, setModoCreacion] = useState<'seleccionar' | 'nueva'>('seleccionar');
  const [rutaSeleccionada, setRutaSeleccionada] = useState<number | null>(null);
  const [rutasDisponibles, setRutasDisponibles] = useState<RutaExistente[]>([]);
  
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
        hora_llegada: horaLlegada,
        reseña: 1
      });

      console.log('Viaje creado:', viajeCreado);

      toast({
        title: "✅ Viaje creado",
        description: `El viaje se ha programado exitosamente para el ${fecha}`,
      });

      // Limpiar formulario
      setCurrentRoute(null);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-2">
            <Car className="w-8 h-8" />
            Crear Viaje
          </h1>
          <p className="text-gray-600 mt-2">
            Programa un nuevo viaje seleccionando una ruta existente o creando una nueva
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuración del viaje */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selección de modo */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Modo de Creación</h2>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center space-x-2">
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
                  <label className="flex items-center space-x-2">
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
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Ruta Existente</h2>
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
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Nueva Ruta</h2>
                {currentRoute ? (
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

            {/* Detalles del viaje */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Detalles del Viaje</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <Input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
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
                  />
                </div>
              </div>
            </div>

            {/* Botón de crear viaje */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
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

          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-[800px]">
              <DriverRouteMap 
                onRouteGenerated={handleRouteGenerated}
                key={modoCreacion} // Force re-render when mode changes
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTrip; 