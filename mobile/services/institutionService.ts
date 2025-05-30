import { Console } from "console";

const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export async function getInstitutions() {
  const response = await fetch(
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-institutions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener las instituciones");
  }
  return await response.json();
}

export async function sendRegisterToInstitutionApplication({
  id_usuario,
  id_institucion,
  correo_institucional,
  codigo_institucional,
  direccion_de_residencia,
  rol_institucional,
}: {
  id_usuario: number;
  id_institucion: number;
  correo_institucional: string;
  codigo_institucional: number;
  direccion_de_residencia: string;
  rol_institucional?: string;
}) {
  console.log("[sendRegisterToInstitutionApplication] Datos enviados:", {
    id_usuario,
    id_institucion,
    correo_institucional,
    codigo_institucional,
    direccion_de_residencia,
    rol_institucional,
  });
  const response = await fetch(
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/send-register-to-institution-application",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        id_usuario,
        id_institucion,
        correo_institucional,
        codigo_institucional,
        direccion_de_residencia,
        ...(rol_institucional && { rol_institucional }),
      }),
    }
  );
  const data = await response.json();
  return data;
}

export async function getRegisterValidationStatus({
  id_usuario,
  id_institucion,
}: {
  id_usuario: number;
  id_institucion: number;
}): Promise<"pendiente" | "denegado" | "validado" | null> {
  const response = await fetch(
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/register-validation-status",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ id_usuario, id_institucion }),
    }
  );
  const data = await response.json();
  if (!data.success)
    throw new Error(data.message || "Error consultando validación");
  return data.validacion ?? null;
}

/**
 * Consulta la primera institución aceptada para un usuario dado su id_usuario.
 * @param id_usuario número de usuario (cédula)
 * @returns id_institucion o null
 */
export async function getFirstInstitutionAcceptedByUser(
  id_usuario: number
): Promise<number | null> {
  const response = await fetch(
    "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-first-institution-accepted-by-user",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ id_usuario }),
    }
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Error consultando institución aceptada");
  }
  return data.id_institucion ?? null;
}

/*
export async function getInstitutionById(id: number) {
  const response = await fetch(
    `https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-institution-by-id?id=${id}`
  );
}
*/
