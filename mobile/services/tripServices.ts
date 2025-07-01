import { supabase } from "../lib/supabase";
//implementa la edge function get-passengers-by-trip-id
import { getCurrentToken } from "./authService";

const TRIP_FUNCTION_URL =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/create-trip";

const GET_DRIVER_TRIPS_URL =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-trips-by-driver-id";

const START_TRIP_URL =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/start-trip";

const END_TRIP_URL =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/end-trip";

export interface Trip {
  id_viaje: string;
  estado:
    | "programado"
    | "pendiente"
    | "en-curso"
    | "completado"
    | "desconocido";
  programado_local: string;
  ruta: {
    id_ruta: string;
    nombre_partida: string | null;
    nombre_llegada: string | null;
  };
  vehiculo: {
    placa: string;
    modelo: string;
    tipo?: string;
    color?: string;
  };
  conductor?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
  programado_at: string;
  salida_at: string | null;
  llegada_at: string | null;
}

/**
 * Crea un nuevo viaje usando la edge function protegida por JWT.
 * @param {Object} params - Parámetros del viaje.
 * @param {number} params.id_conductor - ID del conductor (requerido).
 * @param {string} params.id_vehiculo - Placa del vehículo (requerido).
 * @param {number} params.id_ruta - ID de la ruta (requerido).
 * @param {string} [params.programado_at] - Fecha y hora de programación en formato ISO (opcional).
 * @param {string} token - JWT de Supabase Auth (requerido).
 * @returns {Promise<any>} Respuesta de la función edge.
 */
export async function createTrip(
  {
    id_conductor,
    id_vehiculo,
    id_ruta,
    programado_at,
  }: {
    id_conductor: number;
    id_vehiculo: string;
    id_ruta: number;
    programado_at?: string;
  },
  token: string
) {
  console.log("=== INICIO createTrip ===");
  console.log("Parámetros recibidos:", {
    id_conductor,
    id_vehiculo,
    id_ruta,
    programado_at,
  });

  if (!token) {
    console.error("Error: No hay token");
    throw new Error(
      "No se encontró un token JWT válido. Debes iniciar sesión."
    );
  }

  const body = {
    id_conductor,
    id_vehiculo,
    id_ruta,
    programado_at,
  };

  console.log("=== DATOS A ENVIAR ===");
  console.log(JSON.stringify(body, null, 2));
  console.log("Tipos de datos:", {
    id_conductor: typeof id_conductor,
    id_vehiculo: typeof id_vehiculo,
    id_ruta: typeof id_ruta,
    programado_at: typeof programado_at,
  });

  try {
    console.log("Enviando solicitud a:", TRIP_FUNCTION_URL);
    const res = await fetch(TRIP_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("Status de la respuesta:", res.status);

    const data = await res.json();
    console.log("=== RESPUESTA DEL SERVIDOR ===");
    console.log(JSON.stringify(data, null, 2));
    console.log("============================");

    if (!res.ok) {
      console.error("Error HTTP:", res.status);
      throw new Error(
        `Error HTTP: ${res.status} - ${data.error || "Error desconocido"}`
      );
    }

    if (data.success === false) {
      console.error("Error en la respuesta:", data.error);
      throw new Error(data.error || "Error al crear el viaje");
    }

    // Verificar que la respuesta tenga la estructura esperada
    if (!data.data || !data.data.id_viaje) {
      console.error("Respuesta inválida:", data);
      throw new Error("La respuesta del servidor no tiene el formato esperado");
    }

    console.log("=== FIN createTrip ===");
    return data.data;
  } catch (error) {
    console.error("Error en createTrip:", error);
    throw error;
  }
}

/**
 * Obtiene todos los viajes asociados a un conductor validado.
 * @param {number} id_usuario - Cédula del conductor.
 * @param {string} token - JWT de Supabase Auth.
 * @returns {Promise<Trip[]>} Lista de viajes con información enriquecida.
 */
export async function getDriverTrips(
  id_usuario: number,
  token: string
): Promise<Trip[]> {
  if (!token)
    throw new Error(
      "No se encontró un token JWT válido. Debes iniciar sesión."
    );
  if (!id_usuario)
    throw new Error("No se encontró el id_usuario del conductor.");

  console.log(
    "[getDriverTrips] Enviando solicitud con id_usuario:",
    id_usuario
  );

  const res = await fetch(GET_DRIVER_TRIPS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id_usuario }),
  });

  console.log("[getDriverTrips] Status de la respuesta:", res.status);

  const data = await res.json();
  console.log(
    "[getDriverTrips] Respuesta completa:",
    JSON.stringify(data, null, 2)
  );

  if (!res.ok) {
    throw new Error(
      `Error HTTP: ${res.status} - ${data.error || "Error desconocido"}`
    );
  }

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.viajes) {
    console.warn("[getDriverTrips] La respuesta no contiene el campo 'viajes'");
    return [];
  }

  // Validar que cada viaje tenga la estructura correcta
  const viajesValidos = data.viajes.filter((viaje: any) => {
    const esValido =
      viaje &&
      (typeof viaje.id_viaje === "string" ||
        typeof viaje.id_viaje === "number") &&
      viaje.ruta &&
      (typeof viaje.ruta.id_ruta === "string" ||
        typeof viaje.ruta.id_ruta === "number");

    if (!esValido) {
      console.warn("[getDriverTrips] Viaje inválido encontrado:", viaje);
    }

    return esValido;
  });

  console.log(
    "[getDriverTrips] Viajes válidos encontrados:",
    viajesValidos.length
  );

  return viajesValidos;
}

