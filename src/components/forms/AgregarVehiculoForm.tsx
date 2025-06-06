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
    soat_documento: null as File | null,
    tecnicomecanica_documento: null as File | null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    soat: 0,
    tecnicomecanica: 0
  });
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'soat' | 'tecnicomecanica') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (52428800 bytes = 50MB)
      if (file.size > 52428800) {
        toast({
          title: "Error",
          description: "El archivo no debe superar los 50MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validar tipo de archivo
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos JPG, PNG o PDF",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        [`${type}_documento`]: file
      }));
    }
  };

  const uploadDocumento = async (
    file: File, 
    tipo: 'soat' | 'tecnicomecanica', 
    placa: string, 
    fechaVencimiento: string,
    numeroDocumento: number
  ) => {
    try {
      // 1. Crear nombre del archivo con timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${tipo}_${placa}_${Date.now()}.${fileExt}`;
      
      // 2. Crear path incluyendo el ID del usuario en la estructura
      const filePath = `${userId}/${placa}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos-vehiculares')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 3. Insertar en la tabla documento_vehicular con el número proporcionado
      const { error: insertError } = await supabase
        .from('documento_vehicular')
        .insert({
          numero: numeroDocumento,
          placa_vehiculo: placa,
          imagen: uploadData.path,
          tipo: tipo === 'soat' ? 'SOAT' : 'tecnomecanica',
          fecha_vencimiento: fechaVencimiento
        });

      if (insertError) throw insertError;

    } catch (error) {
      console.error('Error subiendo documento:', error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const tipo = parseInt(formData.tipo);
    const esBicicletaOMonopatin = tipo === 3 || tipo === 6;

    // Validar tipo de vehículo
    if (!formData.tipo) {
      newErrors.tipo = "Debes seleccionar un tipo de vehículo";
    }

    // Validar placa para vehículos que no son bicicleta ni monopatín
    if (!esBicicletaOMonopatin) {
      if (!formData.placa.trim()) {
        newErrors.placa = "La placa es requerida";
      } else if (!/^[A-Za-z0-9]{6}$/.test(formData.placa)) {
        newErrors.placa = "La placa debe tener exactamente 6 caracteres alfanuméricos";
      }
    }

    // Validar color
    if (!formData.color.trim()) {
      newErrors.color = "El color es requerido";
    }

    // Validar modelo
    if (!formData.modelo) {
      newErrors.modelo = "El modelo es requerido";
    } else {
      const currentYear = new Date().getFullYear();
      if (formData.modelo < 1990 || formData.modelo > currentYear + 1) {
        newErrors.modelo = `El modelo debe estar entre 1990 y ${currentYear + 1}`;
      }
    }

    // Validaciones específicas para vehículos que no son bicicleta ni monopatín
    if (!esBicicletaOMonopatin) {
      // Validar SOAT
      if (!formData.vigencia_soat) {
        newErrors.vigencia_soat = "La fecha de vencimiento del SOAT es requerida";
      }

      // Validar Tecnomecánica
      if (!formData.fecha_tecnicomecanica) {
        newErrors.fecha_tecnicomecanica = "La fecha de vencimiento de la Tecnomecánica es requerida";
      }

      // Validar documentos
      if (!formData.soat_documento) {
        newErrors.soat_documento = "Debes subir la foto del SOAT";
      }

      if (!formData.tecnicomecanica_documento) {
        newErrors.tecnicomecanica_documento = "Debes subir la foto de la Tecnomecánica";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const tipo = parseInt(formData.tipo);
      const esBicicletaOMonopatin = tipo === 3 || tipo === 6;
      
      // Validar documentos para vehículos que los requieren
      if (!esBicicletaOMonopatin) {
        if (!formData.soat_documento || !formData.tecnicomecanica_documento) {
          throw new Error('Debes subir el SOAT y la Tecnomecánica para este tipo de vehículo');
        }
      }

      // Generar placa si es necesario
      let placaFinal = await generarPlaca(tipo);

      // 1. Primero insertar el vehículo
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

      const { error: vehiculoError } = await supabase
        .from('vehiculo')
        .insert(vehiculoData);

      if (vehiculoError) throw vehiculoError;

      // 2. Si no es bicicleta o monopatín, subir documentos
      if (!esBicicletaOMonopatin) {
        if (formData.soat_documento && formData.tecnicomecanica_documento) {
          // Obtener los siguientes números para los documentos
          const { data: maxNumero } = await supabase
            .from('documento_vehicular')
            .select('numero')
            .order('numero', { ascending: false })
            .limit(1);

          const siguienteNumero = maxNumero && maxNumero.length > 0 ? maxNumero[0].numero + 1 : 1;

          // Subir documentos secuencialmente con números diferentes
          await uploadDocumento(
            formData.soat_documento,
            'soat',
            placaFinal,
            formData.vigencia_soat,
            siguienteNumero
          );
          
          await uploadDocumento(
            formData.tecnicomecanica_documento,
            'tecnicomecanica',
            placaFinal,
            formData.fecha_tecnicomecanica,
            siguienteNumero + 1
          );
        }
      }

      toast({
        title: "✅ Vehículo agregado",
        description: `El vehículo ha sido registrado exitosamente con placa ${placaFinal}`,
      });
      
      resetForm();
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
            )}
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
                className={errors.placa ? "border-red-500" : ""}
              />
              {errors.placa && (
                <p className="mt-1 text-sm text-red-600">{errors.placa}</p>
              )}
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
              className={errors.color ? "border-red-500" : ""}
            />
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color}</p>
            )}
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
              className={errors.modelo ? "border-red-500" : ""}
            />
            {errors.modelo && (
              <p className="mt-1 text-sm text-red-600">{errors.modelo}</p>
            )}
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
                  className={errors.vigencia_soat ? "border-red-500" : ""}
                />
                {errors.vigencia_soat && (
                  <p className="mt-1 text-sm text-red-600">{errors.vigencia_soat}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha Vencimiento Tecnomecánica</label>
                <Input
                  type="date"
                  value={formData.fecha_tecnicomecanica}
                  onChange={(e) => setFormData({ ...formData, fecha_tecnicomecanica: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required={!esBicicletaOMonopatin}
                  className={errors.fecha_tecnicomecanica ? "border-red-500" : ""}
                />
                {errors.fecha_tecnicomecanica && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_tecnicomecanica}</p>
                )}
              </div>

              {/* Nuevo campo para subir SOAT */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Foto del SOAT (Frente)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange(e, 'soat')}
                      className="hidden"
                      id="soat-upload"
                    />
                    <label
                      htmlFor="soat-upload"
                      className="cursor-pointer text-center"
                    >
                      {formData.soat_documento ? (
                        <div className="text-sm text-gray-600">
                          ✅ {formData.soat_documento.name}
                        </div>
                      ) : (
                        <>
                          <div className="text-gray-400 mb-2">
                            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              PNG, JPG o PDF hasta 50MB
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Nuevo campo para subir Tecnomecánica */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Foto de la Tecnomecánica (Frente)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange(e, 'tecnicomecanica')}
                      className="hidden"
                      id="tecno-upload"
                    />
                    <label
                      htmlFor="tecno-upload"
                      className="cursor-pointer text-center"
                    >
                      {formData.tecnicomecanica_documento ? (
                        <div className="text-sm text-gray-600">
                          ✅ {formData.tecnicomecanica_documento.name}
                        </div>
                      ) : (
                        <>
                          <div className="text-gray-400 mb-2">
                            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              PNG, JPG o PDF hasta 50MB
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                </div>
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

          {errors.soat_documento && (
            <p className="mt-1 text-sm text-red-600">{errors.soat_documento}</p>
          )}

          {errors.tecnicomecanica_documento && (
            <p className="mt-1 text-sm text-red-600">{errors.tecnicomecanica_documento}</p>
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