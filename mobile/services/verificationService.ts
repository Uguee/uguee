// Servicio: verificationService.ts
// Descripción: provee funciones para consultar si un usuario (por cédula) está registrado
// en una institución y/o es conductor, consumiendo funciones serverless de Supabase.

import { getCedulaByUUID } from "./userDataService";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ANON_KEY;
export type InstitutionValidationStatus = "validado" | "pendiente" | "denegado";

export interface InstitutionValidationResponse {
  validacion?: InstitutionValidationStatus;
  error?: string;
}

export interface ConductorVerificationResponse {
  validacion?: InstitutionValidationStatus;
  error?: string;
}

// URL base de las funciones desplegadas en Supabase.
const SUPABASE_FUNCTIONS_BASE =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1";

const ENDPOINTS = {
  INSTITUTION_STATUS: `${SUPABASE_FUNCTIONS_BASE}/is-registered-to-institution`,
  CONDUCTOR_STATUS: `${SUPABASE_FUNCTIONS_BASE}/is-conductor-validated`,
};

/**
 * Realiza un GET al endpoint indicado y parsea la respuesta JSON.
 * Lanza un error si el status HTTP no es 2xx o si success === false.
 */
async function fetchAndValidate<T extends { success: boolean; error?: string }>(
  url: string
): Promise<T> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await res.json()) as T;

    if (!res.ok || !data.success) {
      const msg = data.error || `Error consultando ${url}`;
      throw new Error(msg);
    }

    return data;
  } catch (error: any) {
    // Re-lanzamos con un mensaje más claro.
    throw new Error(error?.message || "Error de conexión");
  }
}

/**
 * Obtiene el estado de validación del registro institucional del usuario.
 * @param uuid id_usuario (UUID) proveniente de Supabase auth
 * @returns 'validado' | 'pendiente' | 'denegado'
 */
export async function getInstitutionValidationStatus(
  uuid: string
): Promise<InstitutionValidationStatus | null> {
  // Traducir uuid (auth.user.id) a id_usuario de la tabla usuarios
  const idUsuario = await getCedulaByUUID(uuid);
  console.log("[getInstitutionValidationStatus] idUsuario:", idUsuario);
  if (!idUsuario) return null;

  const requestBody = { id_usuario: idUsuario };
  console.log("[getInstitutionValidationStatus] Sending:", requestBody);

  const res = await fetch(ENDPOINTS.INSTITUTION_STATUS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data: InstitutionValidationResponse = await res.json();

  console.log("[getInstitutionValidationStatus] Response:", {
    status: res.status,
    data,
    idUsuario,
  });

  if (!res.ok) {
    throw new Error(data.error || "Error obteniendo validación institucional");
  }
  console.log("[getInstitutionValidationStatus] data:", data);
  return data.validacion ?? null;
}

export async function getConductorValidationStatus(
  uuid: string
): Promise<InstitutionValidationStatus | null> {
  const idUsuario = await getCedulaByUUID(uuid);
  console.log("[getConductorValidationStatus] idUsuario:", idUsuario);
  if (!idUsuario) return null;

  const requestBody2 = { id_usuario: idUsuario };
  console.log("[getConductorValidationStatus] Sending:", requestBody2);

  const res = await fetch(ENDPOINTS.CONDUCTOR_STATUS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(requestBody2),
  });

  const data: ConductorVerificationResponse = await res.json();

  console.log("[getConductorValidationStatus] Response:", {
    status: res.status,
    data,
    idUsuario,
  });

  if (!res.ok) {
    throw new Error(data.error || "Error obteniendo validación de conductor");
  }
  console.log("[getConductorValidationStatus] data:", data);
  return data.validacion_conductor ?? null;
}
