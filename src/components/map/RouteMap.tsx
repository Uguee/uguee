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

// Asegurarnos de que los iconos estén configurados antes de que se use el mapa
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

// Componente para manejar la ubicación actual
function MapController({ onCurrentLocationChange }: { onCurrentLocationChange?: (location: Location) => void }) {
  const map = useMap();
  const [isMapReady, setIsMapReady] = useState(false);
  const initialCentered = useRef(false);

  useEffect(() => {
    // Esperar a que el mapa esté listo
    if (map) {
      setIsMapReady(true);
    }
  }, [map]);

  useEffect(() => {
    if (!isMapReady || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = [latitude, longitude] as [number, number];

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
  }, [isMapReady, map, onCurrentLocationChange]);

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
  const [isMapReady, setIsMapReady] = useState(false);

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
          {origin && destination && (
            <p className="text-xs text-green-600">✅ Ruta generada</p>
          )}
        </div>
      )}

      <MapContainer
        center={origin ? [origin.lat, origin.lng] : [3.4516, -76.5320]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenReady={() => setIsMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />
        
        {isMapReady && (
          <>
            <MapController onCurrentLocationChange={onCurrentLocationChange} />
            {allowClickToSetPoints && (
              <MapClickHandler onMapClick={onMapClick} />
            )}
            {origin && (
              <Marker position={[origin.lat, origin.lng]}>
                <Popup>
                  <strong>Origen:</strong> {origin.address}
                </Popup>
              </Marker>
            )}
            {destination && (
              <Marker position={[destination.lat, destination.lng]}>
                <Popup>
                  <strong>Destino:</strong> {destination.address}
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
            {(origin || destination || route) && (
              <FitBounds origin={origin} destination={destination} route={route} />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
