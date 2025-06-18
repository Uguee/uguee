import { supabaseAnonKey } from "./documentService";
import { getCurrentToken } from "../services/authService";

export interface RoutePoint {
  type: string;
  coordinates: [number, number];
}

export interface RouteLineString {
  type: string;
  coordinates: [number, number][];
}

export interface RouteData {
  id_ruta: number;
  longitud: number;
  nombre_partida: string | null;
  nombre_llegada: string | null;
  punto_partida?: RoutePoint;
  punto_llegada?: RoutePoint;
  trayecto?: RouteLineString;
}

export interface RouteResponse {
  success: boolean;
  data?: RouteData;
  error?: string;
}

export async function registerRoute({
  punto_partida,
  punto_llegada,
  trayecto,
  longitud,
  id_usuario,
}: {
  punto_partida: { latitude: number; longitude: number };
  punto_llegada: { latitude: number; longitude: number };
  trayecto: { latitude: number; longitude: number }[];
  longitud: number;
  id_usuario: number;
}) {
  try {
    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/register-route",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          punto_partida,
          punto_llegada,
          trayecto,
          longitud,
          id_usuario,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error("Respuesta del servidor:", data);
      console.error("Datos enviados:", {
        punto_partida,
        punto_llegada,
        trayecto,
        longitud,
        id_usuario,
      });
      throw new Error(data.error || "Error registrando ruta");
    }
    return data;
  } catch (e) {
    console.error("Error en registerRoute:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Obtiene la información de una ruta por su ID, incluyendo los campos GeoJSON y los nombres legibles de partida y llegada.
 * @param {number} id_ruta - ID único de la ruta.
 * @param {0 | 1} full_data - Indicador para obtener datos completos (1) o solo los campos básicos (0).
 * @returns {Promise<RouteResponse>} Información de la ruta.
 */
export async function getRouteById(
  id_ruta: number,
  full_data: 0 | 1 = 1
): Promise<RouteResponse> {
  if (!id_ruta) {
    throw new Error("El id_ruta es requerido");
  }
  try {
    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-route-by-id",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${getCurrentToken()}`,
        },
        body: JSON.stringify({ id_ruta, full_data }),
      }
    );

    // Verificar si la respuesta es OK
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Intentar parsear la respuesta como JSON
    let data;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Error al parsear la respuesta:", parseError);
      throw new Error("Error al procesar la respuesta del servidor");
    }

    // Verificar si hay error en la respuesta
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (e) {
    console.error("Error en getRouteById:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
