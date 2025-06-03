import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
    vigencia_soat: '',
    fecha_tecnicomecanica: '',
  });

  const { toast } = useToast();

  // Función para generar la placa automática
  const generarPlaca = async (tipo: number): Promise<string> => {
    try {
      // Para bicicletas (tipo 3)
      if (tipo === 3) {
        // Contar cuántas bicicletas hay
        const { count, error } = await supabase
          .from('vehiculo')
          .select('*', { count: 'exact', head: true })
          .eq('tipo', 3);
          
        if (error) throw error;
        
        const nextIndex = (count || 0) + 1;
        return `B${String(nextIndex).padStart(5, '0')}`;
      }
      
      // Para monopatines (tipo 6)
      if (tipo === 6) {
        // Contar cuántos monopatines hay
        const { count, error } = await supabase
          .from('vehiculo')
          .select('*', { count: 'exact', head: true })
          .eq('tipo', 6);
          
        if (error) throw error;
        
        const nextIndex = (count || 0) + 1;
        return `S${String(nextIndex).padStart(5, '0')}`;
      }
      
      // Para otros tipos, devolver la placa ingresada
      return formData.placa.toUpperCase();
    } catch (error) {
      console.error('Error generando placa:', error);
      throw new Error('No se pudo generar la placa automáticamente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tipo = parseInt(formData.tipo);
      
      // Validar datos según el tipo de vehículo
      if (!tipo) {
        throw new Error('Debes seleccionar un tipo de vehículo');
      }
      
      if (!formData.color || !formData.modelo) {
        throw new Error('Color y modelo son obligatorios');
      }

      // Para vehículos que no sean bicicletas ni monopatines
      const esBicicletaOMonopatin = tipo === 3 || tipo === 6;
      
      if (!esBicicletaOMonopatin) {
        // Validar placa para vehículos que no son bicicletas ni monopatines
        if (!formData.placa) {
          throw new Error('La placa es obligatoria para este tipo de vehículo');
        }
        
        // Validar formato de placa
        const placaRegex = /^[A-Za-z0-9]{6}$/;
        if (!placaRegex.test(formData.placa)) {
          throw new Error('La placa debe tener exactamente 6 caracteres alfanuméricos');
        }
        
        // Validar documentos obligatorios
        if (!formData.vigencia_soat || !formData.fecha_tecnicomecanica) {
          throw new Error('Fechas de SOAT y tecnomecánica son obligatorias para este tipo de vehículo');
        }
      }

      // Generar placa automática para bicicletas y monopatines
      let placaFinal = formData.placa;
      if (esBicicletaOMonopatin && !formData.placa) {
        placaFinal = await generarPlaca(tipo);
      }

      // Crear objeto para insertar
      const vehiculoData = {
        placa: placaFinal.toUpperCase(),
        id_usuario: userId,
        tipo: tipo,
        color: formData.color,
        modelo: formData.modelo,
        validacion: 'pendiente',
        vigencia_soat: esBicicletaOMonopatin ? null : formData.vigencia_soat,
        fecha_tecnicomecanica: esBicicletaOMonopatin ? null : formData.fecha_tecnicomecanica,
      };

      // Insertar vehículo
      const { error } = await supabase
        .from('vehiculo')
        .insert(vehiculoData);

      if (error) {
        if (error.message.includes('chk_placa_valida')) {
          throw new Error('La placa no cumple con el formato requerido');
        }
        throw error;
      }

      toast({
        title: "✅ Vehículo agregado",
        description: `El vehículo ha sido registrado exitosamente con placa ${placaFinal}`,
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error agregando vehículo:', err);
      toast({
        title: "❌ Error",
        description: err instanceof Error ? err.message : "No se pudo agregar el vehículo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tipoSeleccionado = parseInt(formData.tipo);
  const esBicicletaOMonopatin = tipoSeleccionado === 3 || tipoSeleccionado === 6;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
          <DialogDescription>
            Complete los detalles del vehículo que desea registrar.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {!esBicicletaOMonopatin && (
            <div>
              <label className="block text-sm font-medium mb-1">Placa</label>
              <Input
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                placeholder="ABC123"
                maxLength={6}
                required={!esBicicletaOMonopatin}
              />
              <p className="text-sm text-gray-500 mt-1">
                6 caracteres alfanuméricos sin espacios
              </p>
            </div>
          )}

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

          {!esBicicletaOMonopatin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Vencimiento SOAT</label>
                <Input
                  type="date"
                  value={formData.vigencia_soat}
                  onChange={(e) => setFormData({ ...formData, vigencia_soat: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required={!esBicicletaOMonopatin}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha Vencimiento Tecnomecánica</label>
                <Input
                  type="date"
                  value={formData.fecha_tecnicomecanica}
                  onChange={(e) => setFormData({ ...formData, fecha_tecnicomecanica: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required={!esBicicletaOMonopatin}
                />
              </div>
            </>
          )}

          {esBicicletaOMonopatin && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                {tipoSeleccionado === 3 ? 'Bicicleta' : 'Monopatín'}: Se generará una placa automáticamente al guardar
              </p>
            </div>
          )}

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