/**
 * Consulta los viajes de conductores de una institución específica.
 * @param id_institucion ID de la institución
 * @param how_trips Filtro temporal (0=Todos, 1=Hoy, 2=Futuros)
 * @param except_id_usuario (opcional) Excluir viajes de este conductor
 * @returns {Promise<{ viajes: Array<{ id_viaje: string, estado: string, programado_local: string, ruta: { id_ruta: string, nombre_partida: string, nombre_llegada: string }, vehiculo: { placa: string, modelo: string, color: string, tipo?: string }, conductor: { id_usuario: number, nombre: string, apellido: string }, ...rest }> }>
 */
export async function getTripsByInstitution(
  id_institucion: number,
  how_trips: number = 1,
  except_id_usuario?: number
) {
  const { getCurrentToken } = await import("./authService");
  const token = getCurrentToken && getCurrentToken();
  const body: any = { id_institucion, how_trips };
  if (except_id_usuario !== undefined)
    body.except_id_usuario = except_id_usuario;
  const response = await fetch(
    `${
      process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    }/functions/v1/get-trips-by-institution`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  const data = await response.json();
  console.log("[getTripsByInstitution] Respuesta completa:", data);
  if (!response.ok) {
    throw new Error(data.error || "Error al consultar viajes por institución");
  }
  if (data.viajes && data.viajes.length > 0) {
    console.log("[getTripsByInstitution] Primer viaje:", data.viajes[0]);
  }
  // data.viajes es un array de objetos con los nuevos campos conductor y vehiculo
  return data;
}

/**
 * Une un pasajero a un viaje usando la edge function join-a-trip-as-passenger
 * @param id_pasajero ID del pasajero (cédula)
 * @param id_conductor ID del conductor (cédula)
 * @param id_viaje ID del viaje
 * @returns Respuesta de la edge function
 */
export const joinTripAsPassenger = async (
  id_pasajero: number,
  id_conductor: number,
  id_viaje: number
) => {
  try {
    const token = await getCurrentToken();
    if (!token) {
      throw new Error("No se encontró un token de sesión válido");
    }

    console.log("[joinTripAsPassenger] Enviando datos:", {
      id_pasajero,
      id_conductor,
      id_viaje,
    });

    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/join-a-trip-as-passenger",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_pasajero,
          id_conductor,
          id_viaje,
        }),
      }
    );

    const data = await response.json();
    console.log("[joinTripAsPassenger] Respuesta:", data);

    if (!response.ok) {
      throw new Error(data.error || "Error al unirse al viaje");
    }

    return data;
  } catch (error) {
    console.error("[joinTripAsPassenger] Error:", error);
    throw error;
  }
};

