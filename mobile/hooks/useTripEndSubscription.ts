import { useEffect } from "react";
import { supabase } from "../lib/supabaseclient";

/**
 * Suscribe a cambios en la tabla 'viaje' para un viaje específico.
 * Llama a onTripEnd cuando el viaje termina (llegada_at deja de ser null).
 * @param idViaje ID del viaje a escuchar
 * @param onTripEnd Callback a ejecutar cuando el viaje termina
 */
export function useTripEndSubscription(
  idViaje: number | null | undefined,
  onTripEnd: (viaje: any) => void
) {
  useEffect(() => {
    if (!idViaje) return;

    console.log("[useTripEndSubscription] Suscribiendo a viaje:", idViaje);

    const subscription = supabase
      .from("viaje")
      .on("UPDATE", (payload: any) => {
        if (payload.new?.id_viaje !== idViaje) return;

        console.log("[useTripEndSubscription] Recibido UPDATE:", payload);
        if (!payload.old?.llegada_at && payload.new?.llegada_at) {
          console.log(
            "[useTripEndSubscription] ¡Viaje finalizado! Ejecutando callback con:",
            payload.new
          );
          try {
            onTripEnd(payload.new);
            console.log(
              "[useTripEndSubscription] Callback ejecutado correctamente"
            );
          } catch (e) {
            console.log("[useTripEndSubscription] Error en callback:", e);
          }
        } else {
          console.log(
            "[useTripEndSubscription] UPDATE recibido pero no es fin de viaje (llegada_at)"
          );
        }
      })
      .subscribe();

    return () => {
      console.log(
        "[useTripEndSubscription] Eliminando suscripción de viaje:",
        idViaje
      );
      supabase.removeSubscription(subscription);
    };
  }, [idViaje, onTripEnd]);
}
