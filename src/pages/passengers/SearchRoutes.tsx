import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterIcon } from "lucide-react";
import { useRoutes } from '@/hooks/useRoutes';
import { RouteMap } from '@/components/map/RouteMap';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { TripService, Trip } from "@/services/tripService";

const SearchRoutes = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const data = await TripService.getUpcomingTrips();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los viajes disponibles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // First try to parse as ISO string
      try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return format(date, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });
        }
      } catch (e) {
        // If ISO parsing fails, try to parse as custom format
        try {
          // Assuming the date is in format "YYYY-MM-DD HH:mm:ss"
          const date = parse(dateString, "yyyy-MM-dd HH:mm:ss", new Date());
          if (!isNaN(date.getTime())) {
            return format(date, "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });
          }
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
      return 'Fecha no disponible';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Viajes Disponibles</h1>
        </div>

        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origen:</label>
              <Input 
                placeholder="Tu ubicación"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destino:</label>
              <Input 
                placeholder="Carrera 86"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Elige tu medio de transporte preferido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Carro</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="bike">Bicicleta</SelectItem>
                <SelectItem value="walk">Caminar</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <RouteMap 
            origin={null}
            destination={null}
            route={null}
            allowClickToSetPoints={false}
          />
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : trips.length > 0 ? (
            trips.map((trip) => (
              <div
                key={trip.id_viaje}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">
                      {trip.conductor?.nombre} {trip.conductor?.apellido}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(trip.fecha + ' ' + trip.hora_salida)}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Teléfono:</span> {trip.conductor?.celular}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Vehículo:</span> {trip.vehiculo?.tipo.tipo} {trip.vehiculo?.color} {trip.vehiculo?.modelo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        toast({
                          title: "Próximamente",
                          description: "La funcionalidad de reserva estará disponible pronto",
                        });
                      }}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No hay viajes disponibles</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchRoutes; 