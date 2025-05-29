import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Coordenadas de Cali
const CALI_CENTER: [number, number] = [3.4516, -76.5320];

// Tipo para los puntos seleccionados
interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

interface DriverRouteMapProps {
  className?: string;
  onRouteGenerated?: (origin: RoutePoint, destination: RoutePoint, route: [number, number][]) => void;
}

// Componente para manejar los clics en el mapa
const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const DriverRouteMap: React.FC<DriverRouteMapProps> = ({ 
  className = "", 
  onRouteGenerated 
}) => {
  const [origin, setOrigin] = useState<RoutePoint | null>(null);
  const [destination, setDestination] = useState<RoutePoint | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);

  // Función para manejar clics en el mapa
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (!origin) {
      // Primer clic: establecer origen
      const newOrigin: RoutePoint = {
        lat,
        lng,
        label: 'Origen'
      };
      setOrigin(newOrigin);
      setDestination(null);
      setRoute(null);
    } else if (!destination) {
      // Segundo clic: establecer destino y generar ruta
      const newDestination: RoutePoint = {
        lat,
        lng,
        label: 'Destino'
      };
      setDestination(newDestination);
      
      // Generar ruta automáticamente
      await generateRoute(origin, newDestination);
    } else {
      // Tercer clic: reiniciar y establecer nuevo origen
      const newOrigin: RoutePoint = {
        lat,
        lng,
        label: 'Origen'
      };
      setOrigin(newOrigin);
      setDestination(null);
      setRoute(null);
    }
  }, [origin, destination]);

  // Función para generar la ruta usando OpenRouteService (gratuito)
  const generateRoute = async (start: RoutePoint, end: RoutePoint) => {
    setIsGeneratingRoute(true);
    try {
      // Usamos OSRM (Open Source Routing Machine) que es gratuito
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        // Convertir de [lng, lat] a [lat, lng] para Leaflet
        const routeCoords: [number, number][] = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        
        setRoute(routeCoords);
        
        // Notificar al componente padre si se proporciona callback
        if (onRouteGenerated) {
          onRouteGenerated(start, end, routeCoords);
        }
      }
    } catch (error) {
      console.error('Error generando la ruta:', error);
      alert('Error al generar la ruta. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingRoute(false);
    }
  };

  // Iconos personalizados para origen y destino
  const originIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="relative w-full h-full">
      {/* Instrucciones */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] max-w-xs">
        <h3 className="font-medium text-sm mb-2">📍 Crear Ruta</h3>
        {!origin && (
          <p className="text-xs text-gray-600">1. Haz clic para seleccionar el origen</p>
        )}
        {origin && !destination && (
          <p className="text-xs text-gray-600">2. Haz clic para seleccionar el destino</p>
        )}
        {origin && destination && !isGeneratingRoute && (
          <p className="text-xs text-green-600">✅ Ruta generada. Clic para reiniciar</p>
        )}
        {isGeneratingRoute && (
          <p className="text-xs text-blue-600">🔄 Generando ruta...</p>
        )}
      </div>

      <MapContainer
        center={CALI_CENTER}
        zoom={13}
        className={`w-full h-full ${className}`}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Componente para manejar clics */}
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Marcador de origen */}
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              🟢 {origin.label}<br />
              Lat: {origin.lat.toFixed(6)}<br />
              Lng: {origin.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}
        
        {/* Marcador de destino */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              🔴 {destination.label}<br />
              Lat: {destination.lat.toFixed(6)}<br />
              Lng: {destination.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}
        
        {/* Línea de la ruta */}
        {route && (
          <Polyline 
            positions={route} 
            color="blue" 
            weight={5}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default DriverRouteMap; 