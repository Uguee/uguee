
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FilterIcon, MapIcon } from "lucide-react";
import DashboardLayout from '../../components/layout/DashboardLayout';

const Incidents = () => {
  const [selectedIncidentType, setSelectedIncidentType] = useState("");
  const [location, setLocation] = useState("");

  const incidents = [
    {
      id: "CIG-123",
      location: "Carrera 94 #2a-33",
      type: "Manifestación",
      reportedBy: "Usuario",
      datetime: "23/03/25 -- 9:00 am",
      status: "Activo"
    },
    {
      id: "CIG-124",
      location: "Carrera 94 #2a-33",
      type: "Manifestación",
      reportedBy: "Usuario",
      datetime: "23/03/25 -- 9:00 am",
      status: "Activo"
    },
    {
      id: "CIG-125",
      location: "Carrera 94 #2a-33",
      type: "Manifestación",
      reportedBy: "Usuario",
      datetime: "23/03/25 -- 9:00 am",
      status: "Activo"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Tus rutas favoritas</h1>
        </div>

        {/* Report Incident Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Reporta un incidente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              placeholder="Ubicación" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Select value={selectedIncidentType} onValueChange={setSelectedIncidentType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de incidente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manifestacion">Manifestación</SelectItem>
                <SelectItem value="accidente">Accidente</SelectItem>
                <SelectItem value="trafico">Tráfico pesado</SelectItem>
                <SelectItem value="obra">Obra en vía</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Reportar
            </Button>
          </div>
        </div>

        {/* Search Incidents Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Busca incidentes</h2>
          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Escoge tipo de incidente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manifestacion">Manifestación</SelectItem>
                <SelectItem value="accidente">Accidente</SelectItem>
                <SelectItem value="trafico">Tráfico pesado</SelectItem>
                <SelectItem value="obra">Obra en vía</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Id_incidente</th>
                  <th className="text-left p-4 font-medium">Ubicación</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Reportado por</th>
                  <th className="text-left p-4 font-medium">Fecha/Hora</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident, index) => (
                  <tr key={incident.id} className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                    <td className="p-4">{incident.id}</td>
                    <td className="p-4">{incident.location}</td>
                    <td className="p-4">{incident.type}</td>
                    <td className="p-4 flex items-center">
                      <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                      {incident.reportedBy}
                    </td>
                    <td className="p-4">{incident.datetime}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        • {incident.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <MapIcon className="w-4 h-4 mr-1" />
                        Ver en mapa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Incidents;
