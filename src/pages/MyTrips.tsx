
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Phone, Mail } from "lucide-react";
import DashboardLayout from '../components/layout/DashboardLayout';

const MyTrips = () => {
  const trips = [
    {
      id: 1,
      route: "Meléndez - Univalle",
      date: "23/12/25 3:30:00",
      driver: "Alberto Torres",
      vehicle: "Kia Picanto",
      rating: 4,
      status: "Active"
    },
    {
      id: 2,
      route: "Santiago - Univalle",
      date: "22/12/19 16:00:00",
      driver: "Fredy Kru",
      vehicle: "TXL",
      rating: 3,
      status: "Active"
    },
    {
      id: 3,
      route: "Regular text column",
      date: "Regular text column",
      driver: "Alberto Torres",
      vehicle: "Regular text column",
      rating: 4,
      status: "Inactive"
    },
    {
      id: 4,
      route: "Meléndez - Univalle",
      date: "22/12/19 16:00:00",
      driver: "Alberto Torres",
      vehicle: "TXL",
      rating: 3,
      status: "Active"
    }
  ];

  const selectedTrip = trips[0]; // Simulating selected trip

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Historial de viajes</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trips Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">ID_VIAJE</th>
                    <th className="text-left p-3 text-sm font-medium">RUTA</th>
                    <th className="text-left p-3 text-sm font-medium">FECHA</th>
                    <th className="text-left p-3 text-sm font-medium">CONDUCTOR</th>
                    <th className="text-left p-3 text-sm font-medium">VEHÍCULO</th>
                    <th className="text-left p-3 text-sm font-medium">CALIFICACIÓN</th>
                    <th className="text-left p-3 text-sm font-medium">ESTADO_RUTA</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{trip.id}</td>
                      <td className="p-3 text-sm">{trip.route}</td>
                      <td className="p-3 text-sm">{trip.date}</td>
                      <td className="p-3 text-sm">{trip.driver}</td>
                      <td className="p-3 text-sm">{trip.vehicle}</td>
                      <td className="p-3">
                        <div className="flex">
                          {renderStars(trip.rating)}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant="secondary" 
                          className={trip.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          • {trip.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-6">
            {/* Route Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Detalles del viaje</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Origen_ruta:</strong> Cra. 23 #2b-65, Ingenio</p>
                <p><strong>Destino_ruta:</strong> Av. 9Nte. #17-24</p>
                <p className="text-gray-600">8 personas han tomado esta ruta</p>
                <div className="flex items-center space-x-1 mt-2">
                  <span className="text-sm text-gray-500">Usuarios:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">8</span>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Mapa de la ruta</p>
              </div>
            </div>

            {/* Driver Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold">{selectedTrip.driver}</h3>
                    <p className="text-sm text-gray-600">Cali, Valle del Cauca</p>
                    <p className="text-sm text-gray-500">Conductor</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  Alberto.torres@correounivalle.edu.co
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  3234789313
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-1" />
                  Llamar
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-1" />
                  Enviar correo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTrips;
