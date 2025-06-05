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
  // Estado inicial del formulario
  const initialFormState = {
    placa: '',
    color: '',
    modelo: new Date().getFullYear(),
    tipo: '',
    vigencia_soat: '',
    fecha_tecnicomecanica: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData(initialFormState);
  };

  // Resetear el formulario cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Manejar cambio de tipo de vehículo
  const handleTipoChange = (value: string) => {
    const newTipo = parseInt(value);
    const esBicicletaOMonopatin = newTipo === 3 || newTipo === 6;
    
    // Resetear campos específicos cuando cambia el tipo
    setFormData(prev => ({
      ...prev,
      tipo: value,
      // Si cambia a bicicleta/monopatín, limpiar placa y fechas
      placa: esBicicletaOMonopatin ? '' : prev.placa,
      vigencia_soat: esBicicletaOMonopatin ? '' : prev.vigencia_soat,
      fecha_tecnicomecanica: esBicicletaOMonopatin ? '' : prev.fecha_tecnicomecanica
    }));
  };

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
      
      // 1. Validaciones obligatorias comunes
      if (!userId || !tipo || !formData.color || formData.modelo === undefined) {
        throw new Error('id_usuario, tipo, color y modelo son obligatorios');
      }

      // 2. Validar formato de placa si viene
      if (formData.placa) {
        const placaRegex = /^[A-Za-z0-9]{6}$/;
        if (!placaRegex.test(formData.placa)) {
          throw new Error('La placa debe tener exactamente 6 caracteres alfanuméricos (sin espacios ni símbolos)');
        }
      }

      // 3. Validar que placa sea obligatoria si no es bicicleta ni monopatín
      const esBicicletaOMonopatin = tipo === 3 || tipo === 6;
      if (!esBicicletaOMonopatin && !formData.placa) {
        throw new Error('Para este tipo de vehículo, la placa es obligatoria');
      }

      // 4. Generar placa para bicicleta o monopatín
      let placaFinal = formData.placa;
      if (esBicicletaOMonopatin && !formData.placa) {
        const prefix = tipo === 3 ? 'B' : 'S';
        const { count, error: countError } = await supabase
          .from('vehiculo')
          .select('placa', { count: 'exact', head: true })
          .eq('tipo', tipo);

        if (countError) {
          throw new Error(`Error al contar ${tipo === 3 ? 'bicicletas' : 'monopatines'}: ${countError.message}`);
        }

        const nextIndex = (count ?? 0) + 1;
        placaFinal = `${prefix}${String(nextIndex).padStart(5, '0')}`; // Ej: B00001 o S00001
      }

      // 5. Validar fechas obligatorias para tipos distintos de bici/monopatín
      if (!esBicicletaOMonopatin) {
        if (!formData.vigencia_soat || !formData.fecha_tecnicomecanica) {
          throw new Error('vigencia_soat y fecha_tecnicomecanica son obligatorios para este tipo de vehículo');
        }
      }

      // 6. Preparar objeto a insertar
      const vehiculoData = {
        placa: placaFinal.toUpperCase(),
        id_usuario: userId,
        tipo: tipo,
        color: formData.color,
        modelo: formData.modelo,
        validacion: 'pendiente',
        vigencia_soat: esBicicletaOMonopatin ? null : formData.vigencia_soat,
        fecha_tecnicomecanica: esBicicletaOMonopatin ? null : formData.fecha_tecnicomecanica
      };

      // 7. Insertar vehículo
      const { error } = await supabase
        .from('vehiculo')
        .insert(vehiculoData);

      if (error) {
        // Validación de restricción CHECK personalizada
        if (error.message.includes('chk_placa_valida')) {
          throw new Error('La placa final no cumple el formato alfanumérico (exactamente 6 caracteres A–Z, a–z, 0–9)');
        }
        throw error;
      }

      toast({
        title: "✅ Vehículo agregado",
        description: `El vehículo ha sido registrado exitosamente con placa ${placaFinal}`,
      });
      
      resetForm(); // Resetear el formulario después de agregar exitosamente
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
              onValueChange={handleTipoChange}
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