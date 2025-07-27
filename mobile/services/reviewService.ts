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
    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/to-review-a-trip",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          id_usuario,
          id_viaje,
          calificacion,
          descripcion,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || "Error al crear reseña" };
    }
    return { success: true, reseña: data.reseña };
  } catch (error: any) {
    return { success: false, error: error.message || "Error inesperado" };
  }
}
