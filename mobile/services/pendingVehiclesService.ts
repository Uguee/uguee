import { supabaseAnonKey } from "./documentService";

export async function getPendingVehiclesByIdUsuario(
  id_usuario: number
): Promise<number> {
  try {
    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-pending-vehicles-by-id_usuario",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ id_usuario }),
      }
    );
    if (!response.ok) throw new Error("Error consultando vehículos pendientes");
    const data = await response.json();
    return data.cantidad ?? 0;
  } catch (e) {
    console.error("Error en getPendingVehiclesByIdUsuario:", e);
    return 0;
  }
}

export async function getVehiclesByIdUsuario(
  id_usuario: number
): Promise<any[]> {
  try {
    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/get-vehicles-by-id_usuario",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ id_usuario }),
      }
    );
    if (!response.ok) throw new Error("Error consultando vehículos");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error en getVehiclesByIdUsuario:", e);
    return [];
  }
}
