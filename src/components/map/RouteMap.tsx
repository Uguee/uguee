import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RouteMapProps {
  origin: Location | null;
  destination: Location | null;
  route: [number, number][] | null;
}

export function RouteMap({ origin, destination, route }: RouteMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.9281, -84.0907]); // Default to San José, Costa Rica

  useEffect(() => {
    if (origin && destination) {
      // Center map between origin and destination
      const centerLat = (origin.lat + destination.lat) / 2;
      const centerLng = (origin.lng + destination.lng) / 2;
      setMapCenter([centerLat, centerLng]);
    } else if (origin) {
      setMapCenter([origin.lat, origin.lng]);
    } else if (destination) {
      setMapCenter([destination.lat, destination.lng]);
    }
  }, [origin, destination]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {origin && (
          <Marker position={[origin.lat, origin.lng]}>
            <Popup>
              <div>
                <strong>Origen:</strong> {origin.address}
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>
              <div>
                <strong>Destino:</strong> {destination.address}
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
      </MapContainer>
    </div>
  );
} 