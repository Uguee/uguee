import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AgregarVehiculoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

const AgregarVehiculoForm = ({ isOpen, onClose, onSuccess, userId }: AgregarVehiculoFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    color: '',
    modelo: new Date().getFullYear(),
    tipo: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('vehiculo')
        .insert({
          placa: formData.placa.toUpperCase(),
          color: formData.color,
          modelo: formData.modelo,
          tipo: parseInt(formData.tipo),
          id_usuario: userId,
          validacion: 'pendiente',
          fecha_tecnicomecanica: new Date().toISOString(), // Temporal
          vigencia_soat: new Date().toISOString(), // Temporal
        });

      if (error) throw error;

      toast({
        title: "Vehículo agregado",
        description: "El vehículo ha sido registrado exitosamente",
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error agregando vehículo:', err);
      toast({
        title: "Error",
        description: "No se pudo agregar el vehículo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Placa</label>
            <Input
              value={formData.placa}
              onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
              placeholder="ABC123"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Ej: Rojo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Modelo (Año)</label>
            <Input
              type="number"
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: parseInt(e.target.value) })}
              min={1990}
              max={new Date().getFullYear() + 1}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Vehículo</label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Carro</SelectItem>
                <SelectItem value="2">Moto</SelectItem>
                {/* Agregar más tipos según tu base de datos */}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Agregando...' : 'Agregar Vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgregarVehiculoForm; 