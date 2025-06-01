import { useState } from 'react';
import { supabase } from '../src/lib/supabase';
// import { EstadoValidacion } from '../types/validaciones';

interface RouteData {
  id_ruta: number;
  longitud: number;
  // Agregar más campos según necesites
}

interface ViajeData {
  id_ruta: number;
  id_conductor: number;
  id_vehiculo: string;
  fecha: string;
  hora_salida: string;
  hora_llegada: string;
  reseña?: number;
}

export const useViajeManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validar conductor y vehículo antes de crear viaje
   */
  const validarRequisitos = async (idConductor: number, placaVehiculo: string) => {
    console.log('🔍 Validando requisitos...');
    
    // Validaciones paralelas para mejor rendimiento
    const [conductorResult, vehiculoResult] = await Promise.all([
      supabase
        .from('registro')
        .select('validacion_conductor')
        .eq('id_usuario', idConductor)
        .single(),
      
      supabase
        .from('vehiculo')  
        .select('validacion, id_usuario')
        .eq('placa', placaVehiculo)
        .single()
    ]);

    const errors = [];
    
    // Verificar conductor
    if (conductorResult.error) {
      errors.push('Conductor no registrado en ninguna institución');
    } else if (conductorResult.data?.validacion_conductor !== 'validado') {
      errors.push(Conductor no validado (estado: ${conductorResult.data?.validacion_conductor || 'sin estado'}));
    }
    
    // Verificar vehículo
    if (vehiculoResult.error) {
      errors.push('Vehículo no encontrado');
    } else if (vehiculoResult.data?.validacion !== 'validado') {
      errors.push(Vehículo no validado (estado: ${vehiculoResult.data?.validacion || 'sin estado'}));
    } else if (vehiculoResult.data?.id_usuario !== idConductor) {
      errors.push('El vehículo no pertenece al conductor');
    }

    return {
      isValid: errors.length === 0,
      errors,
      conductor: conductorResult.data?.validacion_conductor,
      vehiculo: vehiculoResult.data?.validacion
    };
  };

  /**
   * Crear un nuevo viaje CON validaciones
   */
  const crearViaje = async (viajeData: ViajeData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚗 Iniciando creación de viaje...');
      
      // 1. VALIDAR REQUISITOS PRIMERO
      const validacion = await validarRequisitos(viajeData.id_conductor, viajeData.id_vehiculo);
      
      if (!validacion.isValid) {
        throw new Error(Validación falló: ${validacion.errors.join(', ')});
      }

      console.log('✅ Validaciones pasadas, creando viaje...');

      // 2. CREAR VIAJE SI TODO ESTÁ VALIDADO
      const { data, error } = await supabase
        .from('viaje')
        .insert({
          id_ruta: viajeData.id_ruta,
          id_conductor: viajeData.id_conductor,
          id_vehiculo: viajeData.id_vehiculo,
          fecha: viajeData.fecha,
          hora_salida: viajeData.hora_salida,
          hora_llegada: viajeData.hora_llegada,
          reseña: 1
        })
        .select();

      if (error) throw error;
      
      console.log('🎉 Viaje creado exitosamente:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear viaje';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene todas las rutas disponibles para el conductor
   */
  const fetchRutasDisponibles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('ruta')
        .select('id_ruta, longitud')
        .order('id_ruta', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener rutas';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchRutasDisponibles,
    crearViaje,
    validarRequisitos,
    isLoading,
    error
  };
};