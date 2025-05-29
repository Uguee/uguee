import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en bundlers como Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Coordenadas de Cali (como punto inicial)
const CALI_CENTER: [number, number] = [3.4516, -76.5320];

interface BasicMapProps {
  className?: string;
}

const BasicMap: React.FC<BasicMapProps> = ({ className = "" }) => {
  return (
    <MapContainer
      center={CALI_CENTER}
      zoom={13}
      className={`w-full h-full ${className}`}
      style={{ height: '100%', width: '100%' }}
    >
      {/* TileLayer es la capa base del mapa (las imágenes del mapa) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Un marcador de ejemplo */}
      <Marker position={CALI_CENTER}>
        <Popup>
          📍 Centro de Cali
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default BasicMap; 