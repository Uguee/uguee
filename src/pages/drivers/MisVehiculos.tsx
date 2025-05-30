import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { UserService } from '../../services/userService';
import { Button } from '../../components/ui/button';
import AgregarVehiculoForm from '../../components/forms/AgregarVehiculoForm';
import { User } from '../../types';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface Vehiculo {
  placa: string;
  color: string;
  modelo: number;
  tipo_vehiculo: {
    tipo: string;
  };
  validacion: string | null;
  vigencia_soat: string;
  fecha_tecnicomecanica: string;
}

interface ExtendedUser extends User {
  raw_data?: {
    id_usuario: number;
  };
}

const MisVehiculos = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState<{ id_usuario: number } | null>(null);

  const cargarVehiculos = async () => {
    if (!user?.id) return;
    
    try {
      const userDataResponse = await UserService.getUserByUuid(user.id);
      const id_usuario = userDataResponse?.id_usuario;
      
      if (!id_usuario) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      setUserData({ id_usuario });

      const { data, error } = await supabase
        .from('vehiculo')
        .select(`
          *,
          tipo_vehiculo (
            tipo
          )
        `)
        .eq('id_usuario', id_usuario);

      if (error) throw error;
      setVehiculos(data || []);
    } catch (err) {
      console.error('Error cargando vehículos:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (placa: string) => {
    try {
      const { error } = await supabase
        .from('vehiculo')
        .delete()
        .eq('placa', placa);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Vehículo eliminado correctamente",
      });

      cargarVehiculos();
    } catch (err) {
      console.error('Error eliminando vehículo:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vehículo",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, [user, toast]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-text">Tus vehículos</h1>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            Añadir
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Cargando vehículos...</span>
          </div>
        ) : vehiculos.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes vehículos registrados
            </h3>
            <p className="text-gray-500 mb-6">
              Agrega tu primer vehículo para empezar a crear viajes.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimiento Soat</TableHead>
                  <TableHead>Vencimiento tecnomecánica</TableHead>
                  <TableHead>Validación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiculos.map((vehiculo) => (
                  <TableRow key={vehiculo.placa}>
                    <TableCell>{vehiculo.placa}</TableCell>
                    <TableCell>{vehiculo.color}</TableCell>
                    <TableCell>{vehiculo.modelo}</TableCell>
                    <TableCell>{vehiculo.tipo_vehiculo.tipo}</TableCell>
                    <TableCell>{vehiculo.vigencia_soat || 'No disponible'}</TableCell>
                    <TableCell>{vehiculo.fecha_tecnicomecanica || 'No disponible'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        vehiculo.validacion === 'validado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vehiculo.validacion === 'validado' ? 'Validado' : 'Pendiente'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteVehicle(vehiculo.placa)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {user?.id && (
          <AgregarVehiculoForm
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              cargarVehiculos();
            }}
            userId={userData?.id_usuario || 0}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MisVehiculos; 