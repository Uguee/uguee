import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { TripRequest, TripRequestService } from "@/services/tripRequestService"
import { useToast } from "@/hooks/use-toast"
import { RouteMap } from "@/components/map/RouteMap"
import { supabase } from "@/integrations/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Helper function to extract coordinates from GeoJSON point
const extractCoordinates = (point: any): { lat: number; lng: number } | null => {
  if (!point) return null;
  try {
    if (point.coordinates) {
      return {
        lng: point.coordinates[0],
        lat: point.coordinates[1]
      };
    }
  } catch (error) {
    console.error('Error parsing coordinates:', error);
  }
  return null;
};

type RequestAction = 'aceptada' | 'rechazada';

export default function TripRequests() {
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TripRequest | null>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await TripRequestService.getPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes de viaje",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserVehicles = async (userId: number) => {
    try {
      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .eq('id_usuario', userId);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive",
      });
    }
  };

  const handleRequestAction = async (requestId: number, action: RequestAction) => {
    try {
      if (action === 'aceptada') {
        // Get current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select('id_usuario')
          .eq('uuid', user.id)
          .single();

        if (userError || !userData) throw new Error('No se encontró información del conductor');

        // Fetch user's vehicles and show selection dialog
        await fetchUserVehicles(userData.id_usuario);
        setSelectedRequest(requests.find(r => r.id_solicitud === requestId) || null);
        setShowVehicleDialog(true);
        return;
      } else {
        // For rejected requests, just update the status
        const { error } = await supabase
          .from('solicitud_viaje')
          .update({ estado: action })
          .eq('id_solicitud', requestId);

        if (error) throw error;
      }

      toast({
        title: "Éxito",
        description: `Solicitud ${(action as string) === 'aceptada' ? 'aceptada' : 'rechazada'} correctamente`,
      });
      // Refresh the requests list
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleVehicleSelect = async () => {
    if (!selectedVehicle || !selectedRequest) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('uuid', user.id)
        .single();

      if (userError || !userData) throw new Error('No se encontró información del conductor');

      // Update request with driver and vehicle info
      const { error } = await supabase
        .from('solicitud_viaje')
        .update({
          estado: 'aceptada',
          id_conductor: userData.id_usuario,
          id_vehiculo: selectedVehicle
        })
        .eq('id_solicitud', selectedRequest.id_solicitud);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Solicitud aceptada correctamente",
      });

      setShowVehicleDialog(false);
      setSelectedVehicle(null);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "No se pudo aceptar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleViewRoute = async (request: TripRequest) => {
    try {
      setSelectedRequest(request);
      const { data, error } = await supabase
        .rpc('obtener_ruta_con_coordenadas', {
          p_id_ruta: request.ruta.id_ruta
        });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setRouteDetails(data[0]);
      } else {
        toast({
          title: "Error",
          description: "No se pudo encontrar la ruta",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la ruta",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Solicitudes de Viaje</h1>
          <div className="flex gap-2">
            <Button variant="outline">Filtrar</Button>
            <Button variant="outline">Ordenar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border overflow-hidden" style={{ height: '600px' }}>
            <RouteMap 
              origin={routeDetails ? {
                lat: routeDetails.origen_coords.y,
                lng: routeDetails.origen_coords.x,
                address: "Origen"
              } : null}
              destination={routeDetails ? {
                lat: routeDetails.destino_coords.y,
                lng: routeDetails.destino_coords.x,
                address: "Destino"
              } : null}
              route={routeDetails?.trayecto_coords?.map((coord: any) => [coord.y, coord.x]) || null}
              allowClickToSetPoints={false}
            />
          </div>

          {/* Requests List */}
          <div className="lg:col-span-1">
            <ScrollArea className="h-[600px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay solicitudes de viaje pendientes
                </div>
              ) : (
                <div className="grid gap-4">
                  {requests.map((request) => {
                    const startCoords = extractCoordinates(request.punto_partida);
                    const endCoords = extractCoordinates(request.punto_llegada);
                    
                    return (
                      <Card 
                        key={request.id_solicitud}
                        className={`cursor-pointer transition-all ${
                          selectedRequest?.id_solicitud === request.id_solicitud 
                            ? 'ring-2 ring-primary' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleViewRoute(request)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>
                                {request.pasajero_nombre} {request.pasajero_apellido}
                              </CardTitle>
                              <CardDescription>
                                {request.fecha} - {request.hora_salida}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {request.estado}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Origen</p>
                                <p className="text-sm text-muted-foreground">
                                  {startCoords ? `${startCoords.lat.toFixed(6)}, ${startCoords.lng.toFixed(6)}` : 'No disponible'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Destino</p>
                                <p className="text-sm text-muted-foreground">
                                  {endCoords ? `${endCoords.lat.toFixed(6)}, ${endCoords.lng.toFixed(6)}` : 'No disponible'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Distancia</p>
                                <p className="text-sm text-muted-foreground">
                                  {request.longitud ? `${(request.longitud / 1000).toFixed(1)} km` : 'No disponible'}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRequestAction(request.id_solicitud, 'rechazada');
                                }}
                              >
                                Rechazar
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRequestAction(request.id_solicitud, 'aceptada');
                                }}
                              >
                                Aceptar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Vehicle Selection Dialog */}
        <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Seleccionar Vehículo</DialogTitle>
              <DialogDescription>
                Elige el vehículo que utilizarás para este viaje
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {vehicles.map((vehicle) => (
                <Card
                  key={vehicle.placa}
                  className={`cursor-pointer transition-all ${
                    selectedVehicle === vehicle.placa
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedVehicle(vehicle.placa)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Placa: {vehicle.placa}</h4>
                        <p className="text-sm text-muted-foreground">
                          Modelo: {vehicle.modelo} | Color: {vehicle.color}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVehicleDialog(false);
                  setSelectedVehicle(null);
                  setSelectedRequest(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleVehicleSelect}
                disabled={!selectedVehicle}
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
} 