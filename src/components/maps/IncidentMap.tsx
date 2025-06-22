import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TipoIncidente } from '@/pages/passengers/ReportIncident';

// Importar los íconos
import accidenteIcon from '@/assets/icons/accidente.png';
import roboIcon from '@/assets/icons/robo.png';
import viaCerradaIcon from '@/assets/icons/via-cerrada.png';
import huecoIcon from '@/assets/icons/hueco.png';
import policiaIcon from '@/assets/icons/policia.png';
import emergenciaIcon from '@/assets/icons/emergencia.png';
import obstaculoIcon from '@/assets/icons/obstaculo.png';
import otroIcon from '@/assets/icons/otro.png';

const iconosIncidente = {
  'accidente': L.icon({
    iconUrl: accidenteIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'robo': L.icon({
    iconUrl: roboIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'vía cerrada': L.icon({
    iconUrl: viaCerradaIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'hueco en la vía': L.icon({
    iconUrl: huecoIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'presencia policial': L.icon({
    iconUrl: policiaIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'emergencia': L.icon({
    iconUrl: emergenciaIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'obstáculo en la vía': L.icon({
    iconUrl: obstaculoIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'otro': L.icon({
    iconUrl: otroIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
} as const;

// Coordenadas de Cali
const CALI_CENTER: [number, number] = [3.4516, -76.5320];

interface IncidentMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedType?: TipoIncidente;
}

// Componente para manejar los clics en el mapa
const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
  setMarker: (position: [number, number] | null) => void;
}> = ({ onLocationSelect, setMarker }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setMarker([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const IncidentMap: React.FC<IncidentMapProps> = ({ onLocationSelect, selectedType }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] max-w-xs">
        <p className="text-xs text-gray-600">
          Haz clic en el mapa para seleccionar la ubicación del incidente
        </p>
      </div>

      <MapContainer
        center={CALI_CENTER}
        zoom={13}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapClickHandler 
          onLocationSelect={onLocationSelect} 
          setMarker={setMarkerPosition} 
        />
        
        {markerPosition && selectedType && (
          <Marker 
            position={markerPosition}
            icon={iconosIncidente[selectedType]}
          >
            <Popup>
              <div className="flex items-center gap-2">
                <span className="capitalize">{selectedType}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Lat: {markerPosition[0].toFixed(6)}<br />
                Lng: {markerPosition[1].toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <style>{`
        .custom-incident-icon {
          background: none;
          border: none;
        }
        .custom-incident-icon svg {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </div>
  );
};

export default IncidentMap; 