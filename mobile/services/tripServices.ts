const TRIP_FUNCTION_URL =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/create-trip";

const GET_DRIVER_TRIPS_URL =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-trips-by-driver-id";

/**
 * Crea un nuevo viaje usando la edge function protegida por JWT.
 * @param {Object} params - Parámetros del viaje.
 * @param {number} params.id_conductor - ID del conductor (requerido).
 * @param {string} params.id_vehiculo - Placa del vehículo (requerido).
 * @param {number} params.id_ruta - ID de la ruta (requerido).
 * @param {string} [params.fecha] - Fecha del viaje (YYYY-MM-DD, opcional).
 * @param {string} [params.hora_salida] - Hora de salida (HH:MM:SS, opcional).
 * @param {string} token - JWT de Supabase Auth (requerido).
 * @returns {Promise<any>} Respuesta de la función edge.
 */
export async function createTrip(
  {
    id_conductor,
    id_vehiculo,
    id_ruta,
    fecha,
    hora_salida,
  }: {
    id_conductor: number;
    id_vehiculo: string;
    id_ruta: number;
    fecha?: string;
    hora_salida?: string;
  },
  token: string
) {
  if (!token) {
    throw new Error(
      "No se encontró un token JWT válido. Debes iniciar sesión."
    );
  }

  const body = {
    id_conductor,
    id_vehiculo,
    id_ruta,
    ...(fecha ? { fecha } : {}),
    ...(hora_salida ? { hora_salida } : {}),
  };

  const res = await fetch(TRIP_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.error || "Error al crear el viaje");
  }

  return data.data;
}

/**
 * Obtiene todos los viajes asociados a un conductor validado.
 * @param {number} id_usuario - Cédula del conductor.
 * @param {string} token - JWT de Supabase Auth.
 * @returns {Promise<any[]>} Lista de viajes.
 */
export async function getDriverTrips(id_usuario: number, token: string) {
  if (!token)
    throw new Error(
      "No se encontró un token JWT válido. Debes iniciar sesión."
    );
  if (!id_usuario)
    throw new Error("No se encontró el id_usuario del conductor.");

  const res = await fetch(GET_DRIVER_TRIPS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id_usuario }),
  });

  const data = await res.json();
  console.log("[getDriverTrips] Respuesta:", data);
  if (!res.ok || data.error) {
    throw new Error(data.error || "Error al obtener los viajes del conductor");
  }
  // Devuelve solo el array de viajes o un array vacío
  return data.viajes || [];
}
