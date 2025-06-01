import { supabaseAnonKey } from "./documentService";

export async function registerRoute({
  punto_partida,
  punto_llegada,
  trayecto,
  longitud,
  id_usuario,
}: {
  punto_partida: { latitude: number; longitude: number };
  punto_llegada: { latitude: number; longitude: number };
  trayecto: { latitude: number; longitude: number }[];
  longitud: number;
  id_usuario: number;
}) {
  try {
    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/register-route",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          punto_partida,
          punto_llegada,
          trayecto,
          longitud,
          id_usuario,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error registrando ruta");
    return data;
  } catch (e) {
    console.error("Error en registerRoute:", e);
    return { success: false, error: e.message };
  }
}
