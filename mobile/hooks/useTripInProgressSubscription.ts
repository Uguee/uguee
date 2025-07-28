import { useEffect } from "react";
import { supabase } from "../lib/supabaseclient";

/**
 * Suscribe a cambios en la tabla 'viajes' para un viaje específico.
 * Llama a onInProgress cuando el estado del viaje cambia a 'en-curso'.
 * @param idViaje ID del viaje a escuchar
 * @param onInProgress Callback a ejecutar cuando el viaje pase a 'en-curso'
 */
export function useTripInProgressSubscription(
  idViaje: number,
  onInProgress: (viaje: any) => void
) {
  useEffect(() => {
    if (!idViaje) return;

    const subscription = supabase
      .from(`viaje:id_viaje=eq.${idViaje}`)
      .on("UPDATE", (payload: any) => {
        if (!payload.old?.salida_at && payload.new?.salida_at) {
          onInProgress(payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [idViaje, onInProgress]);
}
