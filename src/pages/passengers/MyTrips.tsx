import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { TripService } from '@/services/tripService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { RouteMap } from '@/components/map/RouteMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';

const MyTrips = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { currentUserId } = useCurrentUser();
  const { toast } = useToast();
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [currentUserId]);

  const fetchTrips = async () => {
    if (!currentUserId) {
      setError('No se pudo identificar el usuario actual');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await TripService.getUserTrips(currentUserId);
      setTrips(data);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('No se pudieron cargar tus viajes. Por favor, intenta de nuevo más tarde.');
      toast({
        title: "Error",
        description: "No se pudieron cargar tus viajes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return 'Hora no disponible';
    try {
      return timeString.substring(0, 5); // Formato HH:mm
    } catch (error) {
      return 'Hora no disponible';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      return format(date, "EEEE d 'de' MMMM", { locale: es });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  // Filtrar viajes según la pestaña activa
  const filteredTrips = trips.filter(trip => {
    if (!trip?.fecha || !trip?.hora_salida) return false;
    try {
      const fechaHoraViaje = new Date(`${trip.fecha}T${trip.hora_salida}`);
      if (isNaN(fechaHoraViaje.getTime())) return false;
      const now = new Date();
      
      return activeTab === 'upcoming' 
        ? fechaHoraViaje > now  // Viajes futuros
        : fechaHoraViaje <= now; // Viajes pasados
    } catch (error) {
      return false;
    }
  });

  const handleCancelTrip = async (tripId: number) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('reserva')
        .delete()
        .eq('id_usuario', currentUserId)
        .eq('id_viaje', tripId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Viaje cancelado correctamente",
      });

      // Actualizar la lista de viajes
      fetchTrips();
    } catch (err) {
      console.error('Error al cancelar el viaje:', err);
      toast({
        title: "Error",
        description: "No se pudo cancelar el viaje",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (trip: any) => {
    try {
      const { data, error } = await supabase
        .rpc('obtener_ruta_con_coordenadas', {
          p_id_ruta: trip.id_ruta
        });

      if (error) throw error;

      if (data && data.length > 0) {
        setSelectedTrip({
          ...trip,
          routeDetails: data[0]
        });
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error al obtener detalles de la ruta:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la ruta",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Mis viajes</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pasados
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay viajes {activeTab === 'upcoming' ? 'próximos' : 'pasados'}</p>
              {activeTab === 'upcoming' && (
                <Link
                  to="/search-routes"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Buscar rutas
                </Link>
              )}
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div key={trip.id_viaje} className="bg-white rounded-lg shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">
                          {formatDate(trip.fecha)}
                        </span>
                        <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                          {activeTab === 'upcoming' ? 'Próximo' : 'Pasado'}
                        </span>
                      </div>
                      <h3 className="text-xl mt-2">
                        <span className="font-medium">Conductor:</span> {trip.conductor?.nombre} {trip.conductor?.apellido}
                      </h3>
                      <p className="text-gray-600">
                        Salida: {formatTime(trip.hora_salida)} | Llegada estimada: {formatTime(trip.hora_llegada)}
                      </p>
                      <p className="text-gray-600 mt-1">
                        <span className="font-medium">Vehículo:</span> {trip.vehiculo?.tipo?.tipo} {trip.vehiculo?.color} {trip.vehiculo?.modelo}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewDetails(trip)}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Ver detalles
                      </button>
                      {activeTab === 'upcoming' && (
                        <button
                          onClick={() => handleCancelTrip(trip.id_ruta)}
                          className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog para detalles del viaje */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del viaje</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Información del conductor</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nombre:</span> {selectedTrip.conductor?.nombre} {selectedTrip.conductor?.apellido}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedTrip.conductor?.celular}</p>
                  </div>

                  <h3 className="font-medium mb-4 mt-6">Información del viaje</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Fecha:</span> {formatDate(selectedTrip.fecha)}</p>
                    <p><span className="font-medium">Hora de salida:</span> {formatTime(selectedTrip.hora_salida)}</p>
                    <p><span className="font-medium">Hora estimada de llegada:</span> {formatTime(selectedTrip.hora_llegada)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-4">Información del vehículo</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Tipo:</span> {selectedTrip.vehiculo?.tipo?.tipo}</p>
                    <p><span className="font-medium">Color:</span> {selectedTrip.vehiculo?.color}</p>
                    <p><span className="font-medium">Modelo:</span> {selectedTrip.vehiculo?.modelo}</p>
                    <p><span className="font-medium">Placa:</span> {selectedTrip.vehiculo?.placa}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Ruta del viaje</h3>
                <div className="h-[300px] rounded-lg overflow-hidden">
                  <RouteMap
                    origin={selectedTrip.routeDetails?.origen_coords ? {
                      lat: selectedTrip.routeDetails.origen_coords.y,
                      lng: selectedTrip.routeDetails.origen_coords.x,
                      address: selectedTrip.routeDetails.origen_coords.address || "Origen"
                    } : null}
                    destination={selectedTrip.routeDetails?.destino_coords ? {
                      lat: selectedTrip.routeDetails.destino_coords.y,
                      lng: selectedTrip.routeDetails.destino_coords.x,
                      address: selectedTrip.routeDetails.destino_coords.address || "Destino"
                    } : null}
                    route={selectedTrip.routeDetails?.trayecto_coords?.map((coord: any) => [coord.y, coord.x]) || null}
                    allowClickToSetPoints={false}
                  />
                </div>
              </div>

              {activeTab === 'upcoming' && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      handleCancelTrip(selectedTrip.id_ruta);
                      setIsDialogOpen(false);
                    }}
                    className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-50"
                  >
                    Cancelar viaje
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyTrips;