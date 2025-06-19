const TRIP_FUNCTION_URL =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/create-trip";

const GET_DRIVER_TRIPS_URL =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-trips-by-driver-id";

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
 * @param except_id_usuario (opcional) Excluir viajes de este usuario
 * @returns Respuesta de la edgefunction
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
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-trips-by-institution",
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
  return data;
}
