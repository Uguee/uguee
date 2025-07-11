import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIncidents } from '@/hooks/useIncidents';
import { iconosIncidente } from './incidentIcons';

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
  showIncidents?: boolean;
}

const BasicMap: React.FC<BasicMapProps> = ({ className = "", showIncidents = true }) => {
  const { incidents, loading, error } = useIncidents();

  console.log('🗺️ BasicMap renderizado:', {
    showIncidents,
    loading,
    error,
    incidentsCount: incidents?.length,
    incidents
  });

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
      
      {showIncidents && incidents?.map((incident) => {
        console.log('📍 Renderizando incidente:', {
          id: incident.id_incidente,
          tipo: incident.tipo,
          coordenadas: incident.coordenada?.coordinates
        });

        return (
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
        );
      })}
    </MapContainer>
  );
};

export default BasicMap; 