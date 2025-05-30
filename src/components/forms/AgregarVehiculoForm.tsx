import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { addYears, format } from 'date-fns';
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
    vencimiento_soat: '',
    vencimiento_tecnicomecanica: '',
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
          fecha_tecnicomecanica: formData.vencimiento_tecnicomecanica,
          vigencia_soat: formData.vencimiento_soat,
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
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Automóvil</SelectItem>
                <SelectItem value="2">Motocicleta</SelectItem>
                <SelectItem value="3">Bicicleta</SelectItem>
                <SelectItem value="4">Camioneta</SelectItem>
                <SelectItem value="5">Van</SelectItem>
                <SelectItem value="6">Monopatín</SelectItem>
                <SelectItem value="7">Bus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Vencimiento SOAT</label>
            <Input
              type="date"
              value={formData.vencimiento_soat}
              onChange={(e) => setFormData({ ...formData, vencimiento_soat: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha Vencimiento Tecnomecánica</label>
            <Input
              type="date"
              value={formData.vencimiento_tecnicomecanica}
              onChange={(e) => setFormData({ ...formData, vencimiento_tecnicomecanica: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
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