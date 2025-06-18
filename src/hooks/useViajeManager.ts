import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
// import { EstadoValidacion } from '../types/validaciones';

interface RouteData {
  id_ruta: number;
  longitud: number;
  // Agregar más campos según necesites
}

interface ViajeData {
  id_ruta: number;
  id_conductor: number | null;
  id_vehiculo: string | null;
  programado_at: string | null;
  salida_at: string | null;
  llegada_at: string | null;
  reseña?: number;
}

export const useViajeManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validar conductor y vehículo antes de crear viaje
   */
  const validarRequisitos = async (idConductor: number | null, placaVehiculo: string | null) => {
    console.log('🔍 Validando requisitos...');
    
    // Si es una solicitud de pasajero (idConductor es null), no validar conductor ni vehículo
    if (idConductor === null) {
      return {
        isValid: true,
        errors: [],
        conductor: null,
        vehiculo: null
      };
    }
    
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
      errors.push(`Conductor no validado (estado: ${conductorResult.data?.validacion_conductor || 'sin estado'})`);
    }
    
    // Verificar vehículo solo si se proporcionó una placa
    if (placaVehiculo) {
      if (vehiculoResult.error) {
        errors.push('Vehículo no encontrado');
      } else if (vehiculoResult.data?.validacion !== 'validado') {
        errors.push(`Vehículo no validado (estado: ${vehiculoResult.data?.validacion || 'sin estado'})`);
      } else if (vehiculoResult.data?.id_usuario !== idConductor) {
        errors.push('El vehículo no pertenece al conductor');
      }
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
      console.log('🚗 Iniciando creación de viaje...', viajeData);
      
      // 1. VALIDAR REQUISITOS PRIMERO
      const validacion = await validarRequisitos(viajeData.id_conductor, viajeData.id_vehiculo);
      console.log('🔍 Resultado de validación:', validacion);
      
      if (!validacion.isValid) {
        throw new Error(`Validación falló: ${validacion.errors.join(', ')}`);
      }

      console.log('✅ Validaciones pasadas, creando viaje...');

      // 2. CREAR VIAJE SI TODO ESTÁ VALIDADO
      const { data, error } = await supabase
        .from('viaje')
        .insert({
          id_ruta: viajeData.id_ruta,
          id_conductor: viajeData.id_conductor,
          id_vehiculo: viajeData.id_vehiculo,
          programado_at: viajeData.programado_at,
          salida_at: viajeData.salida_at,
          llegada_at: viajeData.llegada_at
        })
        .select();

      if (error) {
        console.error('❌ Error en la inserción:', error);
        throw new Error(`Error al crear viaje: ${error.message}`);
      }
      
      console.log('🎉 Viaje creado exitosamente:', data);
      return data;
    } catch (err) {
      console.error('❌ Error completo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear viaje';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crear una solicitud de viaje para pasajeros
   */
  const crearSolicitudViaje = async (viajeData: ViajeData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚗 Iniciando creación de solicitud de viaje...', viajeData);

      // Limpiar el formato de la fecha primero
      const fechaLimpia = viajeData.programado_at.replace(/:00$/, ''); // Elimina el último ":00"
      const fecha = new Date(fechaLimpia);

      // Extraer fecha y hora por separado usando split
      const [fechaParte, horaParte] = fechaLimpia.split('T');

      // Crear la solicitud de viaje
      const { data, error } = await supabase
        .from('solicitud_viaje')
        .insert({
          id_ruta: viajeData.id_ruta,
          id_pasajero: viajeData.id_conductor, // En este caso, id_conductor es el id del pasajero
          fecha: fechaParte,
          hora_salida: horaParte,
          hora_llegada: null,
          estado: 'pendiente'
        })
        .select();

      if (error) {
        console.error('❌ Error en la inserción:', error);
        throw new Error(`Error al crear solicitud de viaje: ${error.message}`);
      }
      
      console.log('🎉 Solicitud de viaje creada exitosamente:', data);
      return data;
    } catch (err) {
      console.error('❌ Error completo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear solicitud de viaje';
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
    crearSolicitudViaje,
    validarRequisitos,
    isLoading,
    error
  };
}; 