import { useEffect, useState } from "react";
import { getPassengersByTripId } from "../services/tripServices";

/**
 * Hook para obtener el número de pasajeros por cada viaje terminado/completado.
 * @param trips Array de viajes
 * @returns { passengerCounts, loading }
 */
export function usePassengerCounts(
  trips: { id_viaje: string; estado: string }[]
) {
  const [passengerCounts, setPassengerCounts] = useState<{
    [id: string]: number;
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      setLoading(true);
      const counts: { [id: string]: number } = {};
      const terminados = trips.filter(
        (t) => t.estado === "completado" || t.estado === "terminado"
      );
      await Promise.all(
        terminados.map(async (trip) => {
          try {
            const passengers = await getPassengersByTripId(
              Number(trip.id_viaje)
            );
            counts[trip.id_viaje] = passengers ? passengers.length : 0;
          } catch {
            counts[trip.id_viaje] = 0;
          }
        })
      );
      if (isMounted) setPassengerCounts(counts);
      setLoading(false);
    };
    if (trips.length > 0) fetchCounts();
    return () => {
      isMounted = false;
    };
  }, [trips]);

  return { passengerCounts, loading };
}
