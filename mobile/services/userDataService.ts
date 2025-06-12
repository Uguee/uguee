import { getCurrentToken } from "./authService";
// Servicio: userDataService.ts
// Consulta la edge function `get-user-data-post` para obtener la fila completa
// de la tabla `usuarios` usando el uuid autenticado.

const SUPABASE_FUNCTIONS_BASE =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1";

const ENDPOINT = `${SUPABASE_FUNCTIONS_BASE}/get-user-data-post`;
export interface GetUserDataResponse {
  success: boolean;
  data?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    contrasena: string;
    rol: string | null;
    celular: number;
    uuid: string;
  };
  error?: string;
  details?: string;
}

/**
 * Obtiene los datos (fila completa) del usuario en la tabla `usuario`.
 * @param uuid UUID del usuario autenticado (auth.user.id)
 * @returns Objeto con los datos o null si no existe / falla
 */
export async function getUserDataByUUID(
  uuid: string
): Promise<GetUserDataResponse["data"] | null> {
  try {
    const currentToken = getCurrentToken();
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (anonKey) headers["Authorization"] = `Bearer ${currentToken}`;

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ uuid }),
    });

    if (!res.ok) {
      console.warn("[getUserDataByUUID] HTTP error", res.status);
      return null;
    }

    const json: GetUserDataResponse = await res.json();

    if (!json.success || json.error) {
      console.warn("[getUserDataByUUID] API error", json.error);
      return null;
    }

    console.log("[getUserDataByUUID] Success:", json.data);
    return json.data || null;
  } catch (err) {
    console.error("[getUserDataByUUID] Network/parse error", err);
    return null;
  }
}

/**
 * Devuelve la cédula del usuario (documento de identidad).
 * En este caso, se usa el campo 'celular' como cédula.
 * @param uuid UUID del usuario autenticado
 */
export async function getCedulaByUUID(uuid: string): Promise<number | null> {
  const user = await getUserDataByUUID(uuid);
  if (!user) return null;

  const cedula = user.id_usuario;

  return cedula ? Number(cedula) : null;
}
