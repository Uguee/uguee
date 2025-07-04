import { useState } from "react";
import { supabase } from "../lib/supabase";
import { createTrip } from "../services/tripServices";
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
  programado_at?: string;
}

export const useViajeManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validar conductor y vehículo antes de crear viaje
   */
  const validarRequisitos = async (
    idConductor: number,
    placaVehiculo: string
  ) => {
    console.log("🔍 Validando requisitos...");

    // Validaciones paralelas para mejor rendimiento
    const [conductorResult, vehiculoResult] = await Promise.all([
      supabase
        .from("registro")
        .select("validacion_conductor")
        .eq("id_usuario", idConductor)
        .single(),

      supabase
        .from("vehiculo")
        .select("validacion, id_usuario, fecha_tecnicomecanica, vigencia_soat")
        .eq("placa", placaVehiculo)
        .single(),
    ]);

    const errors = [];

    // Verificar conductor
    if (conductorResult.error) {
      errors.push("Conductor no registrado en ninguna institución");
    } else if (conductorResult.data?.validacion_conductor !== "validado") {
      errors.push(
        `Conductor no validado (estado: ${
          conductorResult.data?.validacion_conductor || "sin estado"
        })`
      );
    }

    // Verificar vehículo
    if (vehiculoResult.error) {
      errors.push("Vehículo no encontrado");
    } else if (vehiculoResult.data?.validacion !== "validado") {
      errors.push(
        `Vehículo no validado (estado: ${
          vehiculoResult.data?.validacion || "sin estado"
        })`
      );
    } else if (vehiculoResult.data?.id_usuario !== idConductor) {
      errors.push("El vehículo no pertenece al conductor");
    }

    // Verificar fechas de documentos del vehículo
    const now = new Date();
    if (vehiculoResult.data?.fecha_tecnicomecanica) {
      const fechaTecnico = new Date(vehiculoResult.data.fecha_tecnicomecanica);
      if (fechaTecnico < now) {
        errors.push("La revisión técnico-mecánica ha expirado");
      }
    }
    if (vehiculoResult.data?.vigencia_soat) {
      const fechaSoat = new Date(vehiculoResult.data.vigencia_soat);
      if (fechaSoat < now) {
        errors.push("El SOAT ha expirado");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      conductor: conductorResult.data?.validacion_conductor,
      vehiculo: vehiculoResult.data?.validacion,
    };
  };

  /**
   * Crear un nuevo viaje CON validaciones
   */
  const crearViaje = async (viajeData: ViajeData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🚗 Iniciando creación de viaje...");
      console.log("📋 Datos del viaje recibidos:", viajeData);

      // 1. VALIDAR REQUISITOS PRIMERO
      const validacion = await validarRequisitos(
        viajeData.id_conductor,
        viajeData.id_vehiculo
      );

      if (!validacion.isValid) {
        throw new Error(`Validación falló: ${validacion.errors.join(", ")}`);
      }

      console.log("✅ Validaciones pasadas, creando viaje...");

      // 2. OBTENER TOKEN DE SESIÓN
      const session = supabase.auth.session();
      if (!session?.access_token) {
        throw new Error("No se pudo obtener el token de sesión");
      }

      console.log("🔑 Token de sesión obtenido");

      // 3. CREAR VIAJE USANDO LA EDGE FUNCTION
      console.log("📤 Enviando datos a la edge function:", {
        id_conductor: viajeData.id_conductor,
        id_vehiculo: viajeData.id_vehiculo,
        id_ruta: viajeData.id_ruta,
        programado_at: viajeData.programado_at,
      });

      const viajeCreado = await createTrip(viajeData, session.access_token);

      console.log("🎉 Viaje creado exitosamente:", viajeCreado);
      return viajeCreado;
    } catch (err) {
      console.error("❌ Error al crear viaje:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear viaje";
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
        .from("ruta")
        .select("id_ruta, longitud")
        .order("id_ruta", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al obtener rutas";
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
    error,
  };
};
