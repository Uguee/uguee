
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import RouteMap from '../components/RouteMap';
import { useRouteDetail } from '../hooks/useRouteDetail';
import { useToast } from '@/hooks/use-toast';

const RouteDetail = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passengerCount, setPassengerCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  
  const { 
    route, 
    driver, 
    vehicle, 
    userTrip, 
    isLoading, 
    error,
    bookTrip,
    cancelTrip
  } = useRouteDetail(routeId);
  
  const handleBookTrip = async () => {
    if (!route) return;
    
    if (passengerCount > route.availableSeats) {
      toast({
        title: "Error de reserva",
        description: `Solo hay ${route.availableSeats} asientos disponibles.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsBooking(true);
    
    try {
      await bookTrip(passengerCount);
      toast({
        title: "¡Reserva exitosa!",
        description: "Tu viaje ha sido confirmado.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo procesar tu reserva. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };
  
  const handleCancelTrip = async () => {
    if (!userTrip) return;
    
    setIsBooking(true);
    
    try {
      await cancelTrip();
      toast({
        title: "Reserva cancelada",
        description: "Tu reserva ha sido cancelada exitosamente.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo cancelar tu reserva. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };
  
  const formatTime = (isoDate?: string) => {
    if (!isoDate) return 'N/A';
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return 'N/A';
    }
  };
  
  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'N/A';
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch (err) {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando información de la ruta...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !route) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error || "No se encontró la información de esta ruta."}
          </div>
          <Link 
            to="/search-routes" 
            className="text-primary hover:underline"
          >
            ← Volver a la búsqueda
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          to="/search-routes" 
          className="text-primary hover:underline inline-flex items-center mb-6"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Volver a rutas
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-text">
                  Detalles de la ruta
                </h1>
                <div className="bg-primary/10 text-primary py-1 px-3 rounded-full text-sm font-medium">
                  {route.transportType === 'car' && 'Carro compartido'}
                  {route.transportType === 'bus' && 'Bus'}
                  {route.transportType === 'bike' && 'Bicicleta'}
                  {route.transportType === 'walk' && 'A pie'}
                </div>
              </div>
              
              {/* Origin & Destination */}
              <div className="mb-6">
                <div className="relative pl-8 mb-4">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <h3 className="font-medium text-text">Origen</h3>
                    <p className="text-gray-600">{route.origin.name}</p>
                  </div>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    B
                  </div>
                  <div>
                    <h3 className="font-medium text-text">Destino</h3>
                    <p className="text-gray-600">{route.destination.name}</p>
                  </div>
                </div>
              </div>
              
              {/* Stops */}
              {route.stops && route.stops.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-text mb-2">Paradas</h3>
                  <ul className="list-disc list-inside text-gray-600 pl-4">
                    {route.stops.map((stop, i) => (
                      <li key={i}>{stop.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Time Details */}
              <div className="mb-6">
                <h3 className="font-medium text-text mb-2">Horario</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium capitalize">{formatDate(route.departureTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hora de salida</p>
                      <p className="font-medium">{formatTime(route.departureTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Llegada estimada</p>
                      <p className="font-medium">{formatTime(route.estimatedArrivalTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="font-medium capitalize">
                          {route.status === 'active' ? 'Activa' : 
                           route.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="mb-6">
                <h3 className="font-medium text-text mb-2">Mapa de ruta</h3>
                <RouteMap route={route} className="h-64 lg:h-80 w-full" />
              </div>
            </div>
          </div>
          
          {/* Sidebar: Driver & Vehicle Info + Booking */}
          <div className="space-y-6">
            {/* Driver Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-text mb-4">Información del conductor</h2>
              
              {driver ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                      <div className="flex items-center text-sm">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 text-yellow-500 mr-1" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                          />
                        </svg>
                        <span>{driver.rating} ({driver.reviewCount} reseñas)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  No hay información disponible sobre el conductor.
                </p>
              )}
            </div>
            
            {/* Vehicle Info */}
            {vehicle && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-text mb-4">Vehículo</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modelo:</span>
                    <span className="font-medium">{vehicle.model} ({vehicle.year})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placa:</span>
                    <span className="font-medium">{vehicle.licensePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacidad:</span>
                    <span className="font-medium">{vehicle.capacity} pasajeros</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Booking Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-text mb-4">Reserva</h2>
              
              {userTrip && userTrip.status !== 'cancelled' ? (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <div className="flex items-start">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <div>
                        <h3 className="font-medium text-green-800">¡Reserva confirmada!</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Has reservado {userTrip.passengerCount} asiento{userTrip.passengerCount > 1 ? 's' : ''} para este viaje.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCancelTrip}
                    disabled={isBooking}
                    className="w-full border border-red-500 text-red-500 hover:bg-red-50 py-2 rounded-md transition-colors"
                  >
                    {isBooking ? 'Procesando...' : 'Cancelar reserva'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">{route.availableSeats}</span> de 
                      <span className="font-medium"> {route.capacity}</span> asientos disponibles
                    </p>
                    
                    <div className="flex items-center">
                      <button 
                        onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-600 rounded-l-md"
                        disabled={passengerCount <= 1}
                      >
                        -
                      </button>
                      <div className="px-4 py-1 border-t border-b border-gray-300 min-w-[40px] text-center">
                        {passengerCount}
                      </div>
                      <button 
                        onClick={() => setPassengerCount(Math.min(route.availableSeats, passengerCount + 1))}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-600 rounded-r-md"
                        disabled={passengerCount >= route.availableSeats}
                      >
                        +
                      </button>
                      <span className="ml-2 text-gray-600">
                        pasajero{passengerCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBookTrip}
                    disabled={isBooking || route.availableSeats < 1}
                    className={`w-full ${
                      route.availableSeats < 1 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary hover:bg-gradient-primary'
                    } text-white py-3 rounded-md transition-colors`}
                  >
                    {isBooking ? 'Procesando...' : 'Confirmar reserva'}
                  </button>
                  
                  {route.availableSeats < 1 && (
                    <p className="text-sm text-red-600 mt-2">
                      Lo sentimos, este viaje está completo.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RouteDetail;
