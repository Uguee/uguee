import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIncidents } from '@/hooks/useIncidents';
import { iconosIncidente } from './incidentIcons';

// Fix para los iconos de Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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
  existingRoute?: any; // Ruta existente de la base de datos
  mode?: 'seleccionar' | 'nueva'; // Modo de operación
  onMapClick?: (lat: number, lng: number, isRightClick: boolean) => void;
  showIncidents?: boolean; // Nueva prop
}

// Componente para manejar los clics en el mapa
const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number, isRightClick: boolean) => void;
  enabled: boolean;
}> = ({ onMapClick, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onMapClick(e.latlng.lat, e.latlng.lng, false);
      }
    },
    contextmenu: (e) => {
      e.originalEvent.preventDefault();
      if (enabled) {
        onMapClick(e.latlng.lat, e.latlng.lng, true);
      }
    },
  });
  return null;
};

// Componente para ajustar el mapa a los límites de la ruta
const FitBounds: React.FC<{ bounds: L.LatLngBounds }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
};

const DriverRouteMap: React.FC<DriverRouteMapProps> = ({ 
  className = "", 
  onRouteGenerated,
  existingRoute,
  mode = 'nueva',
  onMapClick,
  showIncidents = true // Por defecto mostrar incidentes
}) => {
  const [origin, setOrigin] = useState<RoutePoint | null>(null);
  const [destination, setDestination] = useState<RoutePoint | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [routeBounds, setRouteBounds] = useState<L.LatLngBounds | null>(null);
  const { incidents } = useIncidents();

  // Efecto para manejar la ruta existente
  useEffect(() => {
    if (existingRoute && mode === 'seleccionar') {
      console.log('Cargando ruta existente:', existingRoute);
      
      // Parsear los datos de la ruta existente
      if (existingRoute.origen_coords && existingRoute.destino_coords) {
        setOrigin({
          lat: existingRoute.origen_coords.y,
          lng: existingRoute.origen_coords.x,
          label: 'Origen'
        });
        
        setDestination({
          lat: existingRoute.destino_coords.y,
          lng: existingRoute.destino_coords.x,
          label: 'Destino'
        });
      }
      
      // Parsear el trayecto
      if (existingRoute.trayecto_coords) {
        const routeCoords: [number, number][] = existingRoute.trayecto_coords.map((coord: any) => 
          [coord.y, coord.x]
        );
        setRoute(routeCoords);
        
        // Calcular límites para ajustar el mapa
        const bounds = L.latLngBounds(routeCoords);
        setRouteBounds(bounds);
      }
    } else if (mode === 'nueva') {
      // Limpiar cuando se cambia a modo nueva
      setOrigin(null);
      setDestination(null);
      setRoute(null);
      setRouteBounds(null);
    }
  }, [existingRoute, mode]);

  // Función para manejar clics en el mapa
  const handleMapClick = useCallback(async (lat: number, lng: number, isRightClick: boolean) => {
    if (onMapClick) {
      onMapClick(lat, lng, isRightClick);
      return;
    }

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
  }, [origin, destination, onMapClick]);

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
        
        // Calcular límites para ajustar el mapa
        const bounds = L.latLngBounds(routeCoords);
        setRouteBounds(bounds);
        
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
  const originIcon = L.icon({
    ...DefaultIcon.options,
    className: 'origin-marker'
  });

  const destinationIcon = L.icon({
    ...DefaultIcon.options,
    className: 'destination-marker'
  });

  return (
    <div className="relative w-full h-full">
      {/* Instrucciones */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] max-w-xs">
        <h3 className="font-medium text-sm mb-2">
          {mode === 'seleccionar' ? '📍 Ruta Existente' : '📍 Crear Ruta'}
        </h3>
        {mode === 'seleccionar' && existingRoute && (
          <p className="text-xs text-green-600">✅ Mostrando ruta #{existingRoute.id_ruta}</p>
        )}
        {mode === 'nueva' && !origin && (
          <p className="text-xs text-gray-600">1. Haz clic derecho para seleccionar el origen</p>
        )}
        {mode === 'nueva' && origin && !destination && (
          <p className="text-xs text-gray-600">2. Haz clic izquierdo para seleccionar el destino</p>
        )}
        {mode === 'nueva' && origin && destination && !isGeneratingRoute && (
          <p className="text-xs text-green-600">✅ Ruta generada. Clic derecho para reiniciar</p>
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
        
        {/* Ajustar el mapa a los límites de la ruta si existe */}
        {routeBounds && <FitBounds bounds={routeBounds} />}
        
        {/* Componente para manejar clics solo en modo nueva */}
        <MapClickHandler onMapClick={handleMapClick} enabled={mode === 'nueva'} />
        
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
            color={mode === 'seleccionar' ? '#8B5CF6' : 'blue'} 
            weight={5}
            opacity={0.7}
          />
        )}

        {/* Marcadores de incidentes */}
        {showIncidents && incidents?.map((incident) => (
          <Marker
            key={incident.id_incidente}
            position={[
              incident.coordenada.coordinates[1],
              incident.coordenada.coordinates[0]
            ]}
            icon={iconosIncidente[incident.tipo as keyof typeof iconosIncidente]}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-medium capitalize">{incident.tipo}</span>
                <p className="text-sm">{incident.descripcion}</p>
                <span className="text-xs text-gray-500">
                  {new Date(incident.fecha).toLocaleString()}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Estilos para los marcadores */}
      <style>{`
        .origin-marker {
          filter: hue-rotate(120deg);
        }
        .destination-marker {
          filter: hue-rotate(0deg);
        }
      `}</style>
    </div>
  );
};

export default DriverRouteMap; 