/**
 * Obtiene los pasajeros de un viaje usando la edge function protegida por JWT.
 * @param id_viaje ID del viaje
 * @returns Array de pasajeros con nombre y apellido
 */
export async function getPassengersByTripId(id_viaje: number) {
  const token = await getCurrentToken();
  if (!token) throw new Error("No se encontró un token JWT válido");
  console.log("[getPassengersByTripId] id_viaje:", id_viaje);
  const response = await fetch(
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-passengers-by-trip-id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_viaje }),
    }
  );
  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.log("[getPassengersByTripId] Error parseando JSON:", e);
    data = null;
  }
  console.log("[getPassengersByTripId] status:", response.status);
  console.log("[getPassengersByTripId] respuesta completa:", data);
  if (!response.ok || !data?.success) {
    console.log("[getPassengersByTripId] Lanzando error:", data?.error, data);
    throw new Error(data?.error || "Error al obtener pasajeros del viaje");
  }
  console.log("[getPassengersByTripId] data:", data.data);
  return data.data;
}

/**
 * Marca el inicio de un viaje (salida_at = now()) validando el conductor.
 * @param id_viaje ID del viaje
 * @param id_conductor ID del conductor (usuario.id_usuario)
 * @returns {Promise<any>} Respuesta de la edge function
 */
export async function startTrip(id_viaje: number, id_conductor: number) {
  const token = await getCurrentToken();
  if (!token) throw new Error("No se encontró un token JWT válido");
  const body = { id_viaje, id_conductor };
  const response = await fetch(START_TRIP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || "Error al iniciar el viaje");
  }
  return data;
}

/**
 * Marca el final de un viaje (llegada_at = now()) validando el conductor.
 * @param id_viaje ID del viaje
 * @param id_conductor ID del conductor (usuario.id_usuario)
 * @returns {Promise<any>} Respuesta de la edge function
 */
export async function endTrip(id_viaje: number, id_conductor: number) {
  const token = await getCurrentToken();
  if (!token) throw new Error("No se encontró un token JWT válido");
  const body = { id_viaje, id_conductor };
  const response = await fetch(END_TRIP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || "Error al finalizar el viaje");
  }
  return data;
}

/**
 * Consulta la reseña de un usuario para un viaje específico usando la edge function 'obtener-resena-viaje'.
 * @param {number} id_usuario - ID del usuario
 * @param {number} id_viaje - ID del viaje
 * @param {string} jwt - Token JWT para autenticación
 * @returns {Promise<{ success: boolean; resena: { id_reseña: number; calificacion: number; descripcion: string } | null; error?: string }>}
 */
export async function getTripReview(
  id_usuario: number,
  id_viaje: number,
  jwt: string
) {
  try {
    const response = await fetch(
      `${
        process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      }/functions/v1/get-trip-review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ id_usuario, id_viaje }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        resena: null,
        error: data.error || "Error al consultar reseña",
      };
    }
    return { success: true, resena: data.resena };
  } catch (error: any) {
    return {
      success: false,
      resena: null,
      error: error.message || "Error inesperado",
    };
  }
}

/**
 * Consulta el viaje más relevante en el que el usuario participa como pasajero.
 * Usa la edge function 'get-active-passenger-trip'.
 * @param {number} id_usuario - ID del usuario
 * @param {string} jwt - Token JWT para autenticación
 * @returns {Promise<{ success: boolean; viajes: any[]; error?: string }>}
 */
export async function getActivePassengerTrip(id_usuario: number, jwt: string) {
  try {
    const response = await fetch(
      `${
        process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      }/functions/v1/get-active-passenger-trip`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ id_usuario }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        viajes: [],
        error: data.error || "Error al consultar viaje activo",
      };
    }
    return { success: true, viajes: data.viajes };
  } catch (error: any) {
    return {
      success: false,
      viajes: [],
      error: error.message || "Error inesperado",
    };
  }
}
