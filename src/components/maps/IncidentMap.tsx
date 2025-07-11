import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TipoIncidente } from '@/pages/passengers/ReportIncident';
import { useIncidents } from '@/hooks/useIncidents';
import { iconosIncidente } from './incidentIcons';

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
  const { incidents, loading, error } = useIncidents();

  console.log('🗺️ IncidentMap renderizado:', {
    selectedType,
    markerPosition,
    loading,
    error,
    incidentsCount: incidents?.length,
    incidents
  });

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
        
        {/* Marcador del nuevo incidente */}
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

        {/* Marcadores de incidentes existentes */}
        {incidents?.map((incident) => {
          console.log('📍 Renderizando incidente existente:', {
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