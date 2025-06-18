import { supabase } from "../lib/supabase";

export const joinTrip = async (id_viaje: number, id_usuario: number) => {
  try {
    const response = await fetch(
      "https://ezuujivxstyuziclhvhp.supabase.co/functions/v1/join-a-trip-as-passenger",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
        },
        body: JSON.stringify({
          id_viaje,
          id_usuario,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al unirse al viaje");
    }

    return data;
  } catch (error) {
    console.error("[passengerService] Error al unirse al viaje:", error);
    throw error;
  }
};
