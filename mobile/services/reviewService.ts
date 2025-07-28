// Servicio para reseñas de viajes

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
 * Crea una reseña para un viaje terminado usando la edge function 'to-review-a-trip'.
 * @param {number} id_usuario - ID del usuario pasajero (numérico)
 * @param {number} id_viaje - ID del viaje
 * @param {number} calificacion - Calificación (1-5)
 * @param {string} descripcion - Comentario (máx 500 caracteres)
 * @param {string} jwt - Token JWT para autenticación
 * @returns {Promise<{ success: boolean; reseña?: any; error?: string }>} Resultado de la operación
 */
export async function createTripReview(
  id_usuario: number,
  id_viaje: number,
  calificacion: number,
  descripcion: string,
  jwt: string
): Promise<{ success: boolean; reseña?: any; error?: string }> {
  try {
    // Validaciones de entrada
    if (!id_usuario || !id_viaje || !calificacion || !jwt) {
      console.error("❌ [reviewService] Parámetros faltantes:", {
        id_usuario: !!id_usuario,
        id_viaje: !!id_viaje,
        calificacion: !!calificacion,
        jwt: !!jwt,
      });
      return { success: false, error: "Parámetros requeridos faltantes" };
    }

    if (calificacion < 1 || calificacion > 5) {
      console.error("❌ [reviewService] Calificación inválida:", calificacion);
      return {
        success: false,
        error: "La calificación debe estar entre 1 y 5",
      };
    }

    if (descripcion.length > 500) {
      console.error(
        "❌ [reviewService] Descripción muy larga:",
        descripcion.length
      );
      return {
        success: false,
        error: "La descripción no puede exceder 500 caracteres",
      };
    }

    console.log("🚀 [reviewService] Enviando reseña al servidor:", {
      id_usuario,
      id_viaje,
      calificacion,
      descripcion: descripcion.substring(0, 50) + "...",
      descripcion_length: descripcion.length,
      jwt_prefix: jwt.substring(0, 20) + "...",
    });

    const requestBody = {
      id_usuario,
      id_viaje,
      calificacion,
      descripcion: descripcion.trim(), // Limpiar espacios
    };

    const supabaseUrl =
      process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/to-review-a-trip`;

    console.log("🌐 [reviewService] URL de la edge function:", edgeFunctionUrl);

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📡 [reviewService] Respuesta HTTP:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const data = await response.json();
    console.log("📄 [reviewService] Datos de respuesta:", data);

    if (!response.ok) {
      console.error("❌ [reviewService] Error HTTP:", {
        status: response.status,
        error: data.error,
        data: data,
      });
      return {
        success: false,
        error:
          data.error || `Error HTTP ${response.status}: ${response.statusText}`,
      };
    }

    console.log("✅ [reviewService] Reseña creada exitosamente");
    return { success: true, reseña: data.reseña };
  } catch (error: any) {
    console.error("💥 [reviewService] Error inesperado:", error);
    return { success: false, error: error.message || "Error inesperado" };
  }
}
