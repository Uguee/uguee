import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  ZoomControl,
  useMapEvents
} from 'react-leaflet';
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

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RouteMapProps {
  origin: Location | null;
  destination: Location | null;
  route: [number, number][] | null;
  onCurrentLocationChange?: (location: Location) => void;
  onRouteGenerated?: (origin: Location, destination: Location, route: [number, number][]) => void;
  onMapClick?: (lat: number, lng: number, isRightClick: boolean) => void;
  allowClickToSetPoints?: boolean;
}

// Componente para detectar ubicación sin cambiar vista si el usuario ya la modificó
function MapController({ onCurrentLocationChange }: { onCurrentLocationChange?: (location: Location) => void }) {
  const map = useMap();
  const initialCentered = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = [latitude, longitude] as [number, number];

        // Solo centramos y aplicamos zoom si el usuario no ha tocado el mapa aún
        if (!initialCentered.current) {
          map.setView(currentLocation, 18);
          initialCentered.current = true;
        }

        // Icono personalizado para ubicación actual
        const currentLocationIcon = L.divIcon({
          className: 'current-location-marker',
          html: `
            <div style="
              background-color: #3B82F6;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 0 2px #3B82F6;
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        // Callback para el padre
        onCurrentLocationChange?.({
          lat: latitude,
          lng: longitude,
          address: "Tu ubicación actual",
        });
      },
      (error) => {
        console.error("Error al obtener la ubicación:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [map, onCurrentLocationChange]);

  return null;
}

// Componente para manejar clics en el mapa
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number, isRightClick: boolean) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng, false);
      }
    },
    contextmenu: (e) => {
      e.originalEvent.preventDefault();
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng, true);
      }
    },
  });
  return null;
}

// Componente para ajustar el mapa a los límites de la ruta
function FitBounds({ origin, destination, route }: { 
  origin: Location | null; 
  destination: Location | null; 
  route: [number, number][] | null; 
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];
    
    // Agregar puntos de origen y destino
    if (origin) {
      points.push([origin.lat, origin.lng]);
    }
    if (destination) {
      points.push([destination.lat, destination.lng]);
    }
    
    // Agregar puntos de la ruta si existen
    if (route && route.length > 0) {
      points.push(...route);
    }
    
    // Si tenemos puntos, ajustar el mapa para mostrarlos todos
    if (points.length > 0) {
      if (points.length === 1) {
        // Si solo hay un punto, centrarlo con zoom 15
        map.setView(points[0], 15);
      } else {
        // Si hay múltiples puntos, ajustar bounds con padding
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 16 
        });
      }
    }
  }, [map, origin, destination, route]);

  return null;
}

export function RouteMap({ 
  origin, 
  destination, 
  route, 
  onCurrentLocationChange,
  onRouteGenerated,
  onMapClick,
  allowClickToSetPoints = false 
}: RouteMapProps) {
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);

  // Función para generar la ruta usando OSRM
  const generateRoute = async (start: Location, end: Location) => {
    setIsGeneratingRoute(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        // Convertir de [lng, lat] a [lat, lng] para Leaflet
        const routeCoords: [number, number][] = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        
        if (onRouteGenerated) {
          onRouteGenerated(start, end, routeCoords);
        }
      }
    } catch (error) {
      console.error('Error generando la ruta:', error);
    } finally {
      setIsGeneratingRoute(false);
    }
  };

  const originIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
      {allowClickToSetPoints && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] max-w-xs">
          <h3 className="font-medium text-sm mb-2">📍 Seleccionar Puntos</h3>
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
      )}

      <MapContainer
        center={origin ? [origin.lat, origin.lng] : [3.4516, -76.5320]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        minZoom={5}
        maxZoom={19}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />
        <MapController onCurrentLocationChange={onCurrentLocationChange} />
        
        {allowClickToSetPoints && (
          <MapClickHandler 
            onMapClick={onMapClick} 
          />
        )}

        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <div>
                <strong>Origen:</strong> {origin.address}
                <br />
                Lat: {origin.lat && typeof origin.lat === 'number' ? origin.lat.toFixed(6) : 'N/A'}
                <br />
                Lng: {origin.lng && typeof origin.lng === 'number' ? origin.lng.toFixed(6) : 'N/A'}
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <div>
                <strong>Destino:</strong> {destination.address}
                <br />
                Lat: {destination.lat && typeof destination.lat === 'number' ? destination.lat.toFixed(6) : 'N/A'}
                <br />
                Lng: {destination.lng && typeof destination.lng === 'number' ? destination.lng.toFixed(6) : 'N/A'}
              </div>
            </Popup>
          </Marker>
        )}

        {route && (
          <Polyline
            positions={route}
            color="#8B5CF6"
            weight={4}
            opacity={0.7}
          />
        )}

        <FitBounds origin={origin} destination={destination} route={route} />
      </MapContainer>
    </div>
  );
}
