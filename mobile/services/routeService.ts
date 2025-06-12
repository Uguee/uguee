import { supabaseAnonKey } from "./documentService";
import { getCurrentToken } from "../services/authService";

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
 * @returns {Promise<any>} Información de la ruta.
 */
export async function getRouteById(id_ruta: number) {
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
        body: JSON.stringify({ id_ruta }),
      }
    );
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || "Error al obtener la ruta");
    }
    return data;
  } catch (e) {
    console.error("Error en getRouteById:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
