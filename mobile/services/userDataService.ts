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
  uuid: string,
  retryCount: number = 0
): Promise<GetUserDataResponse["data"] | null> {
  console.log(
    `🔍 [getUserDataByUUID] Iniciando con uuid: ${uuid}, retryCount: ${retryCount}`
  );

  try {
    const currentToken = await getCurrentToken();
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    console.log(`🔑 [getUserDataByUUID] Token disponible:`, !!currentToken);
    console.log(`🔑 [getUserDataByUUID] AnonKey disponible:`, !!anonKey);

    if (!currentToken) {
      console.warn("❌ [getUserDataByUUID] No hay token disponible");
      return null;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    };

    console.log(`📤 [getUserDataByUUID] Enviando petición a: ${ENDPOINT}`);
    console.log(`📤 [getUserDataByUUID] Headers:`, {
      "Content-Type": headers["Content-Type"],
      Authorization: headers["Authorization"] ? "Bearer [TOKEN]" : "No token",
    });
    console.log(`📤 [getUserDataByUUID] Body:`, { uuid });

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ uuid }),
    });

    console.log(`📥 [getUserDataByUUID] Respuesta HTTP:`, {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    });

    if (!res.ok) {
      console.warn(
        `❌ [getUserDataByUUID] HTTP error ${res.status}: ${res.statusText}`
      );

      // Si es 401 y tenemos reintentos disponibles, esperar y reintentar
      if (res.status === 401 && retryCount < 3) {
        const delay = (retryCount + 1) * 1000;
        console.log(
          `⏳ [getUserDataByUUID] Error 401, reintentando en ${delay}ms... (${
            retryCount + 1
          }/3)`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return getUserDataByUUID(uuid, retryCount + 1);
      }

      console.error(
        `❌ [getUserDataByUUID] Error final después de ${retryCount} reintentos`
      );
      return null;
    }

    const json: GetUserDataResponse = await res.json();
    console.log(`📊 [getUserDataByUUID] Respuesta JSON:`, {
      success: json.success,
      hasData: !!json.data,
      error: json.error,
      details: json.details,
    });

    if (!json.success || json.error) {
      console.warn(`❌ [getUserDataByUUID] API error:`, json.error);
      return null;
    }

    console.log(`✅ [getUserDataByUUID] Success:`, json.data);
    return json.data || null;
  } catch (err) {
    console.error(`💥 [getUserDataByUUID] Network/parse error:`, err);
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

/**
 * Obtiene los datos del usuario por id_usuario (número).
 * @param id_usuario ID numérico del usuario
 * @returns Objeto con los datos o null si no existe / falla
 */
export async function getUserDataByIdUsuario(
  id_usuario: number
): Promise<GetUserDataResponse["data"] | null> {
  try {
    const currentToken = await getCurrentToken();
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (anonKey) headers["Authorization"] = `Bearer ${currentToken}`;

    const res = await fetch(`${SUPABASE_FUNCTIONS_BASE}/get-user-data-by-id`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id_usuario }),
    });

    if (!res.ok) {
      console.warn("[getUserDataByIdUsuario] HTTP error", res.status);
      return null;
    }

    const json: GetUserDataResponse = await res.json();

    if (!json.success || json.error) {
      console.warn("[getUserDataByIdUsuario] API error", json.error);
      return null;
    }

    return json.data || null;
  } catch (err) {
    console.error("[getUserDataByIdUsuario] Network/parse error", err);
    return null;
  }
}

/**
 * Verifica si el usuario está disponible en la base de datos con reintentos
 * @param uuid UUID del usuario
 * @param maxRetries Número máximo de reintentos
 * @returns true si el usuario está disponible, false en caso contrario
 */
export async function waitForUserAvailability(
  uuid: string,
  maxRetries: number = 5
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const userData = await getUserDataByUUID(uuid);
      if (userData) {
        console.log(
          `[waitForUserAvailability] Usuario disponible después de ${
            i + 1
          } intentos`
        );
        return true;
      }

      if (i < maxRetries - 1) {
        const delay = (i + 1) * 1000; // 1s, 2s, 3s, 4s, 5s
        console.log(
          `[waitForUserAvailability] Usuario no disponible, reintentando en ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.warn(
        `[waitForUserAvailability] Error en intento ${i + 1}:`,
        error
      );
    }
  }

  console.warn(
    `[waitForUserAvailability] Usuario no disponible después de ${maxRetries} intentos`
  );
  return false;
}

/**
 * Obtiene la cédula del usuario con reintentos automáticos
 * @param uuid UUID del usuario
 * @param maxRetries Número máximo de reintentos
 * @returns La cédula del usuario o null si no se puede obtener
 */
export async function getCedulaByUUIDWithRetry(
  uuid: string,
  maxRetries: number = 3
): Promise<number | null> {
  console.log(
    `🔄 [getCedulaByUUIDWithRetry] Iniciando con uuid: ${uuid}, maxRetries: ${maxRetries}`
  );

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(
        `📞 [getCedulaByUUIDWithRetry] Intento ${i + 1}/${maxRetries}`
      );
      const cedula = await getCedulaByUUID(uuid);
      console.log(
        `📊 [getCedulaByUUIDWithRetry] Resultado intento ${i + 1}:`,
        cedula
      );

      if (cedula) {
        console.log(
          `✅ [getCedulaByUUIDWithRetry] Cédula obtenida exitosamente en intento ${
            i + 1
          }:`,
          cedula
        );
        return cedula;
      }

      if (i < maxRetries - 1) {
        const delay = (i + 1) * 2000; // 2s, 4s, 6s
        console.log(
          `⏳ [getCedulaByUUIDWithRetry] Cédula no disponible, reintentando en ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.warn(
        `⚠️ [getCedulaByUUIDWithRetry] Error en intento ${i + 1}:`,
        error
      );
      if (i < maxRetries - 1) {
        const delay = (i + 1) * 2000;
        console.log(
          `⏳ [getCedulaByUUIDWithRetry] Esperando ${delay}ms antes del siguiente intento...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.warn(
    `❌ [getCedulaByUUIDWithRetry] No se pudo obtener la cédula después de ${maxRetries} intentos`
  );
  return null;
}
