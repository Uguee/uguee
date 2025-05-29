// src/pages/drivers/MapView.tsx
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

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

interface RutaExistente {
  id_ruta: number;
  longitud: number;
}

const MapView = () => {
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
    // Validaciones
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
        console.log('Creando nueva ruta...'); // Debug
        const driverId = 1; // TODO: obtener del contexto de auth
        const rutaNueva = await saveRoute({
          origin: currentRoute.origin,
          destination: currentRoute.destination,
          path: currentRoute.path,
          driverId
        });
        
        console.log('Ruta creada:', rutaNueva); // Debug
        idRutaAUsar = rutaNueva.id_ruta; // Ahora accedemos directamente al ID
        
      } else if (modoCreacion === 'seleccionar' && rutaSeleccionada) {
        console.log('Usando ruta existente:', rutaSeleccionada); // Debug
        idRutaAUsar = rutaSeleccionada;
        
      } else {
        throw new Error('No se pudo determinar la ruta a usar');
      }

      console.log('ID de ruta a usar:', idRutaAUsar); // Debug

      if (!idRutaAUsar) {
        throw new Error('ID de ruta inválido');
      }

      // Crear el viaje
      console.log('Creando viaje...'); // Debug
      const viajeCreado = await crearViaje({
        id_ruta: idRutaAUsar,
        id_conductor: 1, // TODO: obtener del contexto de auth
        id_vehiculo: vehiculo,
        fecha: fecha,
        hora_salida: horaSalida,
        hora_llegada: horaLlegada,
        reseña: 1 // valor por defecto
      });

      console.log('Viaje creado:', viajeCreado); // Debug

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

  const isLoading = isLoadingRoute || isLoadingViaje;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text">Crear Viaje</h1>
            <p className="text-gray-600 mt-2">
              Programa un nuevo viaje seleccionando una ruta existente o creando una nueva
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reportar Incidente
            </Button>
            
            <Button 
              onClick={handleCrearViaje}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Car className="w-4 h-4 mr-2" />
              )}
              Crear Viaje
            </Button>
          </div>
        </div>

        {/* Formulario de viaje */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-medium text-lg mb-4">Información del Viaje</h3>
          
          {/* Selector de modo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ruta:</label>
            <div className="flex gap-4">
              <Button
                variant={modoCreacion === 'seleccionar' ? 'default' : 'outline'}
                onClick={() => setModoCreacion('seleccionar')}
                size="sm"
              >
                Usar Ruta Existente
              </Button>
              <Button
                variant={modoCreacion === 'nueva' ? 'default' : 'outline'}
                onClick={() => setModoCreacion('nueva')}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Crear Nueva Ruta
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Selector de ruta (solo si modo seleccionar) */}
            {modoCreacion === 'seleccionar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ruta:</label>
                <Select 
                  value={rutaSeleccionada?.toString() || ''} 
                  onValueChange={(value) => setRutaSeleccionada(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ruta" />
                  </SelectTrigger>
                  <SelectContent>
                    {rutasDisponibles.map((ruta) => (
                      <SelectItem key={ruta.id_ruta} value={ruta.id_ruta.toString()}>
                        Ruta #{ruta.id_ruta} - {ruta.longitud.toFixed(1)}km
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha:</label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Hora salida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Salida:</label>
              <Input
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
              />
            </div>

            {/* Hora llegada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Llegada:</label>
              <Input
                type="time"
                value={horaLlegada}
                onChange={(e) => setHoraLlegada(e.target.value)}
              />
            </div>

            {/* Vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehículo (Placa):</label>
              <Input
                type="text"
                placeholder="ABC123"
                value={vehiculo}
                onChange={(e) => setVehiculo(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
          </div>
        </div>

        {/* Mapa (solo si modo nueva ruta) */}
        {modoCreacion === 'nueva' && (
          <div className="bg-white p-2 rounded-lg shadow-sm border">
            <div className="w-full h-[600px] rounded-lg overflow-hidden">
              <DriverRouteMap onRouteGenerated={handleRouteGenerated} />
            </div>
          </div>
        )}

        {/* Estado */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-medium text-lg mb-4">Estado del Viaje</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Ruta</p>
              <p className="font-medium">
                {modoCreacion === 'seleccionar' 
                  ? (rutaSeleccionada ? `Ruta #${rutaSeleccionada}` : 'Sin seleccionar')
                  : (currentRoute ? '✅ Nueva ruta creada' : '⏳ Crear en el mapa')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha y Hora</p>
              <p className="font-medium">
                {fecha && horaSalida ? `${fecha} ${horaSalida}` : 'Sin programar'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vehículo</p>
              <p className="font-medium">{vehiculo || 'Sin asignar'}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MapView;