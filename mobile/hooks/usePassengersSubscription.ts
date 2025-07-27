import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient";
import { getPassengersByTripId } from "../services/tripServices";

/**
 * Hook para suscribirse en tiempo real a los pasajeros de un viaje.
 * @param idViaje ID del viaje
 * @returns {Array} Lista de pasajeros actualizada en tiempo real
 */
export function usePassengersSubscription(idViaje: number | null | undefined) {
  const [passengers, setPassengers] = useState<any[]>([]);

  useEffect(() => {
    if (!idViaje) return;

    // Función para cargar los pasajeros actuales
    const fetchPassengers = async () => {
      try {
        const res = await getPassengersByTripId(idViaje);
        setPassengers(res || []);
      } catch (e) {
        setPassengers([]);
      }
    };

    fetchPassengers();

    // Suscribirse a cambios en la tabla pasajeros para este viaje
    const subscription = supabase
      .from(`pasajeros:id_viaje=eq.${idViaje}`)
      .on("INSERT", () => fetchPassengers())
      .on("DELETE", () => fetchPassengers())
      .on("UPDATE", () => fetchPassengers())
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [idViaje]);

  return passengers;
}
