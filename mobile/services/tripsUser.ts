import { getCurrentToken } from "./authService";

const SUPABASE_FUNCTIONS_BASE =
  "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1";
export async function obtenerViajesUsuario() {
  const token = await getCurrentToken();
  if (!token) {
    throw new Error("No se pudo obtener la sesión del usuario.");
  }

  console.log("🔐 Token que se va a enviar:", token);
  try {
    const response = await fetch(
      `${SUPABASE_FUNCTIONS_BASE}/get-trips-user-ts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("❌ Error en función obtener_viajes_usuario:", result);
      throw new Error(result.error || "Error desconocido al obtener viajes.");
    }

    return result.data; // Arreglo con los viajes del usuario
  } catch (err) {
    console.error("❌ Excepción en obtenerViajesUsuario:", err);
    throw err;
  }
